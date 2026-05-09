import type {
  ArabicProficiency,
  CVState,
  MaritalStatus,
  NocAvailable,
  SectorCredentialAuthority,
  SectorCredentialEntry,
  VisaStatus,
} from "./types";

export const VISA_STATUS_OPTIONS: VisaStatus[] = [
  "",
  "Employment",
  "Golden",
  "Investor",
  "Visit",
  "Cancelled",
  "Outside UAE",
  "Prefer not to say",
];

export const NOC_OPTIONS: NocAvailable[] = [
  "",
  "Yes",
  "No",
  "Not applicable",
];

export const ARABIC_PROFICIENCY_OPTIONS: ArabicProficiency[] = [
  "",
  "None",
  "Basic",
  "Conversational",
  "Fluent",
  "Native",
];

export const MARITAL_STATUS_OPTIONS: MaritalStatus[] = [
  "",
  "Single",
  "Married",
  "Divorced",
  "Widowed",
  "Prefer not to say",
];

export const SECTOR_CREDENTIAL_OPTIONS: SectorCredentialAuthority[] = [
  "DHA",
  "DOH",
  "MOH",
  "RERA",
  "KHDA",
  "ADEK",
  "WPS",
  "MOHRE",
  "VAT",
  "SOCPA",
  "Other",
];

export const NATIONALITY_OPTIONS = [
  "United Arab Emirates",
  "India",
  "Pakistan",
  "Philippines",
  "Sri Lanka",
  "Nepal",
  "Bangladesh",
  "Egypt",
  "Jordan",
  "Lebanon",
  "Syria",
  "Morocco",
  "Tunisia",
  "South Africa",
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "France",
  "Germany",
  "Italy",
  "Spain",
  "Prefer not to say",
];

export function getSelectedSectorCredentials(
  state: CVState
): SectorCredentialEntry[] {
  return state.personal.sector_credentials.filter((credential) =>
    credential.authority.trim()
  );
}

export function formatSectorCredential(
  credential: SectorCredentialEntry
): string {
  const details = [
    credential.license_no ? `Licence: ${credential.license_no}` : "",
    credential.expiry_date ? `Expiry: ${credential.expiry_date}` : "",
  ].filter(Boolean);

  return details.length
    ? `${credential.authority} (${details.join(", ")})`
    : credential.authority;
}

export function getUAEHeaderParts(state: CVState): string[] {
  const { personal } = state;
  return [
    personal.visa_status && personal.visa_status !== "Prefer not to say"
      ? `Visa: ${personal.visa_status}`
      : "",
    personal.notice_period ? `Notice: ${personal.notice_period}` : "",
    personal.availability_date
      ? `Available: ${personal.availability_date}`
      : "",
    personal.noc_available ? `NOC: ${personal.noc_available}` : "",
    personal.nationality && personal.nationality !== "Prefer not to say"
      ? `Nationality: ${personal.nationality}`
      : "",
    personal.arabic_proficiency
      ? `Arabic: ${personal.arabic_proficiency}`
      : "",
    personal.include_date_of_birth && personal.date_of_birth
      ? `Date of birth: ${personal.date_of_birth}`
      : "",
    personal.include_marital_status && personal.marital_status
      ? `Marital status: ${personal.marital_status}`
      : "",
  ].filter(Boolean);
}

export function hasUAEDetails(state: CVState): boolean {
  return (
    getUAEHeaderParts(state).length > 0 ||
    getSelectedSectorCredentials(state).length > 0
  );
}
