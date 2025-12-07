import React, { useState, useEffect, useCallback, useRef } from 'react';
import StartScreen from './components/StartScreen';
import HUD from './components/HUD';
import ChatInterface from './components/ChatInterface';
import { GamePhase, PlayerStats, InventoryItem, ChatMessage, TurnResponse } from './types';
import { processGameTurn, generateInitialGreeting } from './services/geminiService';
import { Volume2, VolumeX, X, Save } from 'lucide-react';

// Hardcoded m3u8 link as requested
const DEFAULT_BGM_URL = "https://mv6.music.tc.qq.com/15FAE2AA042F472D4CDDD04E85CB5D72B4AA541965A137EDBD5D335196E485E2602342CCB821E4E46315215F5470CBE1ZZqqmusic_default__v21518276b/qmmv_0b53hiabyaaa54agmfu34zsvioqadq5aahca.f9934.m3u8"; 

const INITIAL_STATS: PlayerStats = {
  level: 0,
  inspiration: 0,
  money: 0,
  int: 0,
  str: 0,
  cha: 0,
  fatigue: 0,
  role: '',
  currentGoal: '',
  avatarUrl: ''
};

function App() {
  const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.START);
  const [stats, setStats] = useState<PlayerStats>(INITIAL_STATS);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [setupStep, setSetupStep] = useState<0 | 1 | 2>(0); // 0: Start, 1: Role, 2: Goal

  // Audio State
  const [bgmUrl, setBgmUrl] = useState(DEFAULT_BGM_URL);
  const [tempBgmUrl, setTempBgmUrl] = useState(DEFAULT_BGM_URL);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const hlsRef = useRef<any>(null);

  // Initialize Audio with HLS support
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
        const Hls = (window as any).Hls;

        if (Hls && Hls.isSupported() && bgmUrl.includes('.m3u8')) {
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }
            const hls = new Hls();
            hlsRef.current = hls;
            hls.loadSource(bgmUrl);
            hls.attachMedia(audio);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                if (isPlaying) {
                    audio.play().catch(e => console.log("Auto-play blocked", e));
                }
            });
            hls.on(Hls.Events.ERROR, function (event: any, data: any) {
                if (data.fatal) {
                   console.warn("HLS Error:", data);
                   // Fallback logic could go here
                }
            });
        } else {
            // Fallback for native support (Safari) or standard mp3
            audio.src = bgmUrl;
        }
    } catch (err) {
        console.error("Audio Initialization Error:", err);
    }

    return () => {
        if (hlsRef.current) {
            hlsRef.current.destroy();
        }
    }
  }, [bgmUrl]);

  // Handle play state changes separately
  useEffect(() => {
     const audio = audioRef.current;
     if(audio && isPlaying) {
         audio.play().catch(e => console.log("Play failed", e));
     } else if (audio && !isPlaying) {
         audio.pause();
     }
  }, [isPlaying]);

  // Helper to add a message to state
  const addMessage = useCallback((sender: 'user' | 'system', text: string, details?: ChatMessage['details']) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(),
      sender,
      text,
      details
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  // Handle Game Start
  const handleStartGame = () => {
    setGamePhase(GamePhase.SETUP);
    setSetupStep(1);
    addMessage('system', '系统初始化完成。\n请输入您希望在此模拟中扮演的角色/职业 (例如: 学生, 工程师, 超级英雄)。');
    
    // Attempt to start audio on user interaction
    if (audioRef.current) {
        audioRef.current.volume = 0.5;
        setIsPlaying(true);
    }
  };

  const toggleMute = () => {
      if (audioRef.current) {
          audioRef.current.muted = !audioRef.current.muted;
          setIsMuted(!isMuted);
      }
  };

  const handleUpdateStats = (updates: Partial<PlayerStats>) => {
      setStats(prev => ({ ...prev, ...updates }));
  };

  const handleSaveSettings = () => {
    setBgmUrl(tempBgmUrl);
    setGamePhase(GamePhase.START);
  };

  // Handle User Input during different phases
  const handleUserMessage = async (text: string) => {
    addMessage('user', text);
    setIsLoading(true);

    if (gamePhase === GamePhase.SETUP) {
      if (setupStep === 1) {
        setStats(prev => ({ ...prev, role: text }));
        setSetupStep(2);
        setIsLoading(false);
        addMessage('system', `角色已确认: [${text}]。\n现在, 请设定您的当前首要目标 (例如: "通过考试", "存1万元", "减肥5斤")。`);
      } else if (setupStep === 2) {
        const updatedStats = { ...stats, currentGoal: text };
        setStats(updatedStats);
        setGamePhase(GamePhase.PLAYING);
        
        // Generate a dynamic welcome message
        const greeting = await generateInitialGreeting(updatedStats.role, text);
        setIsLoading(false);
        addMessage('system', greeting);
      }
      return;
    }

    if (gamePhase === GamePhase.PLAYING) {
      // Main Game Loop
      const result: TurnResponse = await processGameTurn(text, stats, inventory);
      
      // Update Stats
      let newLevel = stats.level;
      let newInspiration = stats.inspiration + result.stat_changes.inspiration;
      
      // Level Up Logic
      let levelUpMessage = '';
      if (newInspiration >= 50) {
        newLevel += 1;
        newInspiration = newInspiration - 50;
        levelUpMessage = "\n\n🎉 等级提升! 系统权限已扩展! 🎉";
      }

      setStats(prev => ({
        ...prev,
        level: newLevel,
        inspiration: newInspiration,
        money: prev.money + result.stat_changes.money,
        int: Math.max(0, prev.int + result.stat_changes.int),
        str: Math.max(0, prev.str + result.stat_changes.str),
        cha: Math.max(0, prev.cha + result.stat_changes.cha),
        fatigue: Math.max(0, Math.min(100, prev.fatigue + result.stat_changes.fatigue))
      }));

      // Update Inventory
      if (result.inventory_updates.length > 0) {
        setInventory(prev => {
          const newInv = [...prev];
          result.inventory_updates.forEach(update => {
            const idx = newInv.findIndex(i => i.name === update.name);
            if (idx >= 0) {
              newInv[idx].count += update.quantity_change;
              if (newInv[idx].count <= 0) newInv.splice(idx, 1);
            } else if (update.quantity_change > 0) {
              newInv.push({ name: update.name, count: update.quantity_change });
            }
          });
          return newInv;
        });
      }

      setIsLoading(false);
      addMessage('system', result.system_feedback + levelUpMessage, {
        statChanges: result.stat_changes,
        inventoryUpdates: result.inventory_updates
      });
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-950 font-sans text-slate-100">
      
      {/* Background Audio Player */}
      <audio ref={audioRef} loop crossOrigin="anonymous" />

      {/* Audio Controls (Fixed at bottom right) */}
      <button 
        onClick={toggleMute}
        className="fixed bottom-4 right-4 z-50 p-2 bg-slate-800/80 rounded-full border border-slate-600 hover:bg-cyan-900/80 transition-colors"
      >
          {isMuted ? <VolumeX className="w-5 h-5 text-slate-400" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
      </button>

      {/* Settings Modal */}
      {gamePhase === GamePhase.SETTINGS && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-cyan-500/50 p-6 rounded-lg max-w-md w-full shadow-[0_0_30px_rgba(34,211,238,0.2)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
                <span className="animate-pulse">⚙️</span> 系统设置
              </h2>
              <button onClick={() => setGamePhase(GamePhase.START)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-mono text-cyan-200/70 mb-2 uppercase tracking-wider">背景音乐链接 (URL)</label>
                <input 
                  type="text" 
                  value={tempBgmUrl}
                  onChange={(e) => setTempBgmUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-sm text-slate-300 focus:border-cyan-500 outline-none font-mono"
                  placeholder="请输入MP3/M3U8链接..."
                />
                <p className="text-[10px] text-slate-500 mt-2">
                  * 默认为《恋与深空》主题曲 (M3U8格式)。
                </p>
              </div>
            </div>

            <button 
              onClick={handleSaveSettings}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded flex items-center justify-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              保存设置
            </button>
          </div>
        </div>
      )}

      {gamePhase === GamePhase.START && (
        <StartScreen 
          onStart={handleStartGame} 
          onOpenSettings={() => {
            setTempBgmUrl(bgmUrl);
            setGamePhase(GamePhase.SETTINGS);
          }}
        />
      )}

      {(gamePhase === GamePhase.SETUP || gamePhase === GamePhase.PLAYING) && (
        <div className="flex flex-col h-full max-w-lg mx-auto w-full border-x border-slate-800 shadow-2xl relative">
          
          <HUD stats={stats} onUpdateStats={handleUpdateStats} />
          
          <div className="flex-1 overflow-hidden relative">
             {/* Subtle scanline effect overlay */}
             <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] z-10 opacity-20"></div>
             
             <ChatInterface 
                messages={messages} 
                onSendMessage={handleUserMessage}
                isLoading={isLoading} 
             />
          </div>

        </div>
      )}
    </div>
  );
}

export default App;