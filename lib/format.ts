"use client";

export function formatDateForUAE(value: string): string {
  if (!value.trim()) return "";

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day}/${month}/${year}`;
  }

  return value;
}

export function normaliseUAEPhoneForDisplay(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("971") && digits.length >= 11) {
    const local = digits.slice(3);
    return `+971 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 9)}`.trim();
  }

  if (digits.startsWith("0") && digits.length === 10) {
    return `+971 ${digits.slice(1, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }

  return trimmed;
}
