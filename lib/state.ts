"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import type { ReactNode } from "react";
import type { CVState } from "./types";
import { defaultCVState } from "./types";
import { readResumeLinkFromHash, removeResumeHash } from "./resume-link";
import React from "react";

interface CVContextValue {
  state: CVState;
  setState: React.Dispatch<React.SetStateAction<CVState>>;
  hydrated: boolean;
  updateField: (partial: Partial<CVState>) => void;
  updatePersonal: (partial: Partial<CVState["personal"]>) => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetState: () => void;
  restoredAt: string | null;
  dismissRestoreBanner: () => void;
}

const CVContext = createContext<CVContextValue | null>(null);

const STORAGE_KEY = "inspireambitions-cv-state";
const DRAFTS_KEY = "inspireambitions-cv-drafts";
const ACTIVE_DRAFT_ID_KEY = "inspireambitions-cv-active-draft-id";
const STORAGE_VERSION = 4;
const DRAFT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

interface StoredDraft {
  id?: string;
  version: number;
  savedAt: string;
  state: CVState;
}

type DraftStore = Record<string, StoredDraft>;

function normalizeState(value: unknown): CVState | null {
  if (!value || typeof value !== "object") return null;
  const incoming = value as Partial<CVState>;
  const personal = incoming.personal ?? {};
  const legacyTemplateMap: Record<string, CVState["template"]> = {
    corp: "ledger",
    min: "stack",
    gulf: "classic",
    cre: "service",
  };
  const incomingTemplate = typeof incoming.template === "string" ? incoming.template : "";
  const validTemplates: CVState["template"][] = ["classic", "site", "service", "care", "ledger", "crew", "stack", "move", "corner"];
  const template = validTemplates.includes(incomingTemplate as CVState["template"])
    ? incomingTemplate as CVState["template"]
    : legacyTemplateMap[incomingTemplate] ?? defaultCVState.template;

  return {
    ...defaultCVState,
    ...incoming,
    template,
    cvLanguage: incoming.cvLanguage === "ar" ? "ar" : "en",
    personal: {
      ...defaultCVState.personal,
      ...personal,
      sector_credentials: Array.isArray(
        (personal as Partial<CVState["personal"]>).sector_credentials
      )
        ? (personal as Partial<CVState["personal"]>).sector_credentials ?? []
        : [],
    },
    score: null,
  };
}

function getActiveDraftId() {
  if (typeof window === "undefined") return "default";
  const existing = localStorage.getItem(ACTIVE_DRAFT_ID_KEY);
  if (existing) return existing;
  const nextId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `draft-${Date.now()}`;
  localStorage.setItem(ACTIVE_DRAFT_ID_KEY, nextId);
  return nextId;
}

function loadDraftStore(): DraftStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    return raw ? (JSON.parse(raw) as DraftStore) : {};
  } catch {
    return {};
  }
}

function saveDraft(state: CVState) {
  if (typeof window === "undefined") return null;
  const toSave = { ...state, score: null };
  const id = getActiveDraftId();
  const draft: StoredDraft = {
    id,
    version: STORAGE_VERSION,
    savedAt: new Date().toISOString(),
    state: toSave,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  const drafts = loadDraftStore();
  drafts[id] = draft;
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  window.dispatchEvent(new Event("cv-saved"));
  return draft.savedAt;
}

function validateStoredDraft(parsed: unknown): { state: CVState; savedAt: string } | null {
  if (!parsed || typeof parsed !== "object") return null;
  const draft = parsed as Partial<StoredDraft>;
  const savedAt =
    typeof draft.savedAt === "string" ? draft.savedAt : new Date().toISOString();
  const savedTime = new Date(savedAt).getTime();
  if (Number.isFinite(savedTime) && Date.now() - savedTime > DRAFT_TTL_MS) {
    return null;
  }

  const draftState = draft.state ? draft.state : parsed;
  const state = normalizeState(draftState);
  return state ? { state, savedAt } : null;
}

function loadSavedState(): { state: CVState; savedAt: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const draftId = localStorage.getItem(ACTIVE_DRAFT_ID_KEY);
    const drafts = loadDraftStore();
    if (draftId && drafts[draftId]) {
      const stored = validateStoredDraft(drafts[draftId]);
      if (stored) return stored;
      delete drafts[draftId];
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const stored = validateStoredDraft(parsed);
      if (!stored) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      saveDraft(stored.state);
      return stored;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

export function CVProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CVState>(defaultCVState);
  const [hydrated, setHydrated] = useState(false);
  const [restoredAt, setRestoredAt] = useState<string | null>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestState = useRef<CVState>(defaultCVState);

  // Hydrate from an encrypted resume link first, then localStorage.
  useEffect(() => {
    let mounted = true;

    async function hydrateDraft() {
      try {
        const linkedDraft = await readResumeLinkFromHash();
        if (linkedDraft && mounted) {
          const linkedState = normalizeState(linkedDraft.state);
          if (linkedState) {
            setState(linkedState);
            latestState.current = linkedState;
            const savedAt = saveDraft(linkedState) ?? linkedDraft.savedAt;
            setRestoredAt(savedAt);
            removeResumeHash();
            setHydrated(true);
            return;
          }
        }
      } catch {
        // Fall back to the local draft if the shared link is damaged.
      }

      if (!mounted) return;
      const draft = loadSavedState();
      if (draft) {
        setState(draft.state);
        latestState.current = draft.state;
        setRestoredAt(draft.savedAt);
      }
      setHydrated(true);
    }

    hydrateDraft();
    return () => {
      mounted = false;
    };
  }, []);

  // Save to localStorage on every state change (debounced 300ms, flushed on exit).
  useEffect(() => {
    latestState.current = state;
    if (!hydrated) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      try {
        saveDraft(latestState.current);
      } catch {
        // Storage full or unavailable
      }
    }, 300);
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [state, hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    const flushDraft = () => {
      try {
        saveDraft(latestState.current);
      } catch {
        // Storage full or unavailable
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") flushDraft();
    };

    window.addEventListener("pagehide", flushDraft);
    window.addEventListener("beforeunload", flushDraft);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", flushDraft);
      window.removeEventListener("beforeunload", flushDraft);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hydrated]);

  const updateField = useCallback((partial: Partial<CVState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const updatePersonal = useCallback(
    (partial: Partial<CVState["personal"]>) => {
      setState((prev) => ({
        ...prev,
        personal: { ...prev.personal, ...partial },
      }));
    },
    []
  );

  const goToStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, step: Math.max(0, Math.min(8, step)) }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: Math.min(8, prev.step + 1),
    }));
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: Math.max(0, prev.step - 1),
    }));
  }, []);

  const resetState = useCallback(() => {
    setState(defaultCVState);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DRAFTS_KEY);
    localStorage.removeItem(ACTIVE_DRAFT_ID_KEY);
    setRestoredAt(null);
  }, []);

  const dismissRestoreBanner = useCallback(() => {
    setRestoredAt(null);
  }, []);

  return React.createElement(
    CVContext.Provider,
    {
      value: {
        state,
        setState,
        hydrated,
        updateField,
        updatePersonal,
        goToStep,
        nextStep,
        prevStep,
        resetState,
        restoredAt,
        dismissRestoreBanner,
      },
    },
    children
  );
}

export function useCVState(): CVContextValue {
  const ctx = useContext(CVContext);
  if (!ctx) {
    throw new Error("useCVState must be used within a CVProvider");
  }
  return ctx;
}
