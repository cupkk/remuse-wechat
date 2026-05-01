import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { MobileLayout } from "./MobileLayout";
import { TabBar } from "./TabBar";
import { BottomSheet } from "../ui/BottomSheet";
import { Camera, Image as ImageIcon } from "lucide-react";
import { motion } from "motion/react";
import { Toaster, toast } from "sonner";

export function RootLayout() {
  const [isScanSheetOpen, setScanSheetOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleScanAction = (type: "camera" | "album") => {
    toast.loading(`正在请求${type === "camera" ? "相机" : "相册"}权限...`, { id: "permission" });
    
    setTimeout(() => {
      toast.success("权限已获取", { id: "permission" });
      setScanSheetOpen(false);
      navigate(`/scan?mode=${type === "camera" ? "camera" : "editor"}`);
    }, 800);
  };

  const hideTabBar = location.pathname.startsWith("/scan") || location.pathname.startsWith("/item") || location.pathname.startsWith("/chat") || location.pathname === "/login";

  return (
    <MobileLayout>
      <Toaster theme="dark" position="top-center" className="font-mono text-sm" />
      <div className={`flex-1 overflow-y-auto ${!hideTabBar ? 'pb-24' : ''}`}>
        <Outlet />
      </div>
      
      {!hideTabBar && <TabBar onScanClick={() => setScanSheetOpen(true)} />}

      <BottomSheet
        isOpen={isScanSheetOpen}
        onClose={() => setScanSheetOpen(false)}
        title="上传旧物"
      >
        <div className="grid grid-cols-2 gap-4 mt-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleScanAction("camera")}
            className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors"
          >
            <div className="w-16 h-16 rounded-full bg-[#CCFF00]/10 flex items-center justify-center mb-4">
              <Camera className="w-8 h-8 text-[#CCFF00]" />
            </div>
            <span className="text-white font-medium text-base">拍照</span>
            <span className="text-gray-500 text-xs mt-1">直接记录当前旧物</span>
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleScanAction("album")}
            className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors"
          >
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
              <ImageIcon className="w-8 h-8 text-white" />
            </div>
            <span className="text-white font-medium text-base">相册选图</span>
            <span className="text-gray-500 text-xs mt-1">从历史照片中挑选</span>
          </motion.button>
        </div>
      </BottomSheet>
    </MobileLayout>
  );
}