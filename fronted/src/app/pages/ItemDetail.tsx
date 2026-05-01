import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { mockArchives } from "../mockData";
import { Button } from "../components/ui/Button";
import { Tag } from "../components/ui/Tag";
import { BottomSheet } from "../components/ui/BottomSheet";
import { ChevronLeft, Sparkles, Wand2, Download, Share, MessageSquare } from "lucide-react";
import { motion } from "motion/react";

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = mockArchives.find((a) => a.id === id) || mockArchives[0];

  const [isStickerSheetOpen, setStickerSheetOpen] = useState(false);
  const [stickerStatus, setStickerStatus] = useState<"idle" | "generating" | "completed">("idle");

  const handleGenerateSticker = () => {
    setStickerSheetOpen(true);
    setStickerStatus("generating");
    // Simulate generation time
    setTimeout(() => {
      setStickerStatus("completed");
    }, 3500);
  };

  return (
    <div className="min-h-full bg-[#0C0D10] text-gray-200 pb-safe">
      {/* Immersive Header Image */}
      <div className="relative w-full aspect-[4/3] rounded-b-3xl overflow-hidden shadow-2xl">
        <img src={item.imageUrl} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0D10] via-black/40 to-transparent" />
        
        {/* Nav */}
        <div className="absolute top-0 left-0 right-0 p-4 pt-12 flex justify-between z-10 bg-gradient-to-b from-black/80 to-transparent">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full bg-black/40 backdrop-blur text-white hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

      {/* Fixed Bottom Action Bar */}
      <div className="sticky bottom-6 w-full px-6 mt-12 z-20 flex justify-end gap-3 pointer-events-none">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/workshop')}
          className="flex items-center justify-center gap-2 bg-[#CCFF00] text-black px-5 py-2.5 rounded-full font-bold shadow-[0_4px_20px_rgba(204,255,0,0.4)] pointer-events-auto"
        >
          <Wand2 className="w-4 h-4" />
          <span className="text-sm">去工坊再生</span>
        </motion.button>
      </div>
      </div>

      {/* Details */}
      <div className="px-6 py-8 relative z-10 -mt-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <Tag variant="neon">{item.category}</Tag>
          <Tag variant="outline">{item.material}</Tag>
        </div>
        
        <h1 className="text-3xl font-medium text-white mb-2">{item.title}</h1>
        <p className="text-gray-500 font-mono text-xs mb-8 tracking-widest">{item.date}</p>

        {/* Tags Grid */}
        <div className="flex flex-wrap gap-2 mb-8">
          {item.tags.map((tag) => (
            <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300">
              #{tag}
            </span>
          ))}
        </div>

        {/* Story Section */}
        <div className="relative">
          <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-[#CCFF00] to-transparent opacity-30" />
          <p className="text-[15px] leading-relaxed text-gray-300 font-sans whitespace-pre-wrap pl-2">
            {item.story}
          </p>
        </div>
      </div>

      {/* Sticker Bottom Sheet */}
      <BottomSheet 
        isOpen={isStickerSheetOpen} 
        onClose={() => setStickerSheetOpen(false)}
        title={stickerStatus === "generating" ? "生成数字实体..." : "提取成功"}
      >
        <div className="min-h-[300px] flex flex-col items-center justify-center p-4">
          {stickerStatus === "generating" ? (
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-white/5 border border-[#CCFF00]/50 mb-6">
                <img src={item.imageUrl} alt="source" className="w-full h-full object-cover opacity-30" />
                <motion.div 
                  animate={{ y: ["-100%", "100%", "-100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-[2px] bg-[#CCFF00] shadow-[0_0_20px_#CCFF00] z-10"
                />
                <div className="absolute inset-0 flex items-center justify-center mix-blend-screen">
                  <Wand2 className="w-8 h-8 text-[#CCFF00] animate-pulse" />
                </div>
              </div>
              <p className="text-sm font-mono text-[#CCFF00] tracking-widest">EXTRACTING [ 提取主体中 ]</p>
              <p className="text-xs text-gray-500 mt-2">正在从背景中剥离物体</p>
            </div>
          ) : (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center w-full"
            >
              {/* Fake Sticker UI */}
              <div className="relative w-48 h-48 mb-8">
                <img 
                  src={item.imageUrl} 
                  alt="sticker result" 
                  className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(204,255,0,0.5)] rounded-xl"
                  style={{
                    clipPath: "polygon(50% 0%, 90% 20%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 10% 20%)"
                  }} 
                />
                <div className="absolute -bottom-2 -right-2 bg-white text-black font-mono font-bold text-[10px] px-2 py-0.5 rounded-sm transform rotate-6 border border-black">
                  NEW_STICKER
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 w-full">
                <Button variant="secondary" className="w-full rounded-xl" onClick={() => setStickerSheetOpen(false)}>
                  <Download className="w-4 h-4 mr-2" /> 保存到相册
                </Button>
                <Button variant="primary" className="w-full rounded-xl text-black font-bold">
                  <Share className="w-4 h-4 mr-2" /> 分享实体
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}