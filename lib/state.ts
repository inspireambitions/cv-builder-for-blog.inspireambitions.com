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
}

const CVContext = createContext<CVContextValue | null>(null);

const STORAGE_KEY = "inspireambitions-cv-state";

function loadSavedState(): CVState | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultCVState, ...parsed };
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

export function CVProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CVState>(defaultCVState);
  const [hydrated, setHydrated] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = loadSavedState();
    if (saved) {
      setState(saved);
    }
    setHydrated(true);
  }, []);

  // Save to localStorage on every state change (debounced 1s)
  useEffect(() => {
    if (!hydrated) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      try {
        const toSave = { ...state, score: null }; // Don't persist computed score
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
        window.dispatchEvent(new Event("cv-saved"));
      } catch {
        // Storage full or unavailable
      }
    }, 1000);
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
