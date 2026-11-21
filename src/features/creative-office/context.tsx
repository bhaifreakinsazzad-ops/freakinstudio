"use client";

import { createContext, useContext } from "react";
import type { CreativeOfficeContextValue } from "./types";

export const CreativeOfficeContext =
  createContext<CreativeOfficeContextValue | null>(null);

export function useCreativeOffice(): CreativeOfficeContextValue {
  const ctx = useContext(CreativeOfficeContext);
  if (!ctx) {
    throw new Error(
      "useCreativeOffice must be used inside CreativeOfficeContext.Provider"
    );
  }
  return ctx;
}
