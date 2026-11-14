"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";

type DraftValue = unknown;

type AppDraftContextValue = {
  getDraft: <T>(key: string) => T | undefined;
  setDraft: <T>(key: string, value: T) => void;
  clearDraft: (key: string) => void;
  clearAllDrafts: () => void;
};

const AppDraftContext = createContext<AppDraftContextValue | null>(null);

export function AppDraftProvider({ children }: { children: ReactNode }) {
  const draftsRef = useRef(new Map<string, DraftValue>());

  const getDraft = useCallback(<T,>(key: string) => {
    return draftsRef.current.get(key) as T | undefined;
  }, []);

  const setDraft = useCallback(<T,>(key: string, value: T) => {
    draftsRef.current.set(key, value);
  }, []);

  const clearDraft = useCallback((key: string) => {
    draftsRef.current.delete(key);
  }, []);

  const clearAllDrafts = useCallback(() => {
    draftsRef.current.clear();
  }, []);

  const value = useMemo(
    () => ({ getDraft, setDraft, clearDraft, clearAllDrafts }),
    [getDraft, setDraft, clearDraft, clearAllDrafts],
  );

  return <AppDraftContext.Provider value={value}>{children}</AppDraftContext.Provider>;
}

export function useAppDrafts() {
  const context = useContext(AppDraftContext);

  if (!context) {
    throw new Error("useAppDrafts must be used inside AppDraftProvider.");
  }

  return context;
}
