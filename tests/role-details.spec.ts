import { expect, test } from "@playwright/test";
import { getRoleSuggestionGroup, ROLE_SUGGESTION_FAMILIES } from "../lib/role-suggestions";
import { applyRoleDetail, getRoleDetails } from "../lib/role-details";
import { getVerbForms } from "../lib/verb-forms";

const titleSets: Record<string, string> = {
  "reservations": "Reservation Agent|Reservations Agent|Reservations Sales Agent|Reservation Clerk|Booking Agent|Room Reservations|Reservations Executive|Booking Coordinator|Reservation Officer|Reservations Coordinator",
  "cashier": "Cashier|Supermarket Cashier|Checkout Operator|Till Operator|Payment Clerk|Checkout Assistant|Restaurant Cashier",
  "barista": "Barista|Barrista|Coffee Specialist|Espresso Attendant|Coffee Attendant|Coffee Server|Coffee Maker",
  "receptionist": "Receptionist|Clinic Receptionist|Office Receptionist|Reception Assistant|Reception Coordinator|Reception Clerk|Desk Receptionist",
  "call-centre": "Call Centre Agent|Call Center Operator|Contact Centre Adviser|Contact Center Representative|Telephone Operator|Telesales Agent|Customer Service Representative",
  "sales-assistant": "Retail Sales Associate|Sales Assistant|Shop Assistant|Counter Sales Advisor|Sales Promoter|Floor Sales|Sales Adviser",
  "concierge": "Concierge|Bellman|Bellmen|Bell Attendant|Luggage Porter|Hotel Porter|Doorman",
  "laundry": "Laundry Attendant|Linen Room Attendant|Laundry Operator|Laundry Presser|Laundry Assistant|Laundry Sorter|Dry Cleaner",
  "kitchen-helper": "Kitchen Helper|Kitchen Assistant|Kitchen Aide|Food Prep Assistant|Prep Cook|Food Preparation Assistant|Hospital Kitchen Helper",
  "delivery-rider": "Delivery Rider|Bike Rider|Motorcycle Courier|Bike Courier|Food Delivery Rider|Parcel Rider|Bike Delivery",
  "heavy-driver": "Bus Driver|School Bus Driver|Heavy Vehicle Driver|Heavy Truck Driver|Trailer Driver|Tanker Driver|Tipper Driver|Bus Operator",
  "storekeeper": "Storekeeper|Store Keeper|Stock Keeper|Stock Controller|Stores Clerk|Stores Custodian|Inventory Clerk",
  "domestic": "Nanny|Babysitter|Childminder|Domestic Worker|Domestic Helper|Housemaid|Live-in Maid",
  "beautician": "Beautician|Beauty Therapist|Salon Assistant|Nail Technician|Manicurist|Pedicurist|Waxing Therapist",
  "gym-lifeguard": "Lifeguard|Life Guard|Gym Attendant|Personal Trainer|Pool Attendant|Swim Coach|Fitness Instructor",
  "labourer": "Labourer|Laborer|Site Helper|Construction Helper|General Worker|Site Operative|General Helper",
  "mason": "Mason|Bricklayer|Block Layer|Tile Setter|Tiler|Plasterer|Tile Mason",
  "electrician": "Electrician|Electrical Technician|Electrical Fitter|Electrical Assistant|Electrical Foreman|Wireman|Maintenance Electrician",
  "plumber": "Plumber|Pipefitter|Pipe Fitter|Plumbing Technician|Plumbing Helper|Sanitary Fitter|Plumbing Foreman",
  "ac-technician": "AC Technician|A/C Tech|HVAC Technician|Air Conditioning Mechanic|Chiller Technician|Refrigeration Fitter|HVAC Helper",
  "accounts-clerk": "Accounts Clerk|Accounts Assistant|Junior Accountant|Payables Clerk|Receivables Assistant|Invoice Clerk|Ledger Clerk",
  "data-entry": "Data Entry Clerk|Data-entry Operator|Data Encoders|Data Capturer|Data Processor|Records Input Clerk|Information Entry Clerk",
  "teacher-assistant": "Teaching Assistant|Teacher Assistant|Teacher's Aide|Classroom Assistant|Learning Support Assistant|Nursery Assistant|School Aide",
  "nurse-assistant": "Nurse Assistant|Nursing Aide|Nurse's Attendant|Healthcare Assistant|Patient Care Assistant|Clinical Support Assistant|Nursing Assistant",
};

test("matches at least 150 distinct Gulf job titles to the expected family", () => {
  const titleCount = new Set(Object.values(titleSets).flatMap((group) => group.split("|")));
  expect(titleCount.size).toBeGreaterThanOrEqual(150);
  for (const [family, group] of Object.entries(titleSets)) for (const role of group.split("|")) {
    expect(getRoleSuggestionGroup(role).key, role).toBe(family);
  }
  expect(getRoleSuggestionGroup("Hotel Receptionist").key).toBe("front-office");
  expect(getRoleSuggestionGroup("Unlisted Role").sentences).toEqual([]);
  expect(getRoleSuggestionGroup("Room Attendant", "Electrician").key).toBe("housekeeping");
});

test("new families offer ten distinct concrete duties and each family asks optional questions", () => {
  for (const family of ROLE_SUGGESTION_FAMILIES) {
    const questions = getRoleDetails(family.key);
    expect(questions.length, family.key).toBeGreaterThanOrEqual(3);
    expect(questions.length, family.key).toBeLessThanOrEqual(5);
    expect(questions.every((question) => question.options.length > 1)).toBeTruthy();
    if (!(family.key in titleSets)) continue;
    expect(new Set(family.sentences).size, family.key).toBeGreaterThanOrEqual(10);
    expect(family.sentences.length, family.key).toBeLessThanOrEqual(12);
    for (const sentence of family.sentences) {
      const verb = sentence.split(" ")[0].toLowerCase();
      expect(getVerbForms(verb)?.base, sentence).toBe(verb);
    }
  }
});

test("never pre-populates a volume and replaces a changed choice without removing other facts", () => {
  const [system, volume] = getRoleDetails("reservations");
  const original = "Recorded guest requests in a shift log.";
  const withSystem = applyRoleDetail(original, system, system.options[0].bullet);
  expect(withSystem).not.toMatch(/\d/);
  const withVolume = applyRoleDetail(withSystem, volume, volume.options[1].bullet);
  expect(withVolume).toContain("Handle about 20 to 40 guest calls a day.");
  const changed = applyRoleDetail(withVolume, volume, volume.options[3].bullet);
  expect(changed).toContain("Handle 80 or more guest calls a day.");
  expect(changed).not.toContain("20 to 40");
  expect(changed).toContain(original);
  expect(changed).toContain("Use Opera to make and change bookings.");
});

