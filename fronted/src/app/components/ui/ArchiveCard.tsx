import React from "react";
import { Link } from "react-router";
import { ArchiveItem } from "../../mockData";
import { Tag } from "./Tag";
import { motion } from "motion/react";

interface ArchiveCardProps {
  item: ArchiveItem;
  layout?: "grid" | "feed";
  index?: number;
}

export const ArchiveCard: React.FC<ArchiveCardProps> = ({ item, layout = "grid", index = 0 }) => {
  // Add some slight height variations in grid mode for masonry-like feel
  const aspectClass = layout === "grid" 
    ? (index % 3 === 0 ? "aspect-[3/4]" : "aspect-[4/5]") 
    : "aspect-[16/9]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        to={`/item/${item.id}`}
        className={`block group relative overflow-hidden bg-white/5 border border-white/10 ${aspectClass} ${
          layout === "grid" ? "rounded-xl" : "rounded-2xl mb-6 shadow-2xl"
        }`}
      >
        <img
          src={item.imageUrl}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0D10]/95 via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 p-4 w-full flex flex-col justify-end">
          <div className="flex flex-wrap gap-1.5 mb-2">
            <Tag variant="neon">{item.category}</Tag>
            {layout === "feed" && item.material && (
              <Tag variant="outline">{item.material}</Tag>
            )}
            {item.hasSticker && <Tag variant="outline" className="text-[#CCFF00] border-[#CCFF00]/40">含贴纸</Tag>}
          </div>
          
          <h3 className={`text-white font-medium leading-tight mb-1 truncate ${
            layout === "feed" ? "text-xl" : "text-lg"
          }`}>
            {item.title}
          </h3>
          
          <div className="flex items-center justify-between mt-1">
            <p className="text-gray-400 text-xs font-mono">{item.date}</p>
            {layout === "feed" && (
              <p className="text-[#CCFF00] text-xs font-mono tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                VIEW_ARCHIVE {">"}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};