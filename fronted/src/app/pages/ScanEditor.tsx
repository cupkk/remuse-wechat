import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { TerminalHeader } from "../components/ui/TerminalHeader";
import { Button } from "../components/ui/Button";
import { Tag } from "../components/ui/Tag";
import { BottomSheet } from "../components/ui/BottomSheet";
import { ChevronLeft, Loader2, Sparkles, Wand2, Pencil, ScanLine, Camera, Crosshair, Aperture } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { mockArchives } from "../mockData";

const PRESET_CATEGORIES = ["纪念物", "餐饮遗留", "包装容器", "饰品", "数码外设", "其他"];
const PRESET_TAGS = ["塑料", "玻璃", "纸质", "金属", "木质", "织物", "日常碎片", "特殊记忆", "红色", "透明"];

export default function ScanEditor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = (searchParams.get("mode") as "camera" | "editor") || "camera";
  
  const [mode, setMode] = useState<"camera" | "editor">(initialMode);
  const [flash, setFlash] = useState(false);
  const [aiStatus, setAiStatus] = useState<"idle" | "analyzing" | "completed">("idle");
  const [title, setTitle] = useState("未命名档案");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [story, setStory] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  // Mock image
  const scanImage = "https://images.unsplash.com/photo-1763619814070-e9c66c4e0e37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGFzdGljJTIwY3VwJTIwbGlkfGVufDF8fHx8MTc3NTQyODg3N3ww&ixlib=rb-4.1.0&q=80&w=1080";

  // Simulate AI recognition background task
  useEffect(() => {
    if (mode === "editor") {
      setAiStatus("analyzing");
      
      const logs = [
        "[SYS] INITIATING NEURAL NETWORK...",
        "[SYS] EXTRACTING OBJECT OUTLINE...",
        "[AI] DETECTED: CYLINDRICAL SHAPE",
        "[AI] MATERIAL MATCH: PLASTIC (87%)",
        "[SYS] CROSS-REFERENCING DATABASE...",
        "[OK] METADATA GENERATED."
      ];
      
      let step = 0;
      const logInterval = setInterval(() => {
        if (step < logs.length) {
          setTerminalLogs(prev => [...prev, logs[step]]);
          step++;
        } else {
          clearInterval(logInterval);
        }
      }, 400);

      const timer = setTimeout(() => {
        setAiStatus("completed");
        setTitle("奶茶杯盖遗留物");
        setCategory("餐饮遗留");
        setTags(["塑料", "红色盖子", "日常碎片"]);
        toast.success("特征提取完成");
      }, 3500); // 3.5 seconds of "AI processing"
      
      return () => {
        clearTimeout(timer);
        clearInterval(logInterval);
      };
    }
  }, [mode]);

  const handleCapture = () => {
    setFlash(true);
    // Simulated flash and shutter
    setTimeout(() => {
      setFlash(false);
      setMode("editor");
    }, 300);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      mockArchives.unshift({
        id: `a${Date.now()}`,
        title: title || "未命名档案",
        category: category || "其他",
        material: tags[0] || "未知",
        tags,
        story,
        imageUrl: scanImage,
        date: new Date().toLocaleDateString('zh-CN').replace(/\//g, '.')
      });
      setIsSaving(false);
      navigate("/gallery");
      toast.success("归档保存成功");
    }, 1500);
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  if (mode === "camera") {
    return (
      <div className="h-[100dvh] w-full bg-black text-[#CCFF00] overflow-hidden relative flex flex-col font-mono pb-safe select-none">
        {/* Camera Feed Mock */}
        <div className="absolute inset-0 z-0 flex items-center justify-center bg-[#0a0a0a]">
          <img 
            src={scanImage} 
            alt="Camera Feed" 
            className="w-full h-[120%] object-cover opacity-50 blur-[2px] brightness-75 scale-110 saturate-0 mix-blend-screen"
          />
          {/* Cyberpunk Grid Background Overlay */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(#CCFF00 1px, transparent 1px), linear-gradient(90deg, #CCFF00 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
              backgroundPosition: 'center center'
            }}
          />
          {/* Vignette & Gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#000_100%)] pointer-events-none" />
        </div>

        {/* Shutter Flash */}
        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-0 bg-[#CCFF00] mix-blend-screen z-50 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* UI Overlay */}
        <div className="relative z-10 flex-1 flex flex-col justify-between p-4 pt-10">
          {/* Top Bar */}
          <div className="flex items-start justify-between px-2">
            <button onClick={() => navigate(-1)} className="p-3 -ml-2 rounded-full bg-black/60 backdrop-blur-md border border-[#CCFF00]/30 text-[#CCFF00] hover:bg-[#CCFF00]/10 transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-end gap-1.5 text-[10px] uppercase tracking-widest text-[#CCFF00] bg-black/40 p-3 rounded-lg border border-[#CCFF00]/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-[pulse_1s_ease-in-out_infinite] shadow-[0_0_8px_#ef4444]" /> 
                <span className="font-bold">REC_MODE</span>
              </div>
              <span>ISO 400 | F 1.8</span>
              <span>SHT 1/60 | LENS 24MM</span>
              <span className="text-[#CCFF00]/60 mt-1">BAT: 84% [||||||  ]</span>
            </div>
          </div>

          {/* Cyberpunk Scan Frame */}
          <div className="flex-1 flex flex-col items-center justify-center pointer-events-none relative">
            <motion.div 
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative w-[300px] h-[400px]"
            >
              {/* Corner Brackets */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-[#CCFF00] shadow-[-4px_-4px_15px_rgba(204,255,0,0.2)]" />
              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-[#CCFF00] shadow-[4px_-4px_15px_rgba(204,255,0,0.2)]" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-[#CCFF00] shadow-[-4px_4px_15px_rgba(204,255,0,0.2)]" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-[#CCFF00] shadow-[4px_4px_15px_rgba(204,255,0,0.2)]" />
              
              {/* Target Crosshair */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                <Crosshair className="w-8 h-8 text-[#CCFF00]/50 animate-[spin_10s_linear_infinite]" />
                <div className="absolute w-1 h-1 bg-[#CCFF00] rounded-full shadow-[0_0_10px_#CCFF00]" />
              </div>
              
              {/* Scanning Laser */}
              <motion.div 
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute left-2 right-2 h-[2px] bg-[#CCFF00] shadow-[0_0_25px_rgba(204,255,0,1)] z-10"
              />

              {/* Data Overlays */}
              <div className="absolute top-4 -left-16 text-[9px] text-[#CCFF00]/60 space-y-1 text-right flex flex-col items-end">
                <span>X: 142.5</span>
                <span>Y: 88.2</span>
                <span>Z: 0.0</span>
              </div>
              <div className="absolute bottom-4 -right-16 text-[9px] text-[#CCFF00]/60 space-y-1">
                <span>OBJ_DETECT: ON</span>
                <span>FLTR: NEUTRAL</span>
                <span>SYNC: STABLE</span>
              </div>

              {/* Fake Terminal Logs */}
              <div className="absolute -bottom-16 left-0 text-[10px] text-[#CCFF00]/80 space-y-1 bg-black/40 p-2 rounded border border-[#CCFF00]/20 backdrop-blur-sm w-full">
                <p>{">"} INIT_SENSOR_ARRAY...</p>
                <p>{">"} CALIBRATING_LENS...</p>
                <p className="animate-pulse text-white">{">"} AWAITING_CAPTURE</p>
              </div>
            </motion.div>
          </div>

          {/* Bottom Controls */}
          <div className="flex flex-col items-center gap-8 pb-10 pointer-events-auto mt-4">
            <div className="bg-black/80 px-6 py-2.5 rounded-full backdrop-blur-md border border-[#CCFF00]/40 shadow-[0_0_20px_rgba(204,255,0,0.15)] flex items-center gap-2">
              <ScanLine className="w-4 h-4 text-[#CCFF00] animate-pulse" />
              <span className="text-[13px] text-[#CCFF00] tracking-widest font-mono font-medium">
                PLEASE_ALIGN_OBJECT
              </span>
            </div>
            
            <div className="flex items-center justify-between w-full px-12 relative">
              <button 
                onClick={() => navigate('/gallery')}
                className="w-12 h-12 rounded-xl bg-black/60 border border-[#CCFF00]/30 overflow-hidden flex items-center justify-center backdrop-blur-md active:scale-95 transition-all hover:bg-[#CCFF00]/10 group"
              >
                <div className="w-6 h-6 border-2 border-[#CCFF00]/50 rounded-sm group-hover:border-[#CCFF00] transition-colors" />
              </button>
              
              {/* Cyber Shutter Button */}
              <motion.button 
                whileTap={{ scale: 0.85 }}
                onClick={handleCapture}
                className="relative w-[84px] h-[84px] rounded-full flex items-center justify-center mx-auto group"
              >
                <div className="absolute inset-0 rounded-full border border-[#CCFF00]/40 group-hover:border-[#CCFF00] transition-colors animate-[spin_4s_linear_infinite]" style={{ borderTopColor: 'transparent', borderBottomColor: 'transparent' }} />
                <div className="absolute inset-2 rounded-full border-2 border-[#CCFF00]/20" />
                <div className="w-[64px] h-[64px] rounded-full bg-[#CCFF00] transition-transform group-hover:scale-95 flex items-center justify-center shadow-[0_0_30px_rgba(204,255,0,0.3)] z-10">
                  <Aperture className="w-8 h-8 text-black opacity-80 group-hover:rotate-90 transition-transform duration-500" />
                </div>
              </motion.button>
              
              <div className="w-12 h-12" /> {/* Spacer for balance */}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // EDITOR MODE
  return (
    <div className="min-h-[100dvh] bg-[#090A0C] text-gray-200 pb-safe relative font-sans">
      {/* Terminal Header */}
      <div className="px-6 pt-12 pb-4 bg-[#090A0C]/90 backdrop-blur-md sticky top-0 z-20 border-b border-white/5">
        <div className="flex items-start justify-between">
          <button onClick={() => setMode("camera")} className="p-2 -ml-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-right">
            <h1 className="text-lg font-bold font-mono tracking-tighter text-[#CCFF00] flex items-center justify-end gap-2">
              ARCHIVE_EDITOR <Sparkles className="w-4 h-4" />
            </h1>
            <p className="text-[10px] font-mono text-gray-500 mt-1 uppercase">Object Metadata Extraction</p>
          </div>
        </div>
      </div>

      <div className="p-6 pt-6">
        {/* Preview Area */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black border border-[#CCFF00]/20 mb-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <img src={scanImage} alt="Scanned item" className={`w-full h-full object-cover transition-all duration-700 ${aiStatus === 'analyzing' ? 'grayscale opacity-40 scale-105' : 'grayscale-0 opacity-90 scale-100'}`} />
          
          {/* AI Scanning Overlay */}
          <AnimatePresence>
            {aiStatus === "analyzing" && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col p-6 font-mono"
              >
                <div className="relative w-full h-full border border-[#CCFF00]/30 rounded-xl overflow-hidden p-4 flex flex-col justify-end">
                  <motion.div 
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[1px] bg-[#CCFF00] shadow-[0_0_20px_rgba(204,255,0,1)] z-10"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border border-[#CCFF00]/20 flex items-center justify-center relative">
                      <div className="absolute inset-0 rounded-full border-t-2 border-[#CCFF00] animate-spin" />
                      <Loader2 className="w-6 h-6 text-[#CCFF00] opacity-50" />
                    </div>
                  </div>
                  
                  {/* Terminal Log Output */}
                  <div className="relative z-20 h-24 overflow-hidden flex flex-col justify-end">
                    {terminalLogs.map((log, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[10px] text-[#CCFF00] tracking-wider mb-1 drop-shadow-[0_0_2px_rgba(204,255,0,0.8)]"
                      >
                        {log}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scan Complete Badge */}
          <AnimatePresence>
            {aiStatus === "completed" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded text-[10px] font-mono text-[#CCFF00] border border-[#CCFF00]/30 flex items-center gap-1.5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse" />
                SCAN_SUCCESS
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Editor Form */}
        <div className="mb-8 min-h-[120px]">
          {aiStatus === "analyzing" ? (
            <div className="bg-white/5 border border-white/5 rounded-xl p-5 flex flex-col justify-center h-[140px] animate-pulse">
              <div className="h-4 bg-white/10 rounded w-1/3 mb-4" />
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-white/10 rounded w-16" />
                <div className="h-6 bg-white/10 rounded w-20" />
              </div>
              <div className="h-3 bg-white/10 rounded w-2/3" />
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="transition-all duration-500 bg-[#141518] border border-white/5 p-5 rounded-2xl shadow-lg"
            >
              <div className="flex items-center gap-2 mb-4 text-[#CCFF00]">
                <Wand2 className="w-4 h-4" />
                <span className="text-[10px] font-mono tracking-widest uppercase">Metadata Extracted</span>
              </div>
              
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent text-2xl font-bold text-white mb-5 border-b border-white/10 focus:border-[#CCFF00] outline-none pb-2 transition-colors placeholder:text-gray-600"
                placeholder="为它起个名字"
              />

              <div className="flex flex-wrap gap-2 relative pr-12">
                {category && <Tag variant="neon">{category}</Tag>}
                {tags.map((t, i) => <Tag key={i} variant="outline" className="border-white/10 text-gray-400 bg-white/5">{t}</Tag>)}
                <button 
                  onClick={() => setIsEditSheetOpen(true)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-[#CCFF00]/20 hover:text-[#CCFF00] rounded-full text-gray-400 transition-colors border border-white/10"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Story Editor */}
        <div className="mb-10">
          <label className="flex items-center justify-between text-sm font-medium text-gray-400 mb-3 px-1">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> 记录它的故事
            </span>
            <span className="text-[10px] text-gray-600 font-mono border border-gray-700 px-1.5 rounded">OPTIONAL</span>
          </label>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-[#CCFF00]/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity rounded-xl pointer-events-none" />
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="这个物件背后有什么记忆？比如它从哪里来，为什么留到现在..."
              className="w-full h-32 bg-[#141518] border border-white/10 rounded-xl p-4 text-white text-[15px] leading-relaxed placeholder:text-gray-600 focus:outline-none focus:border-[#CCFF00]/50 resize-none font-sans relative z-10 transition-colors shadow-inner"
            />
          </div>
        </div>

        {/* Save Button */}
        <Button 
          variant="primary" 
          size="lg" 
          className="w-full font-bold tracking-widest relative overflow-hidden group bg-[#CCFF00] text-black hover:bg-[#b3e600] border-none rounded-xl h-14"
          onClick={handleSave}
          isLoading={isSaving}
          disabled={aiStatus === 'analyzing'}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            保存至藏品库
            <Archive className="w-4 h-4" />
          </span>
        </Button>
      </div>

      {/* Edit Tags & Category Sheet */}
      <BottomSheet
        isOpen={isEditSheetOpen}
        onClose={() => setIsEditSheetOpen(false)}
        title="编辑分类与标签"
      >
        <div className="pb-4 font-sans">
          <div className="mb-6">
            <h4 className="text-sm font-medium text-white mb-3 flex items-center justify-between">
              所属分类
              <span className="text-[10px] text-[#CCFF00] font-mono border border-[#CCFF00]/30 px-1.5 rounded bg-[#CCFF00]/10">SINGLE</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {PRESET_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                    category === cat
                      ? "bg-[#CCFF00] text-black border-[#CCFF00] shadow-[0_0_10px_rgba(204,255,0,0.2)]"
                      : "bg-[#141518] text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h4 className="text-sm font-medium text-white mb-3 flex items-center justify-between">
              附加标签
              <span className="text-[10px] text-blue-400 font-mono border border-blue-400/30 px-1.5 rounded bg-blue-400/10">MULTIPLE</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {PRESET_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    tags.includes(tag)
                      ? "bg-white/10 text-white border-white/30"
                      : "bg-[#141518] text-gray-500 border-white/5 hover:bg-white/5 hover:text-gray-300"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <Button 
            variant="primary" 
            className="w-full rounded-xl h-12 font-bold bg-white text-black hover:bg-gray-200"
            onClick={() => setIsEditSheetOpen(false)}
          >
            完成编辑
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}