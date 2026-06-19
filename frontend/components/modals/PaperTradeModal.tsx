"use client";

import { useState } from 'react';
import toast from 'react-hot-toast';

interface PaperTradeModalProps {
  onClose: () => void;
  selectedStock?: string;
  currentSpot?: number;
  currentFutures?: number;
}

export function PaperTradeModal({ onClose, selectedStock = "RELIANCE", currentSpot = 0, currentFutures = 0 }: PaperTradeModalProps) {
  const [symbol, setSymbol] = useState(selectedStock);
  const [type, setType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const spread = currentFutures - currentSpot;
      const res = await fetch("http://127.0.0.1:8080/api/trading/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          type,
          spotPrice: currentSpot,
          futuresPrice: currentFutures,
          quantity,
          spread
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Successfully placed ${type} order for ${quantity} ${symbol}`);
        onClose();
      } else {
        toast.error(data.error || "Failed to execute trade");
      }
    } catch (error) {
      toast.error("Network error executing trade");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-xl" onClick={onClose}>
      <div className="w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-800/50 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <span className="text-xl">💸</span>
            </div>
            <h2 className="text-xl font-bold text-white">Paper Trade</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">✕</button>
        </div>
        
        <form onSubmit={handleTrade} className="p-6 space-y-4">
          <div>
            <label className="text-slate-400 text-sm font-medium mb-1 block">Symbol</label>
            <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white outline-none focus:border-indigo-500" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-sm font-medium mb-1 block">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as 'buy'|'sell')} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white outline-none focus:border-indigo-500">
                <option value="buy">Buy (Long)</option>
                <option value="sell">Sell (Short)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-sm font-medium mb-1 block">Quantity</label>
              <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white outline-none focus:border-indigo-500" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div>
              <p className="text-xs text-slate-400">Current Spot</p>
              <p className="text-lg font-bold text-white">₹{currentSpot.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Current Futures</p>
              <p className="text-lg font-bold text-white">₹{currentFutures.toFixed(2)}</p>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg transition-all disabled:opacity-50">
            {isSubmitting ? 'Executing...' : 'Execute Paper Trade'}
          </button>
        </form>
      </div>
    </div>
  );
}
