import React, { useRef, useEffect } from 'react';
import { ChatMessage, StatChanges, InventoryUpdate } from '../types';
import { Send, ArrowUp, ArrowDown, ListTodo } from 'lucide-react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const StatDelta: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  if (value === 0) return null;
  const isPositive = value > 0;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-mono border px-1.5 py-0.5 rounded ${
      isPositive ? 'border-green-500/50 text-green-400 bg-green-500/10' : 'border-red-500/50 text-red-400 bg-red-500/10'
    }`}>
      {label} {isPositive ? '+' : ''}{value}
      {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
    </span>
  );
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading }) => {
  const [inputText, setInputText] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleSummaryClick = () => {
    if (!isLoading) {
      onSendMessage("请列出我所有的计划和当前状态");
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 relative ${
                msg.sender === 'user'
                  ? 'bg-cyan-900/40 border border-cyan-700/50 text-cyan-50'
                  : 'bg-slate-800 border border-slate-700 text-slate-300'
              }`}
            >
              {/* Text Content */}
              <div className="whitespace-pre-wrap text-sm leading-relaxed mb-2">
                {msg.sender === 'system' && <span className="text-cyan-500 font-bold block text-xs mb-1">📢 系统</span>}
                {msg.text}
              </div>

              {/* System Details (Stats/Inventory) */}
              {msg.sender === 'system' && msg.details && (
                <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-2">
                  
                  {/* Stat Changes */}
                  {(msg.details.statChanges && Object.values(msg.details.statChanges).some(v => v !== 0)) && (
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">📊 属性变动</div>
                      <div className="flex flex-wrap gap-2">
                        <StatDelta label="智力" value={msg.details.statChanges.int} />
                        <StatDelta label="体力" value={msg.details.statChanges.str} />
                        <StatDelta label="魅力" value={msg.details.statChanges.cha} />
                        <StatDelta label="金钱" value={msg.details.statChanges.money} />
                        <StatDelta label="疲劳" value={msg.details.statChanges.fatigue} />
                        <StatDelta label="灵感" value={msg.details.statChanges.inspiration} />
                      </div>
                    </div>
                  )}

                  {/* Inventory Changes */}
                  {msg.details.inventoryUpdates && msg.details.inventoryUpdates.length > 0 && (
                    <div className="space-y-1">
                       <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">🎒 物品清单更新</div>
                       <ul className="text-xs font-mono text-slate-400">
                          {msg.details.inventoryUpdates.map((item, idx) => (
                            <li key={idx}>
                              {item.name} {item.quantity_change > 0 ? `+${item.quantity_change}` : item.quantity_change}
                            </li>
                          ))}
                       </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex justify-start">
             <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
               <div className="flex items-center gap-1">
                 <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                 <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
               </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="汇报你的行动..."
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-md px-4 py-3 pr-10 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-sm font-sans"
                disabled={isLoading}
            />
          </div>
          
          {/* Summary Button */}
          <button
            type="button"
            onClick={handleSummaryClick}
            disabled={isLoading}
            className="bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 p-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed group relative"
            title="一键总结计划"
          >
             <ListTodo className="w-5 h-5" />
             <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                一键总结
             </span>
          </button>

          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="bg-cyan-600 hover:bg-cyan-500 text-white p-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;