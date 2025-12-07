import React, { useState, useRef, useEffect } from 'react';
import { PlayerStats } from '../types';
import { Brain, BicepsFlexed, Sparkles, Battery, Coins, Trophy, Edit2, ImagePlus } from 'lucide-react';

interface HUDProps {
  stats: PlayerStats;
  onUpdateStats: (updates: Partial<PlayerStats>) => void;
}

const HUD: React.FC<HUDProps> = ({ stats, onUpdateStats }) => {
  // Calculate percentage for progress bars
  const fatiguePercent = Math.min((stats.fatigue / 100) * 100, 100);
  const inspirationPercent = Math.min((stats.inspiration / 50) * 100, 100);

  // Editing States
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [isEditingLevel, setIsEditingLevel] = useState(false);
  const [editRoleValue, setEditRoleValue] = useState(stats.role);
  const [editLevelValue, setEditLevelValue] = useState(stats.level.toString());

  const roleInputRef = useRef<HTMLInputElement>(null);
  const levelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingRole && roleInputRef.current) roleInputRef.current.focus();
    if (isEditingLevel && levelInputRef.current) levelInputRef.current.focus();
  }, [isEditingRole, isEditingLevel]);

  const saveRole = () => {
    setIsEditingRole(false);
    if (editRoleValue.trim()) {
      onUpdateStats({ role: editRoleValue });
    } else {
      setEditRoleValue(stats.role);
    }
  };

  const saveLevel = () => {
    setIsEditingLevel(false);
    const newLevel = parseInt(editLevelValue);
    if (!isNaN(newLevel) && newLevel >= 0) {
      onUpdateStats({ level: newLevel });
    } else {
      setEditLevelValue(stats.level.toString());
    }
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = window.prompt("请输入头像图片链接 (URL):", stats.avatarUrl || "");
    if (url !== null) {
        onUpdateStats({ avatarUrl: url });
    }
  };

  return (
    <div className="w-full bg-slate-900/90 border-b border-cyan-900/50 backdrop-blur-md p-4 sticky top-0 z-50 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      
      {/* Top Row: Avatar/Level Info */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          
          {/* Avatar & Level (Clickable) */}
          <div className="relative group">
            <div 
                className="w-12 h-12 bg-cyan-900/30 rounded-full border-2 border-cyan-500 flex items-center justify-center relative overflow-hidden group-hover:border-white transition-colors cursor-pointer"
                onClick={handleAvatarClick}
            >
               {stats.avatarUrl ? (
                   <img src={stats.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                   <span className="text-xl">👤</span>
               )}
               
               {/* Hover Edit Icon Overlay */}
               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                   <ImagePlus className="w-4 h-4 text-white" />
               </div>
            </div>

             {/* Level Badge */}
             <div 
                className="absolute -bottom-1 -right-1 bg-cyan-600 text-white text-[10px] font-bold px-1 rounded min-w-[24px] text-center z-10 border border-slate-900 cursor-pointer hover:bg-cyan-500"
                onClick={() => {
                    setEditLevelValue(stats.level.toString());
                    setIsEditingLevel(true);
                }}
             >
                  {isEditingLevel ? (
                    <input 
                        ref={levelInputRef}
                        type="number"
                        className="w-8 bg-white text-black text-center outline-none p-0 no-spin"
                        value={editLevelValue}
                        onChange={(e) => setEditLevelValue(e.target.value)}
                        onBlur={saveLevel}
                        onKeyDown={(e) => e.key === 'Enter' && saveLevel()}
                        onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    `LV.${stats.level}`
                  )}
             </div>
          </div>

          <div>
            {/* Role/Name (Clickable) */}
            <div className="text-cyan-400 font-bold leading-none flex items-center gap-2 h-6">
                {isEditingRole ? (
                    <input 
                        ref={roleInputRef}
                        type="text"
                        className="bg-slate-800 border border-cyan-500 text-white px-1 py-0 rounded outline-none w-32 text-sm"
                        value={editRoleValue}
                        onChange={(e) => setEditRoleValue(e.target.value)}
                        onBlur={saveRole}
                        onKeyDown={(e) => e.key === 'Enter' && saveRole()}
                    />
                ) : (
                    <div 
                        className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors group"
                        onClick={() => {
                            setEditRoleValue(stats.role || "未设定角色");
                            setIsEditingRole(true);
                        }}
                    >
                        <span>{stats.role || "未设定角色"}</span>
                        <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                    </div>
                )}
            </div>
            <div className="text-slate-400 text-xs font-mono truncate max-w-[150px]">{stats.currentGoal || "未设定目标"}</div>
          </div>
        </div>

        <div className="flex flex-col items-end">
            <div className="flex items-center text-yellow-400 font-mono font-bold">
                <Coins className="w-4 h-4 mr-1" />
                {stats.money} G
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">金钱</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-slate-800/50 p-2 rounded border border-slate-700 flex flex-col items-center">
            <Brain className="w-5 h-5 text-blue-400 mb-1" />
            <span className="text-xs text-slate-400 uppercase">智力</span>
            <span className="text-lg font-mono font-bold">{stats.int}</span>
        </div>
        <div className="bg-slate-800/50 p-2 rounded border border-slate-700 flex flex-col items-center">
            <BicepsFlexed className="w-5 h-5 text-red-400 mb-1" />
            <span className="text-xs text-slate-400 uppercase">体力</span>
            <span className="text-lg font-mono font-bold">{stats.str}</span>
        </div>
        <div className="bg-slate-800/50 p-2 rounded border border-slate-700 flex flex-col items-center">
            <Sparkles className="w-5 h-5 text-purple-400 mb-1" />
            <span className="text-xs text-slate-400 uppercase">魅力</span>
            <span className="text-lg font-mono font-bold">{stats.cha}</span>
        </div>
      </div>

      {/* Bars */}
      <div className="space-y-2">
        {/* Fatigue */}
        <div className="relative w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div 
                className={`absolute left-0 top-0 h-full transition-all duration-500 ease-out flex items-center justify-end px-2 ${
                    fatiguePercent > 80 ? 'bg-red-600' : 'bg-green-600'
                }`}
                style={{ width: `${fatiguePercent}%` }}
            >
            </div>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tracking-wider z-10 mix-blend-difference text-white">
                <Battery className="w-3 h-3 mr-1" /> 疲劳度 {stats.fatigue}/100
            </div>
        </div>

        {/* Inspiration (Exp) */}
        <div className="relative w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div 
                className="absolute left-0 top-0 h-full bg-cyan-500 transition-all duration-500 ease-out"
                style={{ width: `${inspirationPercent}%` }}
            >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tracking-wider z-10 mix-blend-difference text-white">
                <Trophy className="w-3 h-3 mr-1" /> 灵感 {stats.inspiration}/50
            </div>
        </div>
      </div>

    </div>
  );
};

export default HUD;