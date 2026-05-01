import React from "react";

export const MobileLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-black flex justify-center items-center font-sans text-gray-200">
      {/* Mobile Wrapper to simulate phone on desktop, full width on actual mobile */}
      <div className="w-full h-[100dvh] sm:h-[844px] sm:w-[390px] bg-[#0C0D10] sm:rounded-3xl sm:border-[8px] border-neutral-800 shadow-2xl relative overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
};