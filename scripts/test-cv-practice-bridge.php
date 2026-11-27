<?php
// Standalone test. The WordPress functions below use memory and never send mail.
const DAY_IN_SECONDS = 86400;
$options = [
    'ia_cv_mail_bridge_secret_hash' => 'fixture-hash',
    'fluentmail-settings' => [
        'misc' => ['default_connection' => 'fixture'],
        'connections' => ['fixture' => ['provider_settings' => ['provider' => 'cloudflare']]],
    ],
];
$mail = [];
$simulate_failure = false;
class WP_Error {
    public function __construct(public $code, public $message, public $data) {}
}
class FixtureRequest {
    public function __construct(private $method, private $params, private $authorised = true) {}
    public function get_method() { return $this->method; }
    public function get_header($name) { return $this->authorised ? 'Bearer fixture-secret' : ''; }
    public function get_param($name) { return $this->params[$name] ?? null; }
}
function add_action($name, $handler) { if ($name === 'rest_api_init') $handler(); }
function register_rest_route($namespace, $path, $args) { $GLOBALS['route'] = $args; }
function current_user_can($cap) { return false; }
function wp_check_password($secret, $hash) { return $secret === 'fixture-secret' && $hash === 'fixture-hash'; }
function get_option($key, $default = false) { return $GLOBALS['options'][$key] ?? $default; }
function add_option($key, $value, ...$rest) {
    if (array_key_exists($key, $GLOBALS['options'])) return false;
    $GLOBALS['options'][$key] = $value;
    return true;
}
function update_option($key, $value, ...$rest) { $GLOBALS['options'][$key] = $value; }
function delete_option($key) { unset($GLOBALS['options'][$key]); }
function wp_schedule_single_event(...$args) { return true; }
function rest_ensure_response($value) { return $value; }
function sanitize_text_field($value) { return trim(strip_tags($value)); }
function sanitize_key($value) { return preg_replace('/[^a-z0-9_-]/', '', strtolower($value)); }
function is_email($value) { return filter_var($value, FILTER_VALIDATE_EMAIL) !== false; }
function wp_json_encode($value) { return json_encode($value, JSON_THROW_ON_ERROR); }
function wp_salt($type) { return 'fictional-salt'; }
function esc_html($value) { return htmlspecialchars($value, ENT_QUOTES, 'UTF-8'); }
function wp_mail($email, $subject, $html, $headers) {
    $GLOBALS['mail'][] = compact('email', 'subject', 'html', 'headers');
    return !$GLOBALS['simulate_failure'];
}
function check($value, $reason) {
    if (!$value) throw new RuntimeException($reason);
}
function fixture_request($method, $params = [], $authorised = true) {
    $request = new FixtureRequest($method, $params, $authorised);
    $permission = $GLOBALS['route']['permission_callback']($request);
    return $permission === true ? $GLOBALS['route']['callback']($request) : $permission;
}
require __DIR__.'/../wordpress/ia-cv-email-bridge.php';

$status = fixture_request('GET');
check($status['ready'] && $status['practiceLinkSupported'], 'Bridge must report its practice capability');
$payload = ['email' => 'One@example.com', 'firstName' => 'Ria & Sam', 'format' => 'pdf_ats', 'requestPracticeLink' => true];
check(fixture_request('POST', $payload, false)->code === 'bridge_unauthorised', 'Bridge must authenticate');
check(count($mail) === 0, 'Unauthorised request sent mail');
$first = fixture_request('POST', $payload);
check($first['sent'] && $first['practiceLinkIncluded'] && !$first['deduped'], 'Practice link must be included once');
check(str_contains($mail[0]['html'], 'https://trymuqabala.com/practice'), 'Practice link missing');
check(str_contains($mail[0]['html'], 'Ria &amp; Sam'), 'Greeting must be escaped');
check(!str_contains($mail[0]['html'], 'Trustpilot'), 'Requested message contains extra promotion');
$second = fixture_request('POST', array_replace($payload, ['email' => 'one@example.com', 'firstName' => 'Ria', 'format' => 'word']));
check($second['deduped'] && $second['practiceLinkIncluded'] && count($mail) === 1, 'Duplicate request sent twice');

$plain = fixture_request('POST', array_replace($payload, ['requestPracticeLink' => 'true']));
check($plain['sent'] && !$plain['practiceLinkIncluded'] && !str_contains($mail[1]['html'], 'trymuqabala.com/practice'), 'An unchecked request received a practice link');
$options['fluentmail-settings']['connections']['fixture']['provider_settings']['provider'] = 'other';
check(fixture_request('POST', $payload)->code === 'cloudflare_unavailable' && count($mail) === 2, 'Bridge used a non-Cloudflare sender');
$options['fluentmail-settings']['connections']['fixture']['provider_settings']['provider'] = 'cloudflare';
$simulate_failure = true;
$failed = array_replace($payload, ['email' => 'failure@example.com']);
check(fixture_request('POST', $failed)->code === 'email_failed', 'Mail outage must be surfaced');
check(fixture_request('POST', $failed)->code === 'send_pending' && count($mail) === 3, 'An uncertain send was retried');
echo "PHP bridge checks passed: opt-in, duplicates, sender guard, failure, and transport capability.\n";
