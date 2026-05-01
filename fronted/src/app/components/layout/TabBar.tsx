import React from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Home, Grid, MessageCircle, User, Plus, Palette } from "lucide-react";
import { cn } from "../../../lib/utils";

interface TabBarProps {
  onScanClick: () => void;
}

export const TabBar: React.FC<TabBarProps> = ({ onScanClick }) => {
  const location = useLocation();
  const leftItems = [
    { name: "首页", icon: Home, path: "/" },
    { name: "展馆", icon: Grid, path: "/gallery" },
  ];
  
  const rightItems = [
    { name: "工坊", icon: Palette, path: "/workshop" },
    { name: "我的", icon: User, path: "/profile" },
  ];

  const renderItem = (item: {name: string, icon: React.ElementType, path: string}) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        key={item.name}
        to={item.path}
        className={cn(
          "flex flex-col items-center justify-center w-16 h-full transition-colors",
          isActive ? "text-[#CCFF00]" : "text-gray-500 hover:text-gray-300"
        )}
      >
        <item.icon className="w-6 h-6 mb-1" strokeWidth={isActive ? 2.5 : 2} />
        <span className="text-[10px] font-medium">{item.name}</span>
      </Link>
    );
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#0C0D10]/90 backdrop-blur-lg border-t border-white/10 z-30 pb-safe">
      <div className="flex justify-between items-center h-full px-6 relative max-w-[400px] mx-auto">
        <div className="flex gap-4">
          {leftItems.map(renderItem)}
        </div>

        {/* Center Scan Button - Absolute Center */}
        <button
          onClick={onScanClick}
          className="absolute left-1/2 -translate-x-1/2 -top-6 flex flex-col items-center justify-center w-14 h-14 bg-[#CCFF00] rounded-full shadow-[0_0_20px_rgba(204,255,0,0.4)] text-[#0C0D10] border-[5px] border-[#0C0D10] z-40 transition-transform active:scale-95"
        >
          <Plus className="w-7 h-7" strokeWidth={3} />
        </button>

        <div className="flex gap-4">
          {rightItems.map(renderItem)}
        </div>
      </div>
    </div>
  );
};