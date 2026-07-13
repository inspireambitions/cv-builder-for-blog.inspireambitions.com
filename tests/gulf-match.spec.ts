import { expect, test } from "@playwright/test";
import { computeGulfMatchScore } from "@/lib/gulf-match";
import { defaultCVState } from "@/lib/types";

function matchedCv() {
  return {
    ...defaultCVState,
    personal: { ...defaultCVState.personal, title: "AML Compliance Manager", location: "Dubai", visa_status: "Employment" as const, notice_period: "30 days", nationality: "Ugandan", driving_license: "UAE light vehicle" },
    summary: "AML compliance manager with anti-money laundering and KYC leadership experience.",
    skills: ["AML", "KYC", "risk management", "stakeholder management", "regulatory reporting"],
    experience: [{ id: "e1", role: "AML Compliance Manager", company: "Regional Bank", companyDesc: "", location: "Dubai", dates: "2018 to 2026", description: "Reduced compliance exceptions by 35% through KYC controls.", gap: "" }],
  };
}

test("Gulf Match Score is deterministic for identical inputs", () => {
  const state = matchedCv();
  const jd = "AML Compliance Manager required with 5 years of KYC, anti-money laundering, regulatory reporting and risk management experience in Dubai.";
  expect(computeGulfMatchScore(state, jd, "AML Compliance Manager")).toEqual(computeGulfMatchScore(state, jd, "AML Compliance Manager"));
});

test("synonyms and GCC compliance improve the score", () => {
  const state = matchedCv();
  const jd = "Anti-money laundering manager with KYC and regulatory reporting experience.";
  const ready = computeGulfMatchScore(state, jd, "AML Manager");
  const empty = computeGulfMatchScore(defaultCVState, jd, "AML Manager");
  expect(ready.score).toBeGreaterThan(empty.score);
  expect(ready.components.gcc).toBe(15);
});

test("driving licence is required only for relevant vacancies", () => {
  const state = matchedCv();
  state.personal.driving_license = "";
  expect(computeGulfMatchScore(state, "Office-based compliance role.").compliance.find((item) => item.label === "Driving licence stated")?.met).toBe(true);
  expect(computeGulfMatchScore(state, "Field and site work. UAE driving licence required.").compliance.find((item) => item.label === "Driving licence stated")?.met).toBe(false);
});
