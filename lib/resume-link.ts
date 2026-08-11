"use client";

import type { CVState } from "./types";
import { getCleanBuilderUrl } from "./clean-url";

const RESUME_HASH_KEY = "resume";
const RESUME_LINK_VERSION = 1;

type ResumeLinkPayload = {
  version: number;
  savedAt: string;
  state: CVState;
};

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(index, index + chunkSize));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(
    Math.ceil(value.length / 4) * 4,
    "="
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function importAesKey(keyBytes: Uint8Array, usages: KeyUsage[]) {
  const rawKey = keyBytes.buffer.slice(
    keyBytes.byteOffset,
    keyBytes.byteOffset + keyBytes.byteLength
  ) as ArrayBuffer;
  return crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM" }, false, usages);
}

export async function createResumeLink(state: CVState) {
  const keyBytes = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await importAesKey(keyBytes, ["encrypt"]);
  const payload: ResumeLinkPayload = {
    version: RESUME_LINK_VERSION,
    savedAt: new Date().toISOString(),
    state: { ...state, score: null },
  };

  const plaintext = new TextEncoder().encode(JSON.stringify(payload));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);

  const url = getCleanBuilderUrl();
  url.hash = `${RESUME_HASH_KEY}=${[
    toBase64Url(new Uint8Array(encrypted)),
    toBase64Url(iv),
    toBase64Url(keyBytes),
  ].join(".")}`;
  return url.toString();
}

export async function readResumeLinkFromHash(hash = window.location.hash) {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const encoded = params.get(RESUME_HASH_KEY);
  if (!encoded) return null;

  const [encryptedValue, ivValue, keyValue] = encoded.split(".");
  if (!encryptedValue || !ivValue || !keyValue) {
    throw new Error("Resume link is incomplete.");
  }

  const encrypted = fromBase64Url(encryptedValue);
  const iv = fromBase64Url(ivValue);
  const keyBytes = fromBase64Url(keyValue);
  const key = await importAesKey(keyBytes, ["decrypt"]);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encrypted);
  const payload = JSON.parse(new TextDecoder().decode(decrypted)) as ResumeLinkPayload;

  if (!payload?.state || payload.version !== RESUME_LINK_VERSION) {
    throw new Error("Resume link version is not supported.");
  }

  return payload;
}

export function removeResumeHash() {
  if (typeof window === "undefined") return;
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
}
