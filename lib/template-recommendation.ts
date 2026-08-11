import type { TemplateType } from "./types";

export function recommendTemplateForTitle(value: string): TemplateType {
  const title = value.toLowerCase();

  if (
    /cruise|steward|galley|kitchen|hotel|hospitality|housekeep|room attendant|restaurant|food|guest/.test(
      title
    )
  ) {
    return "service";
  }
  if (/nurse|doctor|health|clinic|medical|pharma/.test(title)) return "care";
  if (/engineer|construction|architect|site/.test(title)) return "site";
  if (/developer|software|data|technology|cyber|product/.test(title)) return "stack";
  if (/finance|account|bank|audit/.test(title)) return "ledger";
  if (/aviation|cabin crew|airport|flight/.test(title)) return "crew";
  if (/logistic|retail|driver|warehouse|supply/.test(title)) return "move";
  if (/director|chief|head|executive|manager/.test(title)) return "corner";
  return "classic";
}
