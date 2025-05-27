"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export default function ModeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed top-2 right-2">
      <Button variant="outline" size="icon" onClick={() => handleThemeChange()}>
        {theme === "dark" ? (
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 transition-all" />
        ) : (
          <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 transition-all" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  );
}
