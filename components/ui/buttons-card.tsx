"use client";

import { cn } from "@/lib/utils";
import type React from "react";

export const ButtonsCard = ({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "h-full w-full rounded-xl bg-zinc-900 p-4 group/card relative overflow-hidden",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 h-full w-full bg-gradient-to-r from-emerald-500/20 via-emerald-700/10 to-emerald-900/20" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
