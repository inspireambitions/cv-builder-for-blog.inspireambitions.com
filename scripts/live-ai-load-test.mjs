const url = process.argv[2];
const concurrency = Number(process.argv[3] || 10);

if (!url || !Number.isInteger(concurrency) || concurrency < 1 || concurrency > 50) {
  console.error("Usage: node scripts/live-ai-load-test.mjs <endpoint> <1-50>");
  process.exit(2);
}

function payload(index) {
  return {
    jobTitle: "Hotel Operations Manager",
    company: "Sample Luxury Hotel",
    jobDescription:
      "We seek a Hotel Operations Manager to lead front office and guest services, manage budgets, coach a multicultural team, improve guest satisfaction, coordinate with housekeeping and food and beverage teams, and deliver measurable service improvements in a UAE luxury hotel.",
    cvData: {
      step: 8,
      template: "corp",
      geo: "gulf",
      photo: null,
      personal: {
        name: `Load Test Candidate ${index}`,
        title: "Hotel Operations Manager",
        email: `load-test-${index}@example.com`,
        phone: `+971 50 000 ${String(index).padStart(4, "0")}`,
        location: "Dubai, UAE",
        linkedin: "",
        visa_status: "Employment",
        notice_period: "30 days",
        availability_date: "",
        noc_available: "Yes",
        nationality: "",
        include_date_of_birth: false,
        date_of_birth: "",
        include_marital_status: false,
        marital_status: "",
        arabic_proficiency: "Basic",
        sector_credentials: [],
      },
      summary:
        "Hotel operations manager with 12 years of experience leading guest services, budgets and teams across UAE luxury hotels.",
      experience: [
        {
          id: "exp-1",
          role: "Hotel Operations Manager",
          company: "Sample Hospitality Group",
          companyDesc: "",
          location: "Dubai, UAE",
          dates: "2018 to present",
          description:
            "Led a team of 35 employees across front office and guest services. Improved guest satisfaction from 82% to 91%. Managed annual operating budgets of AED 8 million.",
          gap: "",
        },
      ],
      education: [],
      certifications: [],
      skills: ["Hotel Operations", "Guest Experience", "Budget Management", "Team Leadership"],
      languages: [],
      achievements: [],
      volunteer: [],
      projects: [],
      publications: [],
      memberships: [],
      score: null,
      plan: "free",
    },
  };
}

async function run(index) {
  const started = Date.now();
  let last = { status: 0, body: {}, error: "" };
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-vercel-forwarded-for": `198.51.100.${index + 10}`,
        },
        body: JSON.stringify(payload(index)),
        signal: AbortSignal.timeout(360_000),
      });
      const body = await response.json().catch(() => ({}));
      last = { status: response.status, body, error: body.error || "" };
      if (response.ok || response.status !== 503) break;
    } catch (error) {
      last = { status: 0, body: {}, error: error instanceof Error ? error.message : String(error) };
    }
    if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 1_500 * (attempt + 1)));
  }
  return {
    index,
    status: last.status,
    durationMs: Date.now() - started,
    draftProvider: last.body.draftProvider || "",
    reviewProvider: last.body.reviewProvider || "",
    approved: last.body.review?.approved === true,
    integrity: last.body.integrity?.passed === true,
    error: last.error,
  };
}

const started = Date.now();
const results = await Promise.all(Array.from({ length: concurrency }, (_, index) => run(index + 1)));
const serviceFailures = results.filter(
  (item) => item.status !== 200 || item.draftProvider !== "grok-4.5" || !item.integrity
);
const durations = results.map((item) => item.durationMs).sort((a, b) => a - b);
const percentile = (p) => durations[Math.min(durations.length - 1, Math.ceil(durations.length * p) - 1)];
const errors = Object.entries(
  results.reduce((counts, item) => {
    if (item.error) counts[item.error] = (counts[item.error] || 0) + 1;
    return counts;
  }, {})
).map(([message, count]) => ({ message, count }));

console.log(
  JSON.stringify(
    {
      concurrency,
      wallTimeMs: Date.now() - started,
      completed: results.length,
      serviceSuccesses: results.length - serviceFailures.length,
      serviceFailures: serviceFailures.length,
      failureRate: serviceFailures.length / results.length,
      reviewerApproved: results.filter((item) => item.approved).length,
      integrityPassed: results.filter((item) => item.integrity).length,
      grok45Drafts: results.filter((item) => item.draftProvider === "grok-4.5").length,
      latencyMs: { min: durations[0], p50: percentile(0.5), p95: percentile(0.95), max: durations.at(-1) },
      statuses: results.reduce((counts, item) => {
        counts[item.status] = (counts[item.status] || 0) + 1;
        return counts;
      }, {}),
      errors,
    },
    null,
    2
  )
);

process.exit(serviceFailures.length > 0 ? 1 : 0);
