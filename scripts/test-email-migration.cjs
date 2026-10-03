/* eslint-disable @typescript-eslint/no-require-imports -- The VM verifier loads CommonJS compiler output. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require(process.argv[2] || 'typescript');
const root = path.resolve(__dirname, '..');

function load(file, dependencies, env, fetch) {
  const source = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  });
  assert.equal(source.diagnostics.filter(d => d.category === ts.DiagnosticCategory.Error).length, 0);
  const compiled = { exports: {} };
  vm.runInNewContext(source.outputText, {
    module: compiled, exports: compiled.exports,
    require: name => dependencies[name] || require(name),
    process: { env }, fetch, AbortSignal, URL,
    console: { error() {} },
  }, { filename: file });
  return compiled.exports;
}

async function scenario(mode, payload = { email: 'migration-test@example.com', firstName: 'Test', format: 'pdf' }) {
  const calls = [];
  const env = { RESEND_API_KEY: 'test-only', IA_CV_EMAIL_BRIDGE_SECRET: 'test-only' };
  if (mode === 'missing-config') delete env.IA_CV_EMAIL_BRIDGE_SECRET;
  const fetch = async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith('/contacts')) return new Response('{}', { status: mode === 'contact-failure' ? 500 : 200 });
    assert.equal(url, 'https://inspireambitions.com/wp-json/ia-mail/v1/cv-welcome');
    if (mode === 'timeout') throw new Error('Controlled timeout');
    if (mode === 'rate-limit') return new Response('{}', { status: 429 });
    if (mode === 'pending') return new Response('{}', { status: 503 });
    return Response.json({ sent: mode !== 'rejected', deduped: false });
  };
  const helper = load('lib/transactional-email.ts', {}, env, fetch);
  const route = load('app/api/subscribe/route.ts', {
    '@/lib/transactional-email': helper,
    'next/server': { NextResponse: { json: Response.json } },
  }, env, fetch);
  const response = await route.POST({ json: async () => payload });
  return { status: response.status, body: await response.json(), calls };
}

(async () => {
  const happy = await scenario('success');
  assert.equal(happy.body.contactSaved, true);
  assert.equal(happy.body.emailSent, true);
  assert.equal(happy.calls.filter(c => c.url.endsWith('/contacts')).length, 1);
  assert.equal(happy.calls.filter(c => c.url.endsWith('/cv-welcome')).length, 1);
  assert.equal(happy.calls.some(c => c.url.endsWith('/emails')), false);
  const email = JSON.parse(happy.calls.at(-1).options.body);
  assert.equal(email.email, 'migration-test@example.com');
  assert.equal(email.firstName, 'Test');
  assert.equal(happy.calls.at(-1).options.headers.Authorization, 'Bearer test-only');
  for (const mode of ['rate-limit', 'timeout', 'rejected', 'pending', 'missing-config']) {
    const result = await scenario(mode);
    assert.equal(result.status, 200);
    assert.equal(result.body.success, true);
    assert.equal(result.body.contactSaved, true);
    assert.equal(result.body.emailSent, false);
    assert.match(result.body.warning, /download is ready/);
    assert.ok(result.calls.filter(c => c.url.endsWith('/cv-welcome')).length <= 1);
    assert.equal(result.calls.some(c => c.url.endsWith('/emails')), false);
  }
  const contactFailure = await scenario('contact-failure');
  assert.equal(contactFailure.body.contactSaved, false);
  assert.equal(contactFailure.body.emailSent, true);
  const invalid = await scenario('success', { email: 'invalid' });
  assert.equal(invalid.status, 400);
  assert.equal(invalid.calls.length, 0);
  console.log('8 migration scenarios passed: authenticated bridge, subscriber preservation, four send failures, missing configuration, contact outage and invalid input.');
})().catch(error => { console.error(error); process.exitCode = 1; });
