import { getRoleSuggestionGroup } from "./role-suggestions";

const EXAMPLES: Record<string, [string, string, string, string]> = {
  "housekeeping": ["Room Attendant", "5-star hotel, Dubai", "Housekeeping certificate", "Housekeeping procedures"],
  "kitchen-steward": ["Kitchen Steward", "Hotel kitchen", "Food safety certificate", "Kitchen cleaning"],
  "food-service": ["Waiter", "Restaurant", "Food service certificate", "Guest service"],
  "culinary": ["Commis Chef", "Hotel kitchen", "Catering certificate", "Food preparation"],
  "front-office": ["Front Desk Agent", "Hotel", "Hospitality diploma", "Guest check-in"],
  "hr": ["HR Assistant", "HR department", "HR certificate", "Employee records"],
  "administration": ["Office Assistant", "Office", "Office skills certificate", "Record keeping"],
  "security": ["Security Guard", "Security company", "Security training", "Safety checks"],
  "driver": ["Driver", "Transport company", "Driver training", "Safe driving"],
  "cleaning": ["Cleaner", "Cleaning company", "Cleaning training", "Safe chemical use"],
  "retail-sales": ["Shop Assistant", "Retail shop", "Secondary school", "Customer service"],
  "customer-service": ["Customer Service Agent", "Service centre", "Customer service training", "Handling customer requests"],
  "warehouse": ["Warehouse Assistant", "Warehouse", "Warehouse training", "Stock checks"],
  "construction": ["Site Worker", "Building contractor", "Trade certificate", "Site safety"],
  "healthcare": ["Healthcare Assistant", "Clinic", "Care certificate", "Patient care"],
  "finance": ["Accounts Assistant", "Accounts office", "Accounting certificate", "Invoice checks"],
  "education": ["Teaching Assistant", "School", "Teaching certificate", "Classroom support"],
  "technology": ["IT Support Assistant", "IT company", "IT certificate", "Computer support"],
};

export function getRoleExamples(role: string) {
  const family = getRoleSuggestionGroup(role);
  const [title, company, education, skill] = EXAMPLES[family.key] ?? ["Your job title", "Your workplace", "Your course or school level", "A skill you use at work"];
  return { title, company, education, skill, duty: family.key === "general" ? "Add one duty or result per line." : family.sentences[0], institution: "Your school or training centre", grade: "Your grade, if you want to add it" };
}
