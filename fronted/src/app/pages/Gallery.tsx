import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { mockArchives } from "../mockData";
import { TerminalHeader } from "../components/ui/TerminalHeader";
import { ArchiveCard } from "../components/ui/ArchiveCard";
import { Button } from "../components/ui/Button";
import { BottomSheet } from "../components/ui/BottomSheet";
import { Database, SlidersHorizontal, LayoutGrid, Rows3, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";

export default function Gallery() {
  const navigate = useNavigate();
  
  // App state
  const [layout, setLayout] = useState<"grid" | "feed">("grid");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Filter state
  const [selectedYear, setSelectedYear] = useState<string>("全部");
  const [selectedCategory, setSelectedCategory] = useState<string>("全部");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Dynamically compute filter options
  const filterOptions = useMemo(() => {
    const years = new Set<string>();
    const categories = new Set<string>();
    const allTags = new Set<string>();

    mockArchives.forEach(item => {
      // Extract year from date "YYYY.MM.DD"
      const year = item.date.split(".")[0];
      if (year && year.length === 4) years.add(year);
      
      if (item.category) categories.add(item.category);
      
      item.tags?.forEach(t => allTags.add(t));
    });

    return {
      years: ["全部", ...Array.from(years).sort((a, b) => Number(b) - Number(a))],
      categories: ["全部", ...Array.from(categories)],
      tags: Array.from(allTags)
    };
  }, []);

  // Filter the items
  const filteredArchives = useMemo(() => {
    return mockArchives.filter(item => {
      // Year filter
      if (selectedYear !== "全部") {
        const itemYear = item.date.split(".")[0];
        if (itemYear !== selectedYear) return false;
      }
      
      // Category filter
      if (selectedCategory !== "全部") {
        if (item.category !== selectedCategory) return false;
      }
      
      // Tags filter (must contain ALL selected tags)
      if (selectedTags.length > 0) {
        const itemTags = item.tags || [];
        const hasAllTags = selectedTags.every(t => itemTags.includes(t));
        if (!hasAllTags) return false;
      }

      return true;
    });
  }, [selectedYear, selectedCategory, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedYear("全部");
    setSelectedCategory("全部");
    setSelectedTags([]);
  };

  const activeFiltersCount = (selectedYear !== "全部" ? 1 : 0) 
    + (selectedCategory !== "全部" ? 1 : 0) 
    + selectedTags.length;

  return (
    <div className="min-h-full flex flex-col p-6 pt-12 pb-6 text-white bg-[#0C0D10] font-sans relative">
      <TerminalHeader 
        title="GALLERY_INDEX [ 馆藏区 ]" 
        subtitle={`检索完毕. 共发现 ${filteredArchives.length} 个数字实体.`} 
      />

      {/* Advanced Toolbar */}
      <div className="flex items-center justify-between mt-4 mb-6 sticky top-0 bg-[#0C0D10]/95 backdrop-blur-md py-3 z-30 border-b border-[#CCFF00]/10 -mx-6 px-6 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex gap-2 items-center">
          <button 
            onClick={() => setIsFilterSheetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-black border transition-all text-xs font-mono font-bold tracking-widest active:scale-95"
            style={{
              borderColor: activeFiltersCount > 0 ? '#CCFF00' : 'rgba(255,255,255,0.1)',
              color: activeFiltersCount > 0 ? '#CCFF00' : 'white',
              boxShadow: activeFiltersCount > 0 ? '0 0 10px rgba(204,255,0,0.1)' : 'none'
            }}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            FILTER {activeFiltersCount > 0 && `[${activeFiltersCount}]`}
          </button>
          
          {/* Quick Clear */}
          {activeFiltersCount > 0 && (
            <button onClick={clearFilters} className="text-[#CCFF00]/50 hover:text-[#CCFF00] p-1 bg-[#CCFF00]/5 rounded">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center bg-[#141518] border border-white/10 rounded p-0.5">
          <button 
            onClick={() => setLayout("grid")}
            className={cn("p-1.5 rounded-sm transition-all", layout === "grid" ? "bg-[#CCFF00] text-black shadow-sm" : "text-gray-500 hover:text-white")}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setLayout("feed")}
            className={cn("p-1.5 rounded-sm transition-all", layout === "feed" ? "bg-[#CCFF00] text-black shadow-sm" : "text-gray-500 hover:text-white")}
          >
            <Rows3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Exhibition Content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
        {filteredArchives.length > 0 ? (
          <motion.div 
            key={`${layout}-view`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(layout === "grid" ? "columns-2 gap-4" : "flex flex-col")}
          >
            {filteredArchives.map((item, index) => (
              <div key={item.id} className={cn(layout === "grid" ? "break-inside-avoid mb-4" : "w-full mb-6")}>
                <ArchiveCard item={item} layout={layout} index={index} />
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="empty-state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center border border-[#CCFF00]/20 border-dashed rounded-xl bg-[#CCFF00]/5 mt-4"
          >
            <div className="w-16 h-16 rounded-full border border-[#CCFF00]/30 bg-black/80 flex items-center justify-center mb-4 text-[#CCFF00] font-mono text-xl shadow-[0_0_15px_rgba(204,255,0,0.1)]">
              ∅
            </div>
            <h3 className="text-[#CCFF00] font-mono font-bold tracking-widest mb-2 text-sm">NO_RECORDS_FOUND</h3>
            <p className="text-gray-400 text-xs mb-8 font-mono">ADJUST PARAMETERS OR SCAN NEW ENTITY</p>
            {activeFiltersCount > 0 ? (
              <Button variant="secondary" onClick={clearFilters} className="rounded border border-white/20 text-xs font-mono h-10 px-6">
                RESET_FILTERS
              </Button>
            ) : (
              <Button variant="primary" onClick={() => navigate('/scan')} className="rounded bg-[#CCFF00] text-black font-bold font-mono text-xs h-10 px-6">
                INITIATE_SCAN
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* Action Button for Memory Chat */}
      <div className="sticky bottom-6 mt-8 z-40 w-full pointer-events-none">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/chat')}
          className="w-full bg-[#111318]/95 backdrop-blur-md border border-[#CCFF00]/50 text-[#CCFF00] px-4 py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold font-mono tracking-wide transition-all hover:bg-[#CCFF00] hover:text-black shadow-[0_0_25px_rgba(204,255,0,0.15)] pointer-events-auto text-sm"
        >
          <Database className="w-4 h-4 shrink-0" />
          <span className="truncate">CONNECT TO MEMORY_DB</span>
        </motion.button>
      </div>

      {/* Advanced Filter Drawer */}
      <BottomSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        title="ADVANCED_FILTERS"
      >
        <div className="space-y-8 pb-4 font-sans">
          
          {/* Section: Year */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 flex justify-between items-center font-mono">
              TIME_AXIS 
              <span className="font-mono text-[9px] text-[#CCFF00] border border-[#CCFF00]/30 bg-[#CCFF00]/10 px-1.5 py-0.5 rounded">SINGLE</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {filterOptions.years.map(y => (
                <button
                  key={y}
                  onClick={() => setSelectedYear(y)}
                  className={cn(
                    "px-4 py-1.5 rounded text-xs font-mono transition-all border",
                    selectedYear === y 
                      ? "bg-[#CCFF00] text-black border-[#CCFF00] font-bold shadow-[0_0_10px_rgba(204,255,0,0.2)]" 
                      : "bg-[#141518] text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Category */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 flex justify-between items-center font-mono">
              CATEGORY 
              <span className="font-mono text-[9px] text-[#CCFF00] border border-[#CCFF00]/30 bg-[#CCFF00]/10 px-1.5 py-0.5 rounded">SINGLE</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {filterOptions.categories.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={cn(
                    "px-4 py-1.5 rounded text-sm transition-all border",
                    selectedCategory === c 
                      ? "bg-white text-black border-white font-bold" 
                      : "bg-[#141518] text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Emotion/Tags */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 flex justify-between items-center font-mono">
              ANCHOR_TAGS 
              <span className="font-mono text-[9px] text-blue-400 border border-blue-400/30 bg-blue-400/10 px-1.5 py-0.5 rounded">MULTIPLE</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {filterOptions.tags.map(t => {
                const isActive = selectedTags.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => toggleTag(t)}
                    className={cn(
                      "px-3 py-1.5 rounded text-xs transition-all border",
                      isActive
                        ? "bg-white/10 text-white border-white/30"
                        : "bg-[#141518] text-gray-500 border-transparent hover:bg-white/10 hover:text-gray-300"
                    )}
                  >
                    #{t}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button 
              variant="secondary" 
              className="flex-1 rounded h-12 font-mono text-xs tracking-wider border-white/20"
              onClick={() => {
                clearFilters();
              }}
            >
              RESET
            </Button>
            <Button 
              variant="primary" 
              className="flex-[2] rounded h-12 font-bold font-mono text-xs tracking-widest bg-[#CCFF00] text-black"
              onClick={() => setIsFilterSheetOpen(false)}
            >
              APPLY_FILTERS [{filteredArchives.length}]
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}