"use client";

import { useSyncExternalStore } from "react";

function subscribeToNothing() {
  return () => undefined;
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

/**
 * Returns false during server rendering and hydration, then true once the
 * browser has hydrated. Use this when initial component state must read
 * browser-only storage without causing a hydration mismatch.
 */
export function useIsClient() {
  return useSyncExternalStore(subscribeToNothing, getClientSnapshot, getServerSnapshot);
}
