"use client";

import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "next-themes";

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
