import React, { useState } from 'react';
import { Bot, Send, Sparkles, MessageSquare } from 'lucide-react';
import { askAIAssistant } from '../utils/api';

export default function AIAssistantPanel({ strategy, seed }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I am SATHI's AI Dispatch Assistant. Ask me anything about vehicle assignments, quadrant coverage, or priority capacity rules!"
    }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (customQuery) => {
    const textToSend = customQuery || query;
    if (!textToSend.trim()) return;

    const userMsg = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!customQuery) setQuery('');
    setLoading(true);

    try {
      const res = await askAIAssistant(textToSend, strategy, seed);
      setMessages(prev => [...prev, { sender: 'bot', text: res.answer }]);
    } catch (e) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error querying AI assistant.' }]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "Why was this vehicle chosen?",
    "Why did coverage drop?",
    "How is priority handled?"
  ];

  return (
    <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold text-slate-100 font-mono uppercase">
            AI Assistant Panel
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Grounded in Simulation
        </span>
      </div>

      {/* Suggested Questions */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-[#0B0F19] text-cyan-300 border border-slate-800 hover:border-cyan-500/50 transition"
          >
            "{q}"
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto max-h-[220px] space-y-2.5 mb-3 pr-1 text-xs font-sans">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-2.5 rounded-xl text-[11px] leading-relaxed font-mono ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none'
                  : 'bg-[#0B0F19] border border-slate-800 text-slate-200 rounded-bl-none'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-[10px] font-mono text-cyan-400 animate-pulse">
            Analyzing simulation telemetry...
          </div>
        )}
      </div>

      {/* Input Field */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask SATHI AI assistant..."
          className="flex-1 bg-[#0B0F19] border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 font-mono outline-none focus:border-cyan-500"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading}
          className="p-2 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
