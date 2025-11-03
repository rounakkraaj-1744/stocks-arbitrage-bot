"use client";

import { useState, useRef, useEffect } from 'react';
import { ArbitrageData } from '@/lib/types';
import { chatWithAI } from '@/lib/ai-client';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AIChatAssistantProps {
  currentData: { [key: string]: ArbitrageData };
  selectedStock?: string;
  onClose: () => void;
}

export function AIChatAssistant({ currentData, selectedStock, onClose }: AIChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m your AI trading assistant powered by advanced ML models. Ask me anything about:\n\n• Arbitrage opportunities\n• Market analysis & trends\n• Trading strategies\n• Risk assessment\n• Portfolio optimization\n\nHow can I help you today?',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatContainerRef.current && !chatContainerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatWithAI(input, { currentData, selectedStock });
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: '⚠️ Sorry, I encountered an error connecting to the AI service. Please check your backend connection and try again.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-end justify-end p-4 animate-fade-in">
      <div
        ref={chatContainerRef}
        className="flex flex-col bg-gradient-to-br from-slate-900 to-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl h-[600px] w-full max-w-md overflow-hidden animate-slide-up"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 border-b border-slate-700/50 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
              <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-50" />
            </div>
            <div>
              <span className="font-bold text-white text-base flex items-center gap-2">
                <span>💬</span>
                AI Trading Assistant
              </span>
              <span className="text-xs text-slate-400">Powered by Gemini</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-all p-2 hover:bg-slate-700/50 rounded-lg"
            title="Close (ESC)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto" style={{ minHeight: 0 }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`rounded-2xl px-4 py-3 max-w-[85%] break-words shadow-lg ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-gradient-to-br from-slate-800/90 to-slate-800/70 text-slate-100 border border-slate-700/50'
                }`}
              >
                <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-ul:my-2 prose-li:my-0.5 prose-headings:my-2 prose-headings:text-white prose-headings:font-bold prose-code:text-pink-400 prose-code:bg-slate-900/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-strong:text-white prose-strong:font-bold prose-a:text-blue-400 prose-a:underline prose-a:decoration-blue-400/50">
                  <ReactMarkdown
                    components={{
                      a: ({ node, ...props }) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" />
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
                <div className={`text-[10px] mt-2 text-right ${
                  msg.role === 'user' ? 'opacity-70' : 'opacity-50'
                }`}>
                  {new Date(msg.timestamp).toLocaleTimeString('en-IN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="px-4 py-3 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-800/70 text-slate-300 border border-slate-700/50 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                  <span className="text-sm ml-2 font-medium">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Fixed at Bottom */}
        <div className="border-t border-slate-700/50 bg-slate-900/80 backdrop-blur-sm px-4 py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything about trading..."
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-600/50 bg-slate-800/80 text-white placeholder-slate-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              autoFocus
              maxLength={500}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="font-bold px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/30 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="hidden sm:inline">Wait</span>
                </>
              ) : (
                <>
                  <span>Send</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
            <span>🤖 Powered by Gemini AI</span>
            <span>{messages.length} messages • Press ESC to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
