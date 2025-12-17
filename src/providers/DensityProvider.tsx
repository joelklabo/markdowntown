"use client";

import React from "react";

export type Density = "comfortable" | "compact";

const STORAGE_KEY = "mdt_density";

type DensityContextValue = {
  density: Density;
  setDensity: (density: Density) => void;
  toggleDensity: () => void;
};

const DensityContext = React.createContext<DensityContextValue | null>(null);

function readStoredDensity(): Density | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value === "comfortable" || value === "compact") return value;
    return null;
  } catch {
    return null;
  }
}

function writeStoredDensity(density: Density) {
  try {
    window.localStorage.setItem(STORAGE_KEY, density);
  } catch {
    // ignore
  }
}

export function DensityProvider({ children }: { children: React.ReactNode }) {
  const [density, setDensityState] = React.useState<Density>(() => readStoredDensity() ?? "comfortable");

  React.useEffect(() => {
    document.documentElement.dataset.density = density;
    writeStoredDensity(density);
  }, [density]);

  const setDensity = React.useCallback((next: Density) => {
    setDensityState(next);
  }, []);

  const toggleDensity = React.useCallback(() => {
    setDensityState((prev) => (prev === "compact" ? "comfortable" : "compact"));
  }, []);

  const value = React.useMemo(() => ({ density, setDensity, toggleDensity }), [density, setDensity, toggleDensity]);

  return <DensityContext.Provider value={value}>{children}</DensityContext.Provider>;
}

export function useDensity(): DensityContextValue {
  const value = React.useContext(DensityContext);
  if (!value) {
    throw new Error("useDensity must be used within DensityProvider");
  }
  return value;
}

