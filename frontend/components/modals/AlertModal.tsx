"use client";

import { Alert } from '@/lib/types';
import { AlertForm } from '@/components/AlertForm';
import toast from 'react-hot-toast';

interface AlertModalProps {
  alerts: Alert[];
  selectedStock: string;
  stocks: string[];
  onClose: () => void;
  setAlerts: (alerts: Alert[] | ((prev: Alert[]) => Alert[])) => void;
}

export function AlertModal({
  alerts,
  selectedStock,
  stocks,
  onClose,
  setAlerts,
}: AlertModalProps) {
  const addAlert = (symbol: string, type: Alert['type'], value: number) => {
    const newAlert: Alert = {
      id: `${Date.now()}-${Math.random()}`,
      symbol,
      type,
      value,
      triggered: false,
      createdAt: Date.now(),
    };
    setAlerts((prev) => [...prev, newAlert]);
    toast.success(`Alert created for ${symbol}`);
  };

  const deleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast.success("Alert deleted");
  };

  const resetAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, triggered: false } : a))
    );
    toast.success("Alert reset");
  };

  const activeAlerts = alerts.filter(a => !a.triggered);
  const triggeredAlerts = alerts.filter(a => a.triggered);

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-xl"
      onClick={onClose}
    >
      <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center">
                <span className="text-2xl">🔔</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Alert Management</h2>
                <p className="text-sm text-slate-400">Monitor price movements and spread changes</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 rounded-xl transition-all duration-200 flex items-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">

            {/* Create New Alert Form */}
            <div className="mb-6 p-5 bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-xl border border-slate-700/50 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                  <span className="text-lg">➕</span>
                </div>
                <h3 className="text-white font-bold text-lg">Create New Alert</h3>
              </div>
              <AlertForm
                selectedStock={selectedStock}
                onCreateAlert={addAlert}
                stocks={stocks}
              />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Active Alerts</p>
                    <p className="text-2xl font-bold text-blue-400">{activeAlerts.length}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                    <span className="text-xl">📢</span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Triggered</p>
                    <p className="text-2xl font-bold text-green-400">{triggeredAlerts.length}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                    <span className="text-xl">✅</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Alerts List */}
            {alerts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/50 flex items-center justify-center">
                  <span className="text-4xl">🔕</span>
                </div>
                <p className="text-slate-300 font-semibold text-lg mb-2">No Alerts Set</p>
                <p className="text-slate-500 text-sm">Create your first alert using the form above</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-white font-bold text-lg">All Alerts</h3>
                  <span className="px-2 py-1 bg-slate-700/50 border border-slate-600/50 rounded-full text-xs text-slate-300 font-semibold">
                    {alerts.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`group p-4 rounded-xl border transition-all duration-200 ${alert.triggered
                          ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 shadow-lg shadow-green-500/10'
                          : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 hover:border-slate-600/50'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${alert.triggered
                              ? 'bg-green-500/20 border border-green-500/40'
                              : 'bg-slate-700/50 border border-slate-600/50'
                            }`}>
                            <span className="text-lg">{alert.triggered ? '✅' : '🔔'}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-white font-bold">{alert.symbol}</p>
                              <span className="px-2 py-0.5 bg-slate-700/50 border border-slate-600/50 rounded text-xs text-slate-300 font-medium">
                                {alert.type.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <p className="text-slate-400">
                                Trigger: <span className="text-orange-400 font-semibold">
                                  {alert.type.includes('price') ? `₹${alert.value}` : `${alert.value}%`}
                                </span>
                              </p>
                              {alert.triggered && (
                                <span className="flex items-center gap-1 text-green-400 text-xs">
                                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                  Triggered
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {alert.triggered && (
                            <button
                              onClick={() => resetAlert(alert.id)}
                              className="px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 rounded-lg transition-all text-xs font-medium"
                            >
                              🔄 Reset
                            </button>
                          )}
                          <button
                            onClick={() => deleteAlert(alert.id)}
                            className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 rounded-lg transition-all text-xs font-medium"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
