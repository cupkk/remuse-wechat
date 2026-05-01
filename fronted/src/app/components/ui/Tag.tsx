import React from "react";
import { cn } from "../../../lib/utils";

interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "neon" | "outline";
}

export const Tag: React.FC<TagProps> = ({ className, variant = "default", children, ...props }) => {
  const baseStyles = "inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-mono";
  
  const variants = {
    default: "bg-white/10 text-gray-300",
    neon: "bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/30",
    outline: "border border-white/20 text-gray-400",
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </span>
  );
};