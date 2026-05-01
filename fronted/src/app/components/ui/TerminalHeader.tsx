import React from "react";
import { cn } from "../../../lib/utils";

export const TerminalHeader: React.FC<{ title: string; subtitle?: string; className?: string }> = ({ title, subtitle, className }) => {
  return (
    <div className={cn("mb-6 border-b border-white/10 pb-4", className)}>
      <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
        <span className="text-[#CCFF00] mr-2 opacity-80">{">"}</span>
        {title}
        <span className="inline-block w-2.5 h-5 bg-[#CCFF00] ml-1 animate-pulse" />
      </h1>
      {subtitle && <p className="text-gray-400 text-sm font-mono mt-2">{subtitle}</p>}
    </div>
  );
};