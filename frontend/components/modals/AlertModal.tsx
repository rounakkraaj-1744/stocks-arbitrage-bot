"use client";

import { Alert } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-xl flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>🔔</span>
                Alert Management
              </span>
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-sm"
              >
                Close
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Create New Alert Form */}
            <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <h3 className="text-white font-semibold mb-3">Create New Alert</h3>
              <AlertForm
                selectedStock={selectedStock}
                onCreateAlert={addAlert}
                stocks={stocks}
              />
            </div>

            {/* Active Alerts List */}
            <div>
              <h3 className="text-white font-semibold mb-3">Active Alerts ({alerts.length})</h3>
              {alerts.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No alerts set. Create one above.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border flex items-center justify-between ${
                        alert.triggered
                          ? 'bg-green-900/20 border-green-500/30'
                          : 'bg-slate-800/50 border-slate-700'
                      }`}
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium">
                          {alert.symbol} - {alert.type.replace('_', ' ').toUpperCase()}
                        </p>
                        <p className="text-slate-400 text-sm">
                          Trigger: {alert.type.includes('price') ? `₹${alert.value}` : `${alert.value}%`}
                          {alert.triggered && <span className="ml-2 text-green-400">✓ Triggered</span>}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {alert.triggered && (
                          <button
                            onClick={() => resetAlert(alert.id)}
                            className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-xs"
                          >
                            Reset
                          </button>
                        )}
                        <button
                          onClick={() => deleteAlert(alert.id)}
                          className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
