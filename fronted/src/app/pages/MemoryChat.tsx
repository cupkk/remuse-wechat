import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { mockArchives } from "../mockData";
import { ChevronLeft, Send, Cpu, Sparkles, Database, FileText, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";

interface ChatMessage {
  id: string;
  role: "system" | "assistant" | "user";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

// Typewriter Effect Component
const TypewriterText = ({ text, onComplete }: { text: string, onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, index));
      index++;
      if (index > text.length) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 30); // 30ms per character
    
    return () => clearInterval(interval);
  }, [text, onComplete]);

  return (
    <>
      {displayedText}
      <motion.span 
        animate={{ opacity: [1, 0] }} 
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="inline-block w-2 h-[1em] bg-[#CCFF00] ml-1 align-middle"
      />
    </>
  );
};

export default function MemoryChat() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Initial Librarian Greeting
  useEffect(() => {
    setMessages([
      {
        id: "sys-1",
        role: "system",
        content: `> RAG_ENGINE_READY...\n> CONNECTING TO MEMORY_DB\n> INDEXED_ARCHIVES: ${mockArchives.length}\n> STATUS: ONLINE`,
        timestamp: new Date()
      },
      {
        id: "msg-1",
        role: "assistant",
        content: "你好，我是你的专属记忆提取终端。把一件旧物、一段故事、一个关键词或一个时间点交给我，我会遍历你的数字馆藏，帮你把那些碎片重新串接起来。",
        timestamp: new Date(),
        isTyping: true
      }
    ]);
  }, []);

  const handleTypingComplete = (id: string) => {
    setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, isTyping: false } : msg));
  };

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  const handleSend = () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    // Simulate AI RAG response based on keywords
    setTimeout(() => {
      let responseContent = "";
      const query = input.toLowerCase();

      // Simple keyword matching for RAG simulation
      if (query.includes("遗憾") || query.includes("忽略") || query.includes("错过")) {
        responseContent = `> QUERY MATCH: "遗憾"\n> RETRIEVING ARCHIVE: [A4]\n\n根据特征网络，检测到一枚【没送出去的宇航员徽章】。标签里记录着“遗憾”。这枚徽章的封存状态完好，也许有些记忆并不需要被强行弥补。安静地待在数据库里，就是它最好的归宿。需要为你检索其他关于“礼物”的节点吗？`;
      } else if (query.includes("雨") || query.includes("夏天") || query.includes("安静")) {
        responseContent = `> TIME_INDEX: "SUMMER_2023"\n> RETRIEVING ARCHIVE: [A1]\n\n在你的记忆阵列中，提取到【夏日最后的奶茶盖】。你曾记录下那场大雨里的安静。虽然物理水痕已经蒸发，但数字水印依旧清晰。当参数输入为“雨”时，它的权重最高。`;
      } else if (query.includes("时间") || query.includes("旧") || query.includes("小时候")) {
        responseContent = `> SEMANTIC_SEARCH: "CHILDHOOD_MEMORY"\n> RETRIEVING ARCHIVE: [A3]\n\n锁定节点：【蓝色玻璃药瓶】。内部曾盛放过糖果与沙子，现为“清空”状态。物品是时间的物理容器，虽然内容物已流失，但透明介质的透光率依然保持在原定参数。`;
      } else if (query.includes("音乐") || query.includes("现场") || query.includes("狂欢")) {
        responseContent = `> DETECTING EVENT_NODE...\n> RETRIEVING ARCHIVE: [A2]\n\n检测到高能量波动匹配：【迷笛音乐节票根】。代表生命周期中的高频共振阶段。纸质纤维记录了当时的声波震动。需要调用“再生工坊”模块，将其生成可视化手账吗？`;
      } else {
        responseContent = `> TRAVERSING ${mockArchives.length} ARCHIVES...\n> NO EXACT MATCH FOUND.\n\n从当前的标签网络（餐饮遗留、纪念物、包装容器）中，未发现直接映射。我发现你的底层数据很在意“情感留存”。请提供更精确的时间戳或情感特征值，以扩大检索半径。`;
      }
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
        isTyping: true
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
    }, 1500); // reduced wait time to account for typing effect duration
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-[#090A0C] text-gray-200 z-50 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#CCFF00]/10 bg-[#090A0C]/90 backdrop-blur-md shrink-0 pt-safe z-10">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-[#CCFF00]/10 hover:text-[#CCFF00] transition-colors mr-2 text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-[15px] font-bold text-white tracking-wider font-mono">MEMORY_TERMINAL</h1>
              <span className="bg-[#CCFF00]/10 text-[#CCFF00] text-[9px] px-1.5 py-0.5 rounded border border-[#CCFF00]/30 animate-pulse font-mono font-bold tracking-widest">
                RAG_ACTIVE
              </span>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">RE_MUSEUM NEURAL NETWORK</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-[10px] font-mono text-[#CCFF00] bg-[#CCFF00]/5 px-3 py-1.5 rounded-sm border border-[#CCFF00]/20 shadow-[0_0_10px_rgba(204,255,0,0.05)]">
          <Database className="w-3 h-3" />
          <span>NODES: {mockArchives.length}</span>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 scroll-smooth bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat opacity-95"
        style={{ backgroundSize: '60px' }}
      >
        <div className="flex flex-col space-y-6 max-w-full pb-6 pt-2">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={cn(
                  "flex flex-col max-w-[90%]",
                  msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start",
                  msg.role === "system" && "max-w-full items-start my-4 w-full"
                )}
              >
                {msg.role === "system" ? (
                  <div className="w-full flex flex-col items-start font-mono">
                    <div className="flex items-center gap-2 mb-2 text-gray-500">
                      <Terminal className="w-4 h-4" />
                      <span className="text-[10px] tracking-widest">SYSTEM_LOG</span>
                    </div>
                    <div className="w-full bg-[#111318] p-3 rounded border-l-2 border-gray-600 text-[11px] text-gray-400 whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col max-w-full relative group">
                    <div className={cn(
                      "relative rounded-xl px-4 py-3 text-[14px] leading-relaxed max-w-full break-words whitespace-pre-wrap",
                      msg.role === "user" 
                        ? "bg-white/10 text-white rounded-tr-sm border border-white/5" 
                        : "bg-[#111318] text-[#CCFF00]/90 rounded-tl-sm border border-[#CCFF00]/30 shadow-[0_0_15px_rgba(204,255,0,0.05)] ml-2 font-mono"
                    )}>
                      {msg.role === "assistant" && (
                        <div className="absolute -left-3 -top-2 w-6 h-6 bg-black rounded-sm border border-[#CCFF00]/50 flex items-center justify-center shadow-[0_0_10px_rgba(204,255,0,0.2)]">
                          <Sparkles className="w-3 h-3 text-[#CCFF00]" />
                        </div>
                      )}
                      
                      {msg.role === "assistant" && msg.isTyping ? (
                        <TypewriterText text={msg.content} onComplete={() => handleTypingComplete(msg.id)} />
                      ) : (
                        msg.content
                      )}
                    </div>
                    <span className={cn(
                      "text-[10px] text-gray-600 mt-1.5 font-mono",
                      msg.role === "user" ? "self-end" : "self-start ml-2"
                    )}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}

            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex max-w-[85%] mr-auto ml-2 relative"
              >
                <div className="bg-[#111318] border border-[#CCFF00]/30 rounded-xl rounded-tl-sm px-4 py-4 flex items-center gap-2 shadow-[0_0_15px_rgba(204,255,0,0.05)]">
                  <div className="absolute -left-3 -top-2 w-6 h-6 bg-black rounded-sm border border-[#CCFF00]/50 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-[#CCFF00]" />
                  </div>
                  <span className="text-[10px] text-[#CCFF00] font-mono tracking-widest">RETRIEVING</span>
                  <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1.5 h-3 bg-[#CCFF00]" />
                  <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-3 bg-[#CCFF00]" />
                  <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-3 bg-[#CCFF00]" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Input Area */}
      <div className="shrink-0 w-full bg-[#090A0C]/95 backdrop-blur-xl border-t border-[#CCFF00]/10 p-4 pb-safe relative z-20">
        <div className="flex items-center gap-2 bg-[#111318] border border-[#CCFF00]/20 focus-within:border-[#CCFF00] focus-within:shadow-[0_0_15px_rgba(204,255,0,0.15)] rounded-sm px-4 py-2 transition-all group">
          <div className="text-[#CCFF00] font-mono font-bold mr-1">{">"}</div>
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="输入检索关键词、时间点或情感描述..."
            className="flex-1 bg-transparent text-sm text-[#CCFF00] placeholder:text-[#CCFF00]/30 outline-none resize-none max-h-24 py-1.5 no-scrollbar font-mono caret-[#CCFF00]"
            rows={1}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="w-10 h-10 rounded border border-[#CCFF00]/30 bg-[#CCFF00]/10 text-[#CCFF00] flex items-center justify-center disabled:opacity-30 transition-all hover:bg-[#CCFF00] hover:text-black shrink-0"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}