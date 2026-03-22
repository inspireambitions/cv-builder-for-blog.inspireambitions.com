import { GCC_MENA_CODES } from "./constants";
import type { GeoType } from "./types";

export async function detectGeo(): Promise<GeoType> {
  try {
    const res = await fetch("https://ipapi.co/json/", {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return "global";
    const data = await res.json();
    return GCC_MENA_CODES.includes(data.country_code) ? "gulf" : "global";
  } catch {
    return "global"; // Graceful fallback on any error
  }
}
