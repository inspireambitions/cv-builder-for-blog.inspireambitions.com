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
import React from "react";

interface CVContextValue {
  state: CVState;
  setState: React.Dispatch<React.SetStateAction<CVState>>;
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
const STORAGE_VERSION = 2;
const DRAFT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

interface StoredDraft {
  version: number;
  savedAt: string;
  state: CVState;
}

function normalizeState(value: unknown): CVState | null {
  if (!value || typeof value !== "object") return null;
  const incoming = value as Partial<CVState>;
  const personal = incoming.personal ?? {};

  return {
    ...defaultCVState,
    ...incoming,
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

function loadSavedState(): { state: CVState; savedAt: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const savedAt =
        typeof parsed?.savedAt === "string"
          ? parsed.savedAt
          : new Date().toISOString();
      const savedTime = new Date(savedAt).getTime();
      if (Number.isFinite(savedTime) && Date.now() - savedTime > DRAFT_TTL_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      const draftState = parsed?.state ? parsed.state : parsed;
      const state = normalizeState(draftState);
      return state ? { state, savedAt } : null;
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

  // Hydrate from localStorage on mount
  useEffect(() => {
    const draft = loadSavedState();
    if (draft) {
      setState(draft.state);
      setRestoredAt(draft.savedAt);
    }
    setHydrated(true);
  }, []);

  // Save to localStorage on every state change (debounced 300ms)
  useEffect(() => {
    if (!hydrated) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      try {
        const toSave = { ...state, score: null }; // Don't persist computed score
        const draft: StoredDraft = {
          version: STORAGE_VERSION,
          savedAt: new Date().toISOString(),
          state: toSave,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
        window.dispatchEvent(new Event("cv-saved"));
      } catch {
        // Storage full or unavailable
      }
    }, 300);
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [state, hydrated]);

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
