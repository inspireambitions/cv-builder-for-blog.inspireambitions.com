import type { GeoType } from "./types";

export async function detectGeo(): Promise<GeoType> {
  try {
    const res = await fetch("/api/detect-geo", {
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!res.ok) return "global";
    const data = await res.json();
    return data.geo === "gulf" ? "gulf" : "global";
  } catch {
    return "global"; // Graceful fallback on any error
  }
}
