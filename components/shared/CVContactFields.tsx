"use client";

import { useState } from "react";
import { validatePhone } from "@/lib/validators";

const dialCodes = [
  ["+971", "UAE"], ["+966", "Saudi Arabia"], ["+974", "Qatar"], ["+965", "Kuwait"],
  ["+973", "Bahrain"], ["+968", "Oman"], ["+880", "Bangladesh"], ["+20", "Egypt"],
  ["+251", "Ethiopia"], ["+91", "India"], ["+254", "Kenya"], ["+977", "Nepal"],
  ["+234", "Nigeria"], ["+92", "Pakistan"], ["+63", "Philippines"], ["+27", "South Africa"],
  ["+94", "Sri Lanka"], ["+256", "Uganda"], ["+44", "UK"], ["+1", "US and Canada"],
].sort((a, b) => b[0].length - a[0].length);
const inputStyle = "mt-1 block min-h-12 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 text-base text-gray-900 focus-visible:outline-2 focus-visible:outline-gold-600";

export function PhoneField({ phone, onChange, placeholder }: { phone: string; onChange: (value: string) => void; placeholder: string }) {
  const [touched, setTouched] = useState(false);
  const selected = dialCodes.find(([code]) => phone.trim().startsWith(code))?.[0] ?? "";
  const validation = validatePhone(phone);
  const invalid = touched && !!phone.trim() && !validation.valid;
  function changeCode(code: string) {
    const saved = phone.trim();
    if (!code) {
      if (selected) onChange(saved.slice(selected.length).trim());
      return;
    }
    // Do not attach a second code to other international numbers.
    const national = selected ? saved.slice(selected.length).trim() : saved.startsWith("+") ? "" : saved;
    if (!selected && saved.startsWith("+") && national === "") return;
    onChange(national ? `${code} ${national}` : `${code} `);
  }
  return (
    <fieldset className="min-w-0">
      <legend className="text-sm font-semibold text-gray-800">Phone number</legend>
      <div className="mt-1 grid grid-cols-[minmax(5.8rem,.85fr)_minmax(0,1.4fr)] gap-2">
        <label className="min-w-0 text-xs text-gray-700">Country code
          <select className={inputStyle} value={selected} onChange={(event) => changeCode(event.target.value)}>
            <option value="">Type any code</option>
            {dialCodes.map(([code, label]) => <option key={code} value={code}>{code} {label}</option>)}
          </select>
        </label>
        <label className="min-w-0 text-xs text-gray-700">Number
          <input data-cv-fix="phone" aria-label="Phone number" type="tel" inputMode="tel" autoComplete="tel" dir="ltr"
            value={phone} onChange={(event) => onChange(event.target.value)} onBlur={() => setTouched(true)}
            placeholder={placeholder} aria-invalid={invalid || undefined} className={inputStyle} />
        </label>
      </div>
      {invalid && <p role="status" className="mt-1 text-sm text-red-700">{validation.warning}</p>}
    </fieldset>
  );
}

export function LocationFields({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const separator = value.search(/[,،]/);
  const city = separator < 0 ? value : value.slice(0, separator);
  const country = separator < 0 ? "" : value.slice(separator + 1).replace(/^ /, "");
  return <fieldset className="min-w-0">
    <legend className="text-sm font-semibold text-gray-800">Where are you based?</legend>
    <div className="mt-1 grid grid-cols-2 gap-2">
      <label className="min-w-0 text-xs text-gray-700">City
        <input data-cv-fix={!city.trim() || country.trim() ? "location" : undefined} value={city} autoComplete="address-level2"
          onChange={(event) => onChange(country ? `${event.target.value}, ${country}` : event.target.value)}
          placeholder="Dubai" className={inputStyle} />
      </label>
      <label className="min-w-0 text-xs text-gray-700">Country
        <input data-cv-fix={city.trim() && !country.trim() ? "location" : undefined} value={country} autoComplete="country-name"
          onChange={(event) => onChange(event.target.value ? `${city}, ${event.target.value}` : city)}
          placeholder="UAE" className={inputStyle} />
      </label>
    </div>
  </fieldset>;
}
