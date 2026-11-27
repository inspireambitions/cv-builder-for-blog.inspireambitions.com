import { findRoleSuggestionFamily } from "./role-suggestions";

export type DetailOption = { label: string; bullet: string };
export type RoleDetailQuestion = { id: string; prompt: string; options: DetailOption[] };

const tools: Record<string, [prompt: string, pattern: string, choices: string[]]> = {
  "reservations": ["Which booking system did you use?","Use {} to make and change bookings.",["Opera","Protel","Microsoft Excel","Paper records"]],
  "cashier": ["Which payment system did you use?","Use {} to process payments.",["Micros","Shopify POS","Lightspeed","Cash register"]],
  "barista": ["Which machine did you use?","Prepare drinks using {}.",["An espresso machine","A batch brewer","A manual pour-over station"]],
  "receptionist": ["How did you track visitors?","Record visitor arrivals using {}.",["A visitor log","Microsoft Excel","A visitor management system"]],
  "call-centre": ["Which case system did you use?","Record customer calls in {}.",["Zendesk","Freshdesk","Salesforce","Microsoft Dynamics"]],
  "sales-assistant": ["Which tool did you use to check stock?","Check product stock in {}.",["Shopify","SAP","Microsoft Excel","A paper stock list"]],
  "concierge": ["Which records did you work with?","Update {} at the bell desk.",["The luggage log","The taxi booking sheet","The guest request log"]],
  "laundry": ["Which equipment did you use?","Operate {} in the laundry.",["Industrial washers","Tumble dryers","Linen presses","Steam irons"]],
  "kitchen-helper": ["Which preparation tools did you use?","Prepare ingredients using {}.",["Digital scales","A vegetable slicer","A food processor"]],
  "delivery-rider": ["How did you track orders?","Track delivery orders using {}.",["A delivery app","WhatsApp","Paper delivery lists"]],
  "heavy-driver": ["What did you drive?","Drive {} on assigned routes.",["A school bus","A coach","A heavy goods truck","A tanker","A trailer truck"]],
  "storekeeper": ["Which system held your stock records?","Update stock records in {}.",["SAP","Oracle","Microsoft Excel","A paper stock ledger"]],
  "domestic": ["What helped you track routines?","Track household routines using {}.",["A daily diary","A household calendar","An agreed checklist"]],
  "beautician": ["Which appointment system did you use?","Manage bookings in {}.",["Fresha","Treatwell","Microsoft Excel","A booking diary"]],
  "gym-lifeguard": ["Which checks did you record?","Record {} before opening.",["Pool checks","Gym equipment checks","Facility safety checks"]],
  "labourer": ["Which supplies did you move?","Move {} to marked site storage.",["Blocks and tiles","Timber","Cement bags","Protective barriers"]],
  "mason": ["Which materials did you work with?","Finish surfaces using {}.",["Concrete blocks","Clay bricks","Ceramic tiles","Cement plaster"]],
  "electrician": ["Which testing tool did you use?","Record test readings using {}.",["A multimeter","A clamp meter","An insulation tester"]],
  "plumber": ["Which fixtures did you repair?","Repair {} during maintenance visits.",["Leaking taps","Toilet cisterns","Shower fittings","Drain connections"]],
  "ac-technician": ["Which systems did you maintain?","Maintain {} during scheduled service.",["Split units","Fan coil units","Air handling units","Chillers"]],
  "accounts-clerk": ["Which accounts system did you use?","Record accounts entries in {}.",["QuickBooks","Tally","SAP","Oracle","Microsoft Excel"]],
  "data-entry": ["Which system did you enter data in?","Enter records and check totals in {}.",["Microsoft Excel","SAP","Oracle","Google Sheets"]],
  "teacher-assistant": ["What did you help pupils with?","Support pupils during {}.",["Reading practice","Number work","Classroom activities","Language exercises"]],
  "nurse-assistant": ["Which records did you use?","Update {} under nursing supervision.",["Paper observation charts","Electronic care records","Daily care logs"]],
  "kitchen-steward": ["Which equipment did you use?","Clean kitchen equipment using {}.",["An industrial dishwasher","A pot wash station","A sanitising sink"]],
  "housekeeping": ["How did you track room status?","Update room status using {}.",["Opera","A room checklist","A shift log"]],
  "food-service": ["How did you take orders?","Enter customer orders using {}.",["Micros","A handheld till","An order pad"]],
  "culinary": ["What did you check during service?","Check {} before dishes leave the kitchen.",["Food temperature","Portion sizes","Dish presentation"]],
  "front-office": ["Which property system did you use?","Update guest records in {}.",["Opera","Protel","Cloudbeds"]],
  "hr": ["Which staff system did you use?","Update staff records in {}.",["Workday","SAP SuccessFactors","Microsoft Excel"]],
  "administration": ["How did you keep records?","Keep office records in {}.",["Microsoft Excel","SharePoint","A paper filing system"]],
  "retail-sales": ["Which sales system did you use?","Record store sales in {}.",["Shopify POS","Lightspeed","Micros"]],
  "customer-service": ["Where did you track cases?","Record customer requests in {}.",["Zendesk","Freshdesk","Salesforce","A shared case log"]],
  "security": ["How did you log incidents?","Record incidents in {}.",["A site logbook","A dispatch system","An incident form"]],
  "driver": ["How did you record trips?","Record journeys in {}.",["A mileage log","A route app","A driver logbook"]],
  "warehouse": ["Which stock system did you use?","Update warehouse stock in {}.",["SAP","Oracle","Microsoft Excel","A stock ledger"]],
  "cleaning": ["How did you track completed areas?","Record cleaned areas in {}.",["A cleaning schedule","A shift log","A shared checklist"]],
  "healthcare": ["Which records did you update?","Update {} under the care team's instructions.",["Care logs","Observation charts","Electronic care records"]],
  "construction": ["Which drawings or records did you use?","Follow {} for assigned site work.",["Site drawings","Work orders","Daily task sheets"]],
  "finance": ["Which finance system did you use?","Record financial entries in {}.",["SAP","Oracle","Tally","QuickBooks"]],
  "technology": ["Which tool did you use to track work?","Record work and faults in {}.",["Jira","ServiceNow","GitHub","Azure DevOps"]],
};

const properCase = /^(?:Opera|Protel|Microsoft|Google|Micros|Shopify|Lightspeed|Zendesk|Freshdesk|Salesforce|SAP|Oracle|WhatsApp|QuickBooks|Tally|Fresha|Treatwell|Cloudbeds|Workday|SharePoint|Jira|ServiceNow|GitHub|Azure)/;
function addChoices(id: string, prompt: string, pattern: string, options: string[]): RoleDetailQuestion {
  return { id, prompt, options: options.map((label) => ({ label, bullet: pattern.replace("{}", properCase.test(label) ? label : label[0].toLowerCase() + label.slice(1)) })) };
}

const reservationDetails: RoleDetailQuestion[] = [
  { id: "volume", prompt: "About how many guest calls did you handle a day?", options: [
    { label: "Under 20", bullet: "Handle fewer than 20 guest calls a day." },
    { label: "20 to 40", bullet: "Handle about 20 to 40 guest calls a day." },
    { label: "40 to 80", bullet: "Handle about 40 to 80 guest calls a day." },
    { label: "80 or more", bullet: "Handle 80 or more guest calls a day." },
  ] },
  addChoices("channel", "How did guests book with you?", "Take bookings by {}.", ["Phone", "Email", "WhatsApp"]),
  { id: "achievement", prompt: "What are you proud of?", options: [
    { label: "Trained new staff", bullet: "Train new team members to handle bookings." },
    { label: "Good guest comments", bullet: "Receive positive guest comments on booking support." },
    { label: "Employee award", bullet: "Receive an employee award." },
  ] },
];

export function getRoleDetails(familyKey: string): RoleDetailQuestion[] {
  const family = findRoleSuggestionFamily(familyKey);
  const spec = tools[familyKey];
  if (!family || !spec) return [];
  const [prompt, pattern, options] = spec;
  const first = addChoices("tool", prompt, pattern, options);
  if (familyKey === "reservations") return [first, ...reservationDetails];
  const asOptions = (sentences: string[]) => sentences.map((bullet) => ({ label: bullet.replace(/\.$/, ""), bullet }));
  return [
    first,
    { id: "duty", prompt: "Which task did you do often?", options: asOptions(family.sentences.slice(0, 3)) },
    { id: "check", prompt: "What else did you do in this job?", options: asOptions(family.sentences.slice(3, 6)) },
  ];
}

export function applyRoleDetail(current: string, question: RoleDetailQuestion, bullet: string) {
  const key = (text: string) => text.replace(/^[•*\-]\s*/, "").trim().replace(/\.$/, "").toLowerCase();
  const selectable = new Set(question.options.map((option) => key(option.bullet)));
  const retained = current.split(/\r?\n/).filter((line) => line.trim() && !selectable.has(key(line)));
  return [...retained, bullet.trim()].filter(Boolean).join("\n");
}

