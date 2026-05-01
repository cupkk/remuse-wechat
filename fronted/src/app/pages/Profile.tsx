import React, { useState } from "react";
import { useNavigate } from "react-router";
import { TerminalHeader } from "../components/ui/TerminalHeader";
import { BottomSheet } from "../components/ui/BottomSheet";
import { mockUser } from "../mockData";
import { FileWarning, LogOut, Settings, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const [activeSheet, setActiveSheet] = useState<"stickers" | "guides" | "settings" | null>(null);
  const navigate = useNavigate();

  const handleAction = (msg: string) => {
    toast.success(msg);
    setActiveSheet(null);
  };

  return (
    <div className="min-h-full p-6 pt-12 text-white">
      <TerminalHeader title="USER_PROFILE" subtitle={`[${mockUser.isGuest ? 'GUEST' : 'REGISTERED'}] SYSTEM STATUS: ONLINE`} />

      <div className="flex items-center gap-4 mb-8 bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#CCFF00] to-green-600 flex items-center justify-center font-mono font-bold text-2xl text-black">
          {mockUser.name[0] || "U"}
        </div>
        <div>
          <h2 className="text-xl font-medium mb-1">{mockUser.name}</h2>
          <p className="text-xs text-[#CCFF00] font-mono tracking-widest">
            [{mockUser.isGuest ? "游客会话" : "已认证账户"}]
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-center">
          <span className="text-gray-400 text-sm mb-1 font-mono">归档数量 / ARCHIVES</span>
          <span className="text-3xl font-medium">{mockUser.archiveCount}</span>
        </div>
        <div 
          onClick={() => navigate('/results')}
          className="bg-white/5 border border-[#CCFF00]/20 rounded-2xl p-5 flex flex-col justify-center shadow-[inset_0_0_20px_rgba(204,255,0,0.05)] cursor-pointer hover:bg-white/10 transition-colors"
        >
          <span className="text-[#CCFF00] text-sm mb-1 font-mono">再生资产 / RESULTS</span>
          <span className="text-3xl font-medium text-white">{Object.values(mockUser.resultsCount).reduce((a, b) => a + b, 0)}</span>
        </div>
      </div>

      <div className="space-y-3">
        <button 
          onClick={() => navigate('/results')}
          className="w-full flex justify-between items-center bg-white/5 border border-white/10 rounded-xl p-4 text-left hover:bg-white/10 transition-colors"
        >
          <span className="font-medium text-[15px]">再生成果库</span>
          <span className="text-gray-500 font-mono">{"->"}</span>
        </button>
        <button 
          onClick={() => setActiveSheet('guides')}
          className="w-full flex justify-between items-center bg-white/5 border border-white/10 rounded-xl p-4 text-left hover:bg-white/10 transition-colors"
        >
          <span className="font-medium text-[15px]">改造指南收藏</span>
          <span className="text-gray-500 font-mono">{"->"}</span>
        </button>
        <button 
          onClick={() => setActiveSheet('settings')}
          className="w-full flex justify-between items-center bg-white/5 border border-white/10 rounded-xl p-4 text-left hover:bg-white/10 transition-colors"
        >
          <span className="font-medium text-[15px]">设置与账号治理</span>
          <span className="text-gray-500 font-mono">{"->"}</span>
        </button>
      </div>
      
      {mockUser.isGuest && (
        <div className="mt-12">
          <button 
            onClick={() => handleAction("跳转微信授权...")}
            className="w-full text-center py-4 bg-[#1a1c22] border border-[#CCFF00]/30 rounded-xl text-[#CCFF00] font-medium text-[15px]"
          >
            绑定微信，永久保存数字资产
          </button>
        </div>
      )}

      {/* Sheets */}
      <BottomSheet isOpen={activeSheet === 'stickers'} onClose={() => setActiveSheet(null)} title="贴纸图鉴库">
        <div className="pb-12 flex flex-col items-center justify-center pt-8 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-[#CCFF00]">
            <Zap className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">贴纸册尚未解锁</h3>
          <p className="text-sm text-gray-400 mb-6">生成更多旧物贴纸，点亮你的专属图鉴</p>
          <button onClick={() => setActiveSheet(null)} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm">
            我知道了
          </button>
        </div>
      </BottomSheet>

      <BottomSheet isOpen={activeSheet === 'guides'} onClose={() => setActiveSheet(null)} title="改造指南收藏">
        <div className="pb-12 flex flex-col items-center justify-center pt-8 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-gray-500">
            <FileWarning className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">暂无收藏</h3>
          <p className="text-sm text-gray-400">你还没有收藏过任何旧物改造指南</p>
        </div>
      </BottomSheet>

      <BottomSheet isOpen={activeSheet === 'settings'} onClose={() => setActiveSheet(null)} title="设置与账号治理">
        <div className="pb-8 space-y-2">
          <button onClick={() => handleAction("清理完成，共释放 12MB 空间")} className="w-full flex items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
            <Settings className="w-5 h-5 mr-3 text-gray-400" />
            <span className="flex-1 text-left text-[15px]">清理本地缓存</span>
            <span className="text-xs text-gray-500">12 MB</span>
          </button>
          <button onClick={() => handleAction("已阅读隐私协议")} className="w-full flex items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
            <ShieldCheck className="w-5 h-5 mr-3 text-gray-400" />
            <span className="flex-1 text-left text-[15px]">隐私协议与条款</span>
          </button>
          <button onClick={() => handleAction("账号已登出")} className="w-full flex items-center p-4 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors mt-4">
            <LogOut className="w-5 h-5 mr-3" />
            <span className="flex-1 text-left text-[15px]">退出当前账号</span>
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}