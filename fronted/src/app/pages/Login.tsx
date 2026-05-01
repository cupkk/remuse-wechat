import React, { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Button } from "../components/ui/Button";
import { Fingerprint, MessageSquare } from "lucide-react";
import { MobileLayout } from "../components/layout/MobileLayout";

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (type: "guest" | "wechat") => {
    setIsLoading(true);
    // Simulate login delay
    setTimeout(() => {
      setIsLoading(false);
      navigate("/");
    }, 1500);
  };

  return (
    <MobileLayout>
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-repeat text-white h-screen">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-16"
        >
          <div className="w-20 h-20 bg-[#CCFF00]/10 rounded-2xl border border-[#CCFF00]/20 flex items-center justify-center mb-6">
            <Fingerprint className="w-10 h-10 text-[#CCFF00]" />
          </div>
          <h1 className="text-4xl font-bold font-mono tracking-tighter mb-4 text-center">
            RE<span className="text-[#CCFF00]">-</span>MUSEUM
          </h1>
          <p className="text-gray-400 text-center text-sm font-light tracking-wide max-w-[240px] leading-relaxed">
            把舍不得丢掉的旧物，<br />归档为属于你的数字记忆。
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full space-y-4 max-w-sm"
        >
          <Button 
            className="w-full bg-[#07C160] hover:bg-[#06ad56] text-white border-none h-14 rounded-xl"
            onClick={() => handleLogin("wechat")}
            isLoading={isLoading}
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            微信一键登录
          </Button>

          <Button 
            variant="secondary"
            className="w-full h-14 rounded-xl font-mono text-sm"
            onClick={() => handleLogin("guest")}
            disabled={isLoading}
          >
            GUEST_ACCESS [ 游客体验 ]
          </Button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="absolute bottom-10 text-xs text-gray-600 font-mono text-center"
        >
          <p>Re-Museum Digital Archive</p>
          <p>v2.0 MVP</p>
        </motion.div>
      </div>
    </MobileLayout>
  );
}