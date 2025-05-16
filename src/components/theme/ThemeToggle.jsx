
import React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Toggle } from "../../components/ui/toggle"; 
import { useTheme } from "./ThemeProvider";
import { cn } from "../../lib/utils";

export function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Toggle
      aria-label="Toggle theme"
      className={cn("p-2", className)}
      pressed={theme === "dark"}
      onPressedChange={() => {
        console.log("Toggle pressed, current theme:", theme);
        toggleTheme();
      }}
    >
      {theme === "dark" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Toggle>
  );
}

export function ThemeToggleButton({ className }) {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        console.log("Button clicked, current theme:", theme);
        toggleTheme();
      }}
      className={cn("rounded-full", className)}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  );
}
