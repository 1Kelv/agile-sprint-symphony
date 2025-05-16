
import React from 'react';
import { cn } from "@/lib/utils";

export function Container({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "container px-4 md:px-6 mx-auto",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
