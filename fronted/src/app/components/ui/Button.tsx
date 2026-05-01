import React from "react";
import { cn } from "../../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "terminal";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-[#CCFF00] text-black hover:bg-[#b3e600]",
      secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/20",
      ghost: "text-gray-300 hover:text-white hover:bg-white/5",
      terminal: "bg-transparent text-[#CCFF00] border border-[#CCFF00] hover:bg-[#CCFF00]/10 font-mono",
    };
    
    const sizes = {
      sm: "h-8 px-3 text-sm rounded",
      md: "h-12 px-6 text-base rounded-md",
      lg: "h-14 px-8 text-lg rounded-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";