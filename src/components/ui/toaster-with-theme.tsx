"use client";

import { useTheme } from "next-themes";

import { Toaster } from "@/components/ui/sonner";

export function ToasterWithTheme() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      position="top-center"
      richColors
      theme={resolvedTheme as "light" | "dark" | "system"}
    />
  );
}
