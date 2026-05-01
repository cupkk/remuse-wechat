import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { mockUser, mockArchives } from "../mockData";
import { TerminalHeader } from "../components/ui/TerminalHeader";
import { ArchiveCard } from "../components/ui/ArchiveCard";
import { Tag } from "../components/ui/Tag";
import { Scan, Sparkles, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

export default function Home() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate first-time onboarding toast and fetching
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (mockUser.archiveCount === 0) {
        toast("欢迎来到 RE-MUSEUM", {
          description: "你还没有任何归档，试着扫描第一件旧物吧！",
          icon: <AlertCircle className="w-4 h-4 text-[#CCFF00]" />
        });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const recentArchives = mockArchives.slice(0, 2);

  return (
    <div className="min-h-full p-6 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-repeat text-white pt-12 pb-24">
      {/* Brand Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-mono tracking-tighter flex items-center">
          RE<span className="text-[#CCFF00] mx-1">-</span>MUSEUM
        </h1>
        <p className="text-gray-400 text-sm mt-2 font-mono">欢迎回来，{mockUser.name}</p>
        <div className="flex gap-2 mt-3">
          <Tag variant="default">已归档 {mockUser.archiveCount} 件</Tag>
          <Tag variant="neon">再生资产 {Object.values(mockUser.resultsCount).reduce((a, b) => a + b, 0)} 个</Tag>
        </div>
      </div>

      {/* Main Action Banner */}
      <motion.div 
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/scan')}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a0b0d] to-[#1a1c22] border border-white/10 p-6 mb-8 group cursor-pointer shadow-xl"
      >
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#CCFF00]/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-full bg-[#CCFF00] flex items-center justify-center mb-4 text-black">
            <Scan className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-medium mb-2">新的记忆需要被归档</h2>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed">
            把那些舍不得扔的票根、瓶盖、包装盒扫描进数字展馆，赋予它们新的生命。
          </p>
          <div className="flex items-center text-[#CCFF00] text-sm font-medium font-mono group-hover:underline underline-offset-4">
            <span className="mr-2">EXECUTE_SCAN [ 启动扫描 ]</span>
            <span>{"->"}</span>
          </div>
        </div>
      </motion.div>

      {/* Recent Archives */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white/90">最近归档</h3>
          {recentArchives.length > 0 && !isLoading && (
            <Link to="/gallery" className="text-sm text-gray-500 hover:text-white font-mono transition-colors">
              [ 查看全部 ]
            </Link>
          )}
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl aspect-[3/4] animate-pulse">
                <div className="w-full h-full bg-white/5" />
              </div>
            ))}
          </div>
        ) : recentArchives.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {recentArchives.map(item => (
              <ArchiveCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-3 text-gray-500">
              0
            </div>
            <p className="text-gray-400 text-sm mb-4">尚未建立任何档案</p>
            <button onClick={() => navigate('/scan')} className="px-4 py-2 bg-white/10 rounded-md text-xs font-mono hover:bg-white/20 transition-colors">
              CREATE_FIRST_ARCHIVE
            </button>
          </div>
        )}
      </div>

      {/* Sticker Prompt */}
      {!isLoading && mockUser.archiveCount > 0 && (
        <div className="mt-8 bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#CCFF00]" />
              发现新的数字资产
            </h4>
            <p className="text-xs text-gray-500 mt-1">你的最近归档可以生成表情包</p>
          </div>
          <Link to="/workshop" className="px-3 py-1.5 bg-white/10 text-white text-xs rounded-md font-mono hover:bg-white/20 whitespace-nowrap">
            [ 去工坊 ]
          </Link>
        </div>
      )}
    </div>
  );
}