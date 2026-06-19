"use client";

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface PortfolioDashboardProps {
  onClose: () => void;
}

export function PortfolioDashboard({ onClose }: PortfolioDashboardProps) {
  const [wallet, setWallet] = useState<any>(null);
  const [trades, setTrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [walletRes, tradesRes] = await Promise.all([
        fetch("http://127.0.0.1:8080/api/trading/wallet"),
        fetch("http://127.0.0.1:8080/api/trading/trades")
      ]);
      const walletData = await walletRes.json();
      const tradesData = await tradesRes.json();

      if (walletData.success) setWallet(walletData.wallet);
      if (tradesData.success) setTrades(tradesData.trades);
    } catch (error) {
      toast.error("Failed to load portfolio data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-xl" onClick={onClose}>
      <div className="w-full max-w-4xl bg-gradient-to-br from-slate-900 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-800/50 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
              <span className="text-xl">💼</span>
            </div>
            <h2 className="text-xl font-bold text-white">Portfolio Dashboard</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">✕</button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-24 bg-slate-800 rounded-xl"></div>
              <div className="h-64 bg-slate-800 rounded-xl"></div>
            </div>
          ) : (
            <>
              {/* Wallet Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-xl shadow-lg">
                  <p className="text-sm text-slate-400 mb-1">Total Balance</p>
                  <p className="text-3xl font-bold text-orange-400">
                    {wallet?.currency} {wallet?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-5 bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-xl shadow-lg">
                  <p className="text-sm text-slate-400 mb-1">Active Positions</p>
                  <p className="text-3xl font-bold text-blue-400">{trades.length}</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-xl shadow-lg">
                  <p className="text-sm text-slate-400 mb-1">Unrealized PnL</p>
                  <p className="text-3xl font-bold text-green-400">₹0.00</p>
                </div>
              </div>

              {/* Trade History */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-700 bg-slate-800">
                  <h3 className="font-bold text-white">Trade History</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-700">
                      <tr>
                        <th className="px-4 py-3 font-medium">Time</th>
                        <th className="px-4 py-3 font-medium">Symbol</th>
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Qty</th>
                        <th className="px-4 py-3 font-medium text-right">Spot</th>
                        <th className="px-4 py-3 font-medium text-right">Futures</th>
                        <th className="px-4 py-3 font-medium text-right">Spread</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {trades.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-slate-500">No trades executed yet</td>
                        </tr>
                      ) : (
                        trades.map(trade => (
                          <tr key={trade.id} className="hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-3 text-slate-300">{new Date(trade.timestamp).toLocaleString()}</td>
                            <td className="px-4 py-3 font-bold text-white">{trade.symbol}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${trade.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {trade.type.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-300">{trade.quantity}</td>
                            <td className="px-4 py-3 text-slate-300 text-right">₹{trade.spotPrice.toFixed(2)}</td>
                            <td className="px-4 py-3 text-slate-300 text-right">₹{trade.futuresPrice.toFixed(2)}</td>
                            <td className="px-4 py-3 font-medium text-right text-blue-400">{trade.spread.toFixed(2)}%</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
