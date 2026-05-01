import React, { useState, useMemo } from "react";
import { TerminalHeader } from "../components/ui/TerminalHeader";
import { mockResults, mockArchives, ResultItem } from "../mockData";
import { Sparkles, Smile, LayoutGrid, BookOpen, Lightbulb, Archive } from "lucide-react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { motion } from "motion/react";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router";

const TYPES = [
  { id: "all", label: "ALL / 全部", icon: Archive },
  { id: "sticker", label: "STICKER / 贴纸", icon: Sparkles },
  { id: "emoji", label: "EMOJI / 表情", icon: Smile },
  { id: "pixel", label: "PIXEL / 拼豆", icon: LayoutGrid },
  { id: "journal", label: "JOURNAL / 手账", icon: BookOpen },
  { id: "guide", label: "GUIDE / 指南", icon: Lightbulb },
];

const CATEGORIES = ["全部", "纪念物", "餐饮遗留", "包装容器", "饰品", "数码外设"];

export default function Results() {
  const [activeType, setActiveType] = useState("all");
  const [activeCategory, setActiveCategory] = useState("全部");
  const navigate = useNavigate();

  // Combine results with their source archive categories
  const enrichedResults = useMemo(() => {
    return mockResults.map(res => {
      const source = mockArchives.find(a => a.id === res.sourceArchiveId);
      return {
        ...res,
        category: source ? source.category : "其他",
      };
    });
  }, []);

  const filteredResults = useMemo(() => {
    return enrichedResults.filter(res => {
      const matchType = activeType === "all" || res.type === activeType;
      const matchCategory = activeCategory === "全部" || res.category === activeCategory;
      return matchType && matchCategory;
    });
  }, [activeType, activeCategory, enrichedResults]);

  const renderResultCard = (item: any) => {
    if (item.type === "sticker" || item.type === "emoji" || item.type === "pixel") {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          key={item.id} 
          className="relative bg-black rounded-lg border border-white/10 overflow-hidden shadow-sm group hover:border-[#CCFF00]/50 transition-colors"
        >
          <div className="relative aspect-square w-full">
            {item.type === "sticker" && (
              <div 
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: 'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)',
                  backgroundSize: '10px 10px',
                  backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px'
                }}
              />
            )}
            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover p-2" />
          </div>
          
          {/* Metadata Overlay */}
          <div className="p-3 border-t border-white/5 bg-[#141518]">
            <div className="flex items-center gap-1.5 mb-1.5">
              {item.type === "sticker" && <Sparkles className="w-3 h-3 text-yellow-500" />}
              {item.type === "emoji" && <Smile className="w-3 h-3 text-yellow-500" />}
              {item.type === "pixel" && <LayoutGrid className="w-3 h-3 text-yellow-500" />}
              <span className="text-[9px] font-mono text-gray-500 tracking-wider uppercase">
                {item.type}
              </span>
            </div>
            <h4 className="text-xs font-bold text-white mb-2 leading-tight truncate">{item.title}</h4>
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-[#CCFF00] border border-[#CCFF00]/30 bg-[#CCFF00]/5 px-1.5 py-0.5 rounded font-mono">
                {item.category}
              </span>
              <span className="text-[9px] text-gray-600 font-mono">{item.date}</span>
            </div>
          </div>
        </motion.div>
      );
    } else {
      // Text-centric cards for Journals and Guides
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={item.id} 
          className="bg-black border border-white/10 rounded-lg p-4 relative overflow-hidden flex flex-col justify-between shadow-sm group hover:border-white/30 transition-colors"
          style={{ minHeight: '140px' }}
        >
          <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-20 ${item.type === 'guide' ? 'bg-[#CCFF00]' : 'bg-blue-500'}`} />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-1.5 mb-2">
              <div className={`w-5 h-5 rounded flex items-center justify-center border ${item.type === 'guide' ? 'bg-[#CCFF00]/10 border-[#CCFF00]/30 text-[#CCFF00]' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
                {item.type === "journal" ? <BookOpen className="w-3 h-3" /> : <Lightbulb className="w-3 h-3" />}
              </div>
              <span className="text-[9px] font-mono text-gray-500 tracking-wider uppercase">
                {item.type}
              </span>
            </div>
            <h4 className="text-xs font-bold text-white mb-3 leading-snug line-clamp-3 flex-1">{item.title}</h4>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-[9px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-gray-400">
                {item.category}
              </span>
              <span className="text-[9px] text-gray-600 font-mono">{item.date}</span>
            </div>
          </div>
        </motion.div>
      );
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-[#0C0D10] text-white font-sans">
      <div className="px-6 pt-12 pb-4">
        <TerminalHeader 
          title="ASSETS_LIB [ 衍生资产库 ]" 
          subtitle={`系统已生成 ${enrichedResults.length} 个重构资源`} 
        />
      </div>

      {/* Cyberpunk Filter Tabs */}
      <div className="sticky top-0 bg-[#0C0D10]/95 backdrop-blur-xl z-20 pb-4 border-b border-white/5 shadow-md shadow-black/50">
        {/* Layer 1: Types */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-6 pt-3 pb-3">
          {TYPES.map((type) => {
            const isActive = activeType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setActiveType(type.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-sm text-[10px] font-mono font-bold tracking-widest transition-all border ${
                  isActive 
                    ? "bg-[#CCFF00] text-black border-[#CCFF00] shadow-[0_0_10px_rgba(204,255,0,0.2)]" 
                    : "bg-[#141518] text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>

        {/* Layer 2: Categories */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-6 pt-1">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap text-xs font-medium transition-colors px-3 py-1 rounded-sm border ${
                  isActive 
                    ? "text-white border-white bg-white/10" 
                    : "text-gray-500 border-transparent hover:bg-white/5 hover:text-gray-300"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 pt-6 pb-24 flex-1">
        {filteredResults.length > 0 ? (
          activeType === "journal" || activeType === "guide" ? (
            // Single column for text-heavy content
            <div className="flex flex-col gap-4">
              {filteredResults.map(renderResultCard)}
            </div>
          ) : (
            // Edge-to-edge Masonry
            <ResponsiveMasonry columnsCountBreakPoints={{ 300: 2, 500: 2 }}>
              <Masonry gutter="12px">
                {filteredResults.map(renderResultCard)}
              </Masonry>
            </ResponsiveMasonry>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-[#CCFF00]/20 rounded-xl bg-black/50 mt-4 mx-2 shadow-inner">
            <div className="w-16 h-16 rounded border border-[#CCFF00]/30 bg-[#CCFF00]/5 flex items-center justify-center mb-4 text-[#CCFF00]">
              <Archive className="w-6 h-6 opacity-80" />
            </div>
            <h3 className="text-[#CCFF00] font-mono font-bold text-xs tracking-widest mb-2">NO_ASSETS_DETECTED</h3>
            <p className="text-gray-500 text-xs mb-8 max-w-[200px] leading-relaxed font-mono">
              ADJUST FILTER PARAMETERS OR GENERATE NEW ASSETS
            </p>
            <Button variant="secondary" onClick={() => navigate('/workshop')} className="rounded border-white/20 text-xs font-mono h-10 px-6">
              ENTER_WORKSHOP
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}