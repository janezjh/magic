import React from 'react';
import { Globe, Play, Settings, Save } from 'lucide-react';

interface StartScreenProps {
  onStart: () => void;
  onOpenSettings: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, onOpenSettings }) => {
  return (
    <div className="relative h-screen w-full bg-black overflow-hidden flex flex-col items-center justify-center text-white font-sans">
      {/* Background Image Placeholder */}
      <div 
        className="absolute inset-0 z-0 opacity-60"
        style={{
          backgroundImage: 'url("https://picsum.photos/1080/1920?grayscale&blur=2")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-black/50 to-black"></div>

      {/* Content */}
      <div className="z-20 flex flex-col items-center w-full max-w-md px-6 animate-fade-in-up">
        <h1 className="text-6xl font-bold font-mono-tech tracking-tighter mb-2 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
          地球 Online
        </h1>
        <p className="text-sm font-mono text-cyan-200/70 mb-12 tracking-widest uppercase">
          System v4.2 // 需登录
        </p>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="group relative w-full mb-4 px-8 py-4 bg-white text-black font-bold text-xl tracking-widest clip-path-polygon hover:bg-cyan-400 transition-colors duration-300"
          style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
        >
          <div className="flex items-center justify-center gap-3">
            <Play className="w-6 h-6" />
            开始游戏
          </div>
          {/* Deco elements */}
          <div className="absolute left-1 top-1 w-2 h-2 bg-black/20" />
          <div className="absolute right-1 bottom-1 w-2 h-2 bg-black/20" />
        </button>

        {/* Continue Button */}
        <button
          disabled
          className="group relative w-full mb-4 px-8 py-4 bg-transparent border border-white/30 text-white/50 font-bold text-xl tracking-widest clip-path-polygon cursor-not-allowed"
           style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
        >
          <div className="flex items-center justify-center gap-3">
             <Save className="w-6 h-6" />
             继续游戏
          </div>
        </button>

         {/* Settings Button */}
         <button
          onClick={onOpenSettings}
          className="group relative w-full mb-12 px-8 py-4 bg-transparent border border-white/30 text-white font-bold text-xl tracking-widest clip-path-polygon hover:bg-white/10 transition-colors"
           style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
        >
          <div className="flex items-center justify-center gap-3">
             <Settings className="w-6 h-6" />
             游戏设置
          </div>
        </button>

        <div className="mt-8 flex items-center gap-2 text-cyan-500/80">
            <Globe className="w-4 h-4 animate-spin-slow" />
            <span className="text-xs font-mono">服务器: 华夏一区 [爆满]</span>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;