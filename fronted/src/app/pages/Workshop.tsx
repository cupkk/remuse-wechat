import React, { useState } from "react";
import { useNavigate } from "react-router";
import { TerminalHeader } from "../components/ui/TerminalHeader";
import { motion } from "motion/react";
import { Smile, Sparkles, LayoutGrid, BookOpen, Lightbulb, ChevronRight, Archive, RefreshCw, Wand2, Download, Share } from "lucide-react";
import { mockUser, mockArchives, ArchiveItem } from "../mockData";
import { BottomSheet } from "../components/ui/BottomSheet";
import { Button } from "../components/ui/Button";
import { toast } from "sonner";

const EMOJI_TEXTS = ["这班上的我像个杯盖", "破碎的心", "看穿一切", "谁懂啊家人们", "今天也是个废物", "裂开", "心如止水", "大无语事件", "弱小可怜但能吃", "别理我"];

export default function Workshop() {
  const navigate = useNavigate();

  // Generator State
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null);
  const [generatorStep, setGeneratorStep] = useState<"select" | "generating" | "result">("select");
  const [selectedArchive, setSelectedArchive] = useState<ArchiveItem | null>(null);
  const [emojiText, setEmojiText] = useState("");

  const totalResults = Object.values(mockUser.resultsCount).reduce((a, b) => a + b, 0);

  const handleToolClick = (toolName: string) => {
    setActiveDrawer(toolName);
    setGeneratorStep("select");
    setSelectedArchive(null);
  };

  const handleSelectArchive = (archive: ArchiveItem) => {
    setSelectedArchive(archive);
    setGeneratorStep("generating");
    
    // Simulate generation process
    setTimeout(() => {
      if (activeDrawer === 'emoji') {
        setEmojiText(EMOJI_TEXTS[Math.floor(Math.random() * EMOJI_TEXTS.length)]);
      }
      setGeneratorStep("result");
    }, 3000);
  };

  const handleChangeText = () => {
    let newText;
    do {
      newText = EMOJI_TEXTS[Math.floor(Math.random() * EMOJI_TEXTS.length)];
    } while (newText === emojiText);
    setEmojiText(newText);
  };

  const handleSaveResult = () => {
    toast.success("已保存至再生成果库");
    setActiveDrawer(null);
    // In a real app, this would dispatch an action to add to mockResults
  };

  const renderDrawerContent = () => {
    if (generatorStep === "select") {
      return (
        <div className="min-h-[400px] p-4 pt-2 pb-8">
          <p className="text-gray-400 text-sm mb-4 text-center">请选择基础素材</p>
          <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto no-scrollbar pb-10">
            {mockArchives.map((archive) => (
              <motion.div
                key={archive.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelectArchive(archive)}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-[#CCFF00]/50 transition-colors"
              >
                <div className="aspect-square relative">
                  <img src={archive.imageUrl} alt={archive.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 text-center">
                  <div className="text-sm font-medium truncate">{archive.title}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      );
    }

    if (generatorStep === "generating" && selectedArchive) {
      let icon = <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />;
      let title = "PROCESSING [ 处理中 ]";
      let desc = "请稍候...";
      let borderColor = "border-yellow-500/50";
      let scanColor = "bg-yellow-500";
      let scanShadow = "shadow-[0_0_20px_#eab308]";
      let textColor = "text-yellow-500";

      if (activeDrawer === 'emoji') {
        icon = <Smile className={`w-8 h-8 ${textColor} animate-pulse`} />;
        title = "APPLYING_FILTER [ 生成表情中 ]";
        desc = "正在分析物品特征与匹配文案...";
      } else if (activeDrawer === 'sticker') {
        title = "EXTRACTING_SUBJECT [ 生成贴纸中 ]";
        desc = "正在抠图与生成边缘轮廓...";
      } else if (activeDrawer === 'pixel') {
        icon = <LayoutGrid className={`w-8 h-8 ${textColor} animate-pulse`} />;
        title = "PIXELATING_IMAGE [ 生成拼豆中 ]";
        desc = "正在转换像素色彩与提取网格...";
      } else if (activeDrawer === 'journal') {
        icon = <BookOpen className="w-8 h-8 text-blue-400 animate-pulse" />;
        title = "COMPOSING_JOURNAL [ 生成排版中 ]";
        desc = "正在散落贴纸与生成手账文案...";
        borderColor = "border-blue-500/50";
        scanColor = "bg-blue-400";
        scanShadow = "shadow-[0_0_20px_#60a5fa]";
        textColor = "text-blue-400";
      } else if (activeDrawer === 'guide') {
        icon = <Lightbulb className="w-8 h-8 text-[#CCFF00] animate-pulse" />;
        title = "ANALYZING_MATERIAL [ 生成指南中 ]";
        desc = "正在分析材质属性与重组方案...";
        borderColor = "border-[#CCFF00]/50";
        scanColor = "bg-[#CCFF00]";
        scanShadow = "shadow-[0_0_20px_#CCFF00]";
        textColor = "text-[#CCFF00]";
      }

      return (
        <div className="min-h-[300px] flex flex-col items-center justify-center p-4">
          <div className={`relative w-32 h-32 rounded-xl overflow-hidden bg-white/5 border ${borderColor} mb-6`}>
            <img src={selectedArchive.imageUrl} alt="source" className="w-full h-full object-cover opacity-40 grayscale" />
            <motion.div 
              animate={{ y: ["-100%", "100%", "-100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className={`absolute left-0 right-0 h-[2px] ${scanColor} ${scanShadow} z-10`}
            />
            <div className="absolute inset-0 flex items-center justify-center mix-blend-screen">
              {icon}
            </div>
          </div>
          <p className={`text-sm font-mono ${textColor} tracking-widest`}>
            {title}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {desc}
          </p>
        </div>
      );
    }

    if (generatorStep === "result" && selectedArchive) {
      return (
        <div className="min-h-[400px] flex flex-col items-center p-4 pb-8 w-full">
          {activeDrawer === 'emoji' ? (
            <>
              {/* Result Card for Emoji */}
              <div className="relative w-56 h-56 mb-6 rounded-2xl bg-black border-2 border-white/10 overflow-hidden shadow-[0_0_40px_rgba(234,179,8,0.15)] flex flex-col justify-end">
                <img 
                  src={selectedArchive.imageUrl} 
                  alt="result" 
                  className="absolute inset-0 w-full h-full object-cover opacity-80 filter brightness-110 contrast-125 grayscale-[20%]" 
                />
                {/* Meme effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10 w-full text-center px-3 pb-6">
                  <span className="inline-block px-3 text-white font-black text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] [text-shadow:-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000] whitespace-pre-wrap leading-tight max-w-full break-words">
                    {emojiText}
                  </span>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="mb-8 rounded-full border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"
                onClick={handleChangeText}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                换一句文案
              </Button>
            </>
          ) : activeDrawer === 'pixel' ? (
            <>
              {/* Result Card for Pixel Art */}
              <div className="relative w-full h-64 mb-8 flex items-center justify-center bg-gray-900 rounded-2xl border border-white/10 overflow-hidden">
                <div className="relative w-48 h-48 border-4 border-gray-800 bg-black p-1 shadow-2xl">
                  {/* Pixelated Image */}
                  <img 
                    src={selectedArchive.imageUrl} 
                    alt="result" 
                    className="absolute inset-1 w-[calc(100%-8px)] h-[calc(100%-8px)] object-cover opacity-90 saturate-[2]"
                    style={{ filter: 'contrast(1.5) blur(1px)' }}
                  />
                  {/* Beads overlay */}
                  <div 
                    className="absolute inset-1 w-[calc(100%-8px)] h-[calc(100%-8px)] mix-blend-multiply"
                    style={{
                      backgroundImage: 'radial-gradient(circle, transparent 2px, #000 3px)',
                      backgroundSize: '10px 10px'
                    }}
                  />
                  <div 
                    className="absolute inset-1 w-[calc(100%-8px)] h-[calc(100%-8px)] opacity-30 pointer-events-none"
                    style={{
                      backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
                      backgroundSize: '10px 10px'
                    }}
                  />
                </div>
              </div>
            </>
          ) : activeDrawer === 'journal' ? (
            <>
              {/* Result Card for Journal */}
              <div className="relative w-full h-80 mb-8 bg-[#e8e4d9] rounded-sm shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] overflow-hidden p-6 flex flex-col justify-center">
                {/* Paper texture */}
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
                
                {/* Washi Tape */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-white/40 rotate-[-2deg] backdrop-blur-sm border border-white/20 shadow-sm z-20 mix-blend-overlay" />
                
                {/* Sticker */}
                <motion.div 
                  initial={{ rotate: -5, scale: 0.9 }}
                  animate={{ rotate: -3, scale: 1 }}
                  className="relative w-36 h-36 mx-auto mt-2 bg-white p-2.5 rounded-xl shadow-md z-10 border border-gray-100"
                >
                  <img src={selectedArchive.imageUrl} className="w-full h-full object-cover rounded-lg saturate-110" alt="sticker" />
                </motion.div>

                {/* Journal Text */}
                <div className="mt-8 space-y-3 relative z-10">
                  <div className="h-0.5 w-full border-b border-dashed border-gray-400/50" />
                  <p className="text-gray-800 font-medium text-sm text-center transform -rotate-1 tracking-wide">「 {selectedArchive.title} 的新记忆 」</p>
                  <div className="h-0.5 w-full border-b border-dashed border-gray-400/50" />
                  <p className="text-gray-600 text-xs text-center font-mono">Date: 2026.04.14</p>
                </div>
              </div>
            </>
          ) : activeDrawer === 'guide' ? (
            <>
              {/* Result Card for Guide */}
              <div className="relative w-full h-[320px] mb-8 bg-[#1a1c1a] rounded-2xl border border-[#CCFF00]/20 overflow-hidden flex flex-col">
                <div className="h-32 w-full relative shrink-0">
                  <img src={selectedArchive.imageUrl} className="w-full h-full object-cover opacity-60 mix-blend-luminosity" alt="material" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1c1a] to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <span className="px-2 py-1 bg-[#CCFF00] text-black text-[10px] font-bold uppercase rounded-sm font-mono">Material 01</span>
                  </div>
                </div>
                <div className="p-4 flex-1 overflow-y-auto no-scrollbar pb-6 text-left">
                  <h4 className="text-[#CCFF00] font-medium text-sm mb-4">RECYCLE_GUIDE / 改造方案</h4>
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#CCFF00] before:to-transparent">
                    <div className="relative flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-[#1a1c1a] border-2 border-[#CCFF00] text-[#CCFF00] flex items-center justify-center text-[10px] font-bold z-10 shrink-0">1</div>
                      <div>
                        <div className="text-sm font-medium text-white">清理与拆解</div>
                        <div className="text-xs text-gray-400 mt-1 leading-relaxed">对「{selectedArchive.title}」进行深度清洗，移除原有外部受损结构，仅保留核心可用骨架。</div>
                      </div>
                    </div>
                    <div className="relative flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-[#1a1c1a] border-2 border-[#CCFF00] text-[#CCFF00] flex items-center justify-center text-[10px] font-bold z-10 shrink-0">2</div>
                      <div>
                        <div className="text-sm font-medium text-white">重塑表面</div>
                        <div className="text-xs text-gray-400 mt-1 leading-relaxed">使用环保树脂漆进行涂装，或采用 3D 打印件进行拼接覆盖。</div>
                      </div>
                    </div>
                    <div className="relative flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-[#1a1c1a] border-2 border-white/20 text-gray-500 flex items-center justify-center text-[10px] font-bold z-10 shrink-0">3</div>
                      <div>
                        <div className="text-sm font-medium text-white">赋予新功能</div>
                        <div className="text-xs text-gray-400 mt-1 leading-relaxed">植入低功耗 LED 光源可作夜灯，或作为桌面收纳艺术品。</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Result Card for Sticker */}
              <div className="relative w-full h-64 mb-8 flex items-center justify-center bg-[#111318] rounded-2xl border border-white/5 overflow-hidden">
                {/* Checkered background pattern */}
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                  }}
                />
                
                <motion.div 
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 5 }}
                  className="relative w-40 h-40 p-2 bg-white rounded-3xl shadow-[0_15px_35px_rgba(0,0,0,0.5)] flex items-center justify-center"
                >
                  <img 
                    src={selectedArchive.imageUrl} 
                    alt="result" 
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  {/* Glossy overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 rounded-3xl pointer-events-none" />
                </motion.div>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3 w-full shrink-0">
            <Button variant="secondary" className="w-full rounded-xl" onClick={() => toast.success("已保存到相册")}>
              <Download className="w-4 h-4 mr-2" /> 保存到相册
            </Button>
            <Button variant="primary" className="w-full rounded-xl bg-yellow-500 text-black hover:bg-yellow-400" onClick={handleSaveResult}>
              <Archive className="w-4 h-4 mr-2" /> 存入成果库
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-full p-6 pt-12 pb-24 text-white relative">
      <TerminalHeader 
        title="RE_WORKSHOP [ 再生工坊 ]" 
        subtitle="选择一个方向，让数字记忆产生新的反应" 
      />

      <div className="mt-8">
        <h3 className="text-xs font-mono text-gray-500 mb-4 px-1">DIGITAL_TOYS / 数字玩具</h3>
        <div className="grid grid-cols-3 gap-3 mb-8">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => handleToolClick('sticker')} 
            className="flex flex-col items-center justify-center p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-colors relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Sparkles className="w-6 h-6 text-yellow-500 mb-3" />
            <span className="text-xs font-medium text-white/90">生成贴纸</span>
          </motion.button>
          
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => handleToolClick('emoji')} 
            className="flex flex-col items-center justify-center p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-colors relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Smile className="w-6 h-6 text-yellow-500 mb-3" />
            <span className="text-xs font-medium text-white/90">做表情包</span>
          </motion.button>
          
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => handleToolClick('pixel')} 
            className="flex flex-col items-center justify-center p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-colors relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <LayoutGrid className="w-6 h-6 text-yellow-500 mb-3" />
            <span className="text-xs font-medium text-white/90">拼豆图纸</span>
          </motion.button>
        </div>

        <h3 className="text-xs font-mono text-gray-500 mb-4 px-1">MEMORY_TOOLS / 记忆工具</h3>
        <div className="grid grid-cols-2 gap-3">
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => handleToolClick('journal')} 
            className="flex flex-col items-start p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-colors relative overflow-hidden group text-left"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
            <BookOpen className="w-6 h-6 text-blue-400 mb-4 relative z-10" />
            <span className="text-sm font-medium text-white mb-1 relative z-10">手账排版</span>
            <span className="text-xs text-gray-500 relative z-10">生成拼贴画</span>
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => handleToolClick('guide')} 
            className="flex flex-col items-start p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-colors relative overflow-hidden group text-left"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#CCFF00]/10 rounded-full blur-2xl group-hover:bg-[#CCFF00]/20 transition-colors" />
            <Lightbulb className="w-6 h-6 text-[#CCFF00] mb-4 relative z-10" />
            <span className="text-sm font-medium text-white mb-1 relative z-10">改造指南</span>
            <span className="text-xs text-gray-500 relative z-10">寻找新用途</span>
          </motion.button>
        </div>
      </div>

      {/* Fixed Bottom Bar: Results Library */}
      <div className="w-full mt-12 z-20">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/results')}
          className="w-full bg-[#111318] border border-white/10 rounded-2xl p-4 flex items-center justify-between group hover:border-[#CCFF00]/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white group-hover:bg-[#CCFF00] group-hover:text-black transition-colors">
              <Archive className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-medium text-sm text-white">再生成果库</div>
              <div className="text-xs text-gray-500 font-mono mt-0.5">
                ASSETS: {totalResults}
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-[#CCFF00] transition-colors" />
        </motion.button>
      </div>

      {/* Tools Drawer */}
      <BottomSheet 
        isOpen={activeDrawer !== null} 
        onClose={() => {
          if (generatorStep !== 'generating') {
            setActiveDrawer(null);
          }
        }}
        title={
          generatorStep === 'select' ? "选择素材" :
          generatorStep === 'generating' ? "生成中..." :
          activeDrawer === 'emoji' ? "表情包已生成" : 
          activeDrawer === 'sticker' ? "贴纸已生成" :
          activeDrawer === 'pixel' ? "拼豆图纸已生成" :
          activeDrawer === 'journal' ? "手账排版已生成" : "改造指南已生成"
        }
      >
        {renderDrawerContent()}
      </BottomSheet>
    </div>
  );
}