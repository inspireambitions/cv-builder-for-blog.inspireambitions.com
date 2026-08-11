export interface RoleSuggestionGroup {
  key: string;
  label: string;
  matches: RegExp;
  sentences: string[];
}

const GROUPS: RoleSuggestionGroup[] = [
  {
    key: "kitchen-steward",
    label: "Kitchen steward",
    matches: /kitchen steward|galley steward|dishwasher|kitchen porter|restaurant steward/,
    sentences: [
      "Cleaned kitchen, food preparation and storage areas to the required hygiene standard.",
      "Operated industrial dishwashers and washed cookware, utensils, glassware and serving dishes.",
      "Handled cleaning chemicals and equipment in line with safety instructions.",
      "Removed waste and kept bins, floors and work areas clean during busy service periods.",
      "Reported damaged equipment and low cleaning stock to the supervisor.",
      "Supported the kitchen team during preparation, service and closing duties.",
    ],
  },
  {
    key: "housekeeping",
    label: "Housekeeping",
    matches: /housekeep|room attendant|public area attendant|cabin steward|laundry attendant/,
    sentences: [
      "Cleaned guest rooms and public areas to the required standard and schedule.",
      "Changed bed linen, replaced towels and restocked guest supplies.",
      "Reported maintenance faults, damage and lost property through the correct process.",
      "Used cleaning chemicals and equipment in line with safety instructions.",
      "Responded to guest requests with care and passed urgent issues to the supervisor.",
      "Checked completed rooms before release and corrected any missed items.",
    ],
  },
  {
    key: "food-service",
    label: "Restaurant and food service",
    matches: /waiter|waitress|server|food.*beverage|f&b|barista|bartender|restaurant host/,
    sentences: [
      "Welcomed guests, explained menu items and recorded orders with care.",
      "Served food and drinks while following hygiene and presentation standards.",
      "Checked on guests during service and handled requests with the team.",
      "Prepared and reset tables before, during and after service.",
      "Processed bills and payments using the restaurant payment system.",
      "Reported allergies and special requests to the kitchen before service.",
    ],
  },
  {
    key: "culinary",
    label: "Chef and kitchen work",
    matches: /chef|cook|commis|culinary|kitchen assistant/,
    sentences: [
      "Prepared ingredients and dishes by following recipes and portion standards.",
      "Checked food quality, temperature and presentation before service.",
      "Kept preparation areas, tools and equipment clean and ready for use.",
      "Labelled and stored food in line with hygiene and stock rotation rules.",
      "Reported low stock and helped prepare orders for the next service.",
      "Worked with the kitchen team to complete orders during busy periods.",
    ],
  },
  {
    key: "front-office",
    label: "Hotel front office",
    matches: /front desk|front office|guest relation|hotel receptionist|concierge|reservations agent/,
    sentences: [
      "Welcomed guests and completed check-in and check-out procedures.",
      "Answered guest questions and shared accurate information about hotel services.",
      "Updated bookings and guest details in the property management system.",
      "Handled guest concerns and passed unresolved matters to the right manager.",
      "Coordinated with housekeeping and other departments on room status and guest requests.",
      "Balanced payments and completed shift handover records.",
    ],
  },
  {
    key: "hr",
    label: "Human resources",
    matches: /human resources|\bhr\b|recruit|talent acquisition|people operations|personnel/,
    sentences: [
      "Updated employee records and checked that required documents were complete.",
      "Scheduled interviews and kept candidates informed during the hiring process.",
      "Prepared onboarding documents and supported new employees during their first days.",
      "Answered employee questions and passed sensitive cases to the right HR colleague.",
      "Tracked leave, attendance or training records using the company system.",
      "Handled employee information with care and followed confidentiality rules.",
    ],
  },
  {
    key: "administration",
    label: "Administration and reception",
    matches: /administrator|administrative|office assistant|secretary|receptionist|data entry|document controller/,
    sentences: [
      "Answered calls and emails and directed each request to the right person.",
      "Prepared documents, updated records and kept electronic files organised.",
      "Scheduled meetings and helped colleagues manage appointments and deadlines.",
      "Welcomed visitors and followed the office sign-in process.",
      "Checked forms and supporting documents before submitting them.",
      "Ordered office supplies and reported low stock before items ran out.",
    ],
  },
  {
    key: "retail-sales",
    label: "Retail and sales",
    matches: /sales|retail|cashier|shop assistant|store assistant|merchandis/,
    sentences: [
      "Helped customers choose products based on their needs and budget.",
      "Processed cash and card payments and issued receipts.",
      "Restocked shelves and kept product displays clean and accurate.",
      "Checked prices, labels and stock levels and reported differences.",
      "Handled returns and customer concerns in line with store policy.",
      "Shared product information and current offers with customers.",
    ],
  },
  {
    key: "customer-service",
    label: "Customer service",
    matches: /customer service|call centre|call center|contact centre|contact center|customer support/,
    sentences: [
      "Answered customer questions and explained the available service or next step.",
      "Recorded each request and kept customer details accurate.",
      "Handled complaints within company rules and passed difficult cases to the supervisor.",
      "Followed up on open requests and kept customers informed.",
      "Used the company system to update cases, notes and outcomes.",
      "Worked with other teams to resolve customer problems.",
    ],
  },
  {
    key: "security",
    label: "Security",
    matches: /security|guard|loss prevention|control room|cctv/,
    sentences: [
      "Monitored entrances and checked access in line with site rules.",
      "Patrolled assigned areas and recorded safety or security concerns.",
      "Responded to incidents and contacted the supervisor or emergency services when required.",
      "Completed clear shift handovers and incident reports.",
      "Monitored CCTV and reported unusual activity.",
      "Helped visitors and staff follow site safety procedures.",
    ],
  },
  {
    key: "driver",
    label: "Driving and delivery",
    matches: /driver|chauffeur|delivery rider|courier|bus operator/,
    sentences: [
      "Completed daily vehicle checks and reported faults before starting work.",
      "Planned routes and completed journeys within the agreed schedule.",
      "Loaded, secured and delivered items with the required documents.",
      "Kept the vehicle clean and maintained fuel and mileage records.",
      "Followed road safety rules and company driving procedures.",
      "Confirmed deliveries and reported delays to the dispatcher.",
    ],
  },
  {
    key: "warehouse",
    label: "Warehouse and logistics",
    matches: /warehouse|storekeeper|picker|packer|logistic|inventory|forklift|supply chain/,
    sentences: [
      "Received goods and checked quantities against delivery documents.",
      "Stored items in the correct location and kept aisles clear and safe.",
      "Picked and packed orders and checked each item before dispatch.",
      "Updated stock records and reported missing or damaged items.",
      "Used handling equipment in line with safety procedures.",
      "Supported stock counts and investigated differences with the team.",
    ],
  },
  {
    key: "cleaning",
    label: "Cleaning",
    matches: /cleaner|cleaning operative|janitor|custodian|facilities attendant/,
    sentences: [
      "Cleaned assigned areas to the required standard and schedule.",
      "Swept, mopped, dusted and sanitised surfaces using the correct equipment.",
      "Handled cleaning chemicals in line with labels and safety instructions.",
      "Removed waste and kept bins and service areas clean.",
      "Reported maintenance problems, damage and low stock to the supervisor.",
      "Placed warning signs and kept work areas safe while cleaning.",
    ],
  },
  {
    key: "healthcare",
    label: "Healthcare support",
    matches: /nurse|caregiver|healthcare assistant|care assistant|medical assistant|patient care/,
    sentences: [
      "Supported patients with daily care while protecting their privacy and dignity.",
      "Recorded observations and reported changes to the responsible clinician.",
      "Followed infection prevention, hand hygiene and waste disposal procedures.",
      "Prepared rooms, equipment and supplies for patient care.",
      "Explained routine steps to patients and responded to questions with care.",
      "Kept patient information accurate and confidential.",
    ],
  },
  {
    key: "construction",
    label: "Construction and site work",
    matches: /construction|site engineer|civil engineer|electrician|plumber|technician|carpenter|mason|welder/,
    sentences: [
      "Completed assigned work from drawings, instructions and site schedules.",
      "Checked tools and equipment before use and reported faults.",
      "Followed site safety rules and used the required protective equipment.",
      "Measured materials and checked completed work against requirements.",
      "Kept the work area clean and stored tools and materials safely.",
      "Reported progress, delays and safety concerns to the supervisor.",
    ],
  },
  {
    key: "finance",
    label: "Finance and accounts",
    matches: /account|finance|bookkeep|payroll|audit|credit control|cash office/,
    sentences: [
      "Checked invoices and supporting documents before recording transactions.",
      "Updated financial records and corrected differences with supporting evidence.",
      "Prepared account, payment or expense reports for review.",
      "Followed approval steps and kept financial documents organised.",
      "Responded to account queries and worked with colleagues to resolve differences.",
      "Handled financial information with care and followed confidentiality rules.",
    ],
  },
  {
    key: "technology",
    label: "Technology",
    matches: /software|developer|information technology|\bit\b|helpdesk|data analyst|cyber|systems|network/,
    sentences: [
      "Investigated user or system issues and recorded the steps taken to resolve them.",
      "Tested changes before release and reported defects with clear evidence.",
      "Updated technical records, tickets or user guides after completing work.",
      "Worked with colleagues to understand requirements and agree next steps.",
      "Protected access details and followed company data security procedures.",
      "Explained technical issues to users in clear language.",
    ],
  },
];

export const GENERAL_ROLE_SUGGESTIONS: RoleSuggestionGroup = {
  key: "general",
  label: "General work",
  matches: /.*/,
  sentences: [
    "Completed assigned duties in line with company procedures and deadlines.",
    "Helped customers or colleagues and passed difficult issues to the supervisor.",
    "Kept work records accurate and reported problems without delay.",
    "Checked tools, stock or documents before starting each task.",
    "Worked with the team to complete daily duties during busy periods.",
    "Followed safety rules and kept the work area clean and organised.",
  ],
};

export function getRoleSuggestionGroup(role: string, targetRole = "") {
  const value = `${role} ${targetRole}`.trim().toLowerCase();
  return GROUPS.find((group) => group.matches.test(value)) ?? GENERAL_ROLE_SUGGESTIONS;
}

export function appendExperienceSentence(current: string, sentence: string) {
  const lines = current
    .split("\n")
    .map((line) => line.replace(/^[•-]\s*/, "").trim())
    .filter(Boolean);
  if (lines.some((line) => line.toLowerCase() === sentence.toLowerCase())) return current;
  return [...lines, sentence].join("\n");
}
