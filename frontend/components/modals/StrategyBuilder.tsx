"use client";

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface StrategyBuilderProps {
  onClose: () => void;
}

export function StrategyBuilder({ onClose }: StrategyBuilderProps) {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [threshold, setThreshold] = useState(0.5);
  const [stopLoss, setStopLoss] = useState(0.2);
  const [capitalAllocation, setCapitalAllocation] = useState(100000);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8080/api/trading/strategies");
      const data = await res.json();
      if (data.success) {
        setStrategies(data.strategies);
      }
    } catch (error) {
      toast.error("Failed to load strategies");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:8080/api/trading/strategies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          configuration: { threshold, stopLoss, capitalAllocation }
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Strategy saved!");
        setName("");
        fetchStrategies();
      } else {
        toast.error("Failed to save strategy");
      }
    } catch (error) {
      toast.error("Network error saving strategy");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-xl" onClick={onClose}>
      <div className="w-full max-w-3xl bg-gradient-to-br from-slate-900 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-800/50 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
              <span className="text-xl">⚙️</span>
            </div>
            <h2 className="text-xl font-bold text-white">Strategy Builder</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">✕</button>
        </div>
        
        <div className="p-6 flex gap-6 overflow-y-auto">
          {/* Create Strategy Form */}
          <form onSubmit={handleSave} className="flex-1 space-y-4 bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Strategy</h3>
            
            <div>
              <label className="text-slate-400 text-sm font-medium mb-1 block">Strategy Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none focus:border-teal-500" required />
            </div>

            <div>
              <label className="text-slate-400 text-sm font-medium mb-1 block">Entry Threshold (%)</label>
              <input type="number" step="0.1" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none focus:border-teal-500" required />
            </div>

            <div>
              <label className="text-slate-400 text-sm font-medium mb-1 block">Stop Loss (%)</label>
              <input type="number" step="0.1" value={stopLoss} onChange={(e) => setStopLoss(Number(e.target.value))} className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none focus:border-teal-500" required />
            </div>

            <div>
              <label className="text-slate-400 text-sm font-medium mb-1 block">Capital Allocation (₹)</label>
              <input type="number" value={capitalAllocation} onChange={(e) => setCapitalAllocation(Number(e.target.value))} className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none focus:border-teal-500" required />
            </div>

            <button type="submit" className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl font-bold shadow-lg transition-all mt-4">
              Save Strategy
            </button>
          </form>

          {/* Saved Strategies */}
          <div className="flex-1 space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Saved Strategies</h3>
            {isLoading ? (
              <p className="text-slate-400 animate-pulse">Loading...</p>
            ) : strategies.length === 0 ? (
              <p className="text-slate-500 text-sm">No strategies found.</p>
            ) : (
              <div className="space-y-3">
                {strategies.map(s => (
                  <div key={s.id} className="p-4 bg-slate-800 border border-slate-700 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-teal-400">{s.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${s.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                        {s.status}
                      </span>
                    </div>
                    <div className="text-sm text-slate-400">
                      <p>Config: {s.configuration}</p>
                      <p className="text-xs mt-2 opacity-50">Created: {new Date(s.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
