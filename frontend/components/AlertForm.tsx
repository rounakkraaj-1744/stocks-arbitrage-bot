"use client";

import { useState } from 'react';
import { Alert } from '@/lib/types';

interface AlertFormProps {
  selectedStock: string;
  onCreateAlert: (symbol: string, type: Alert['type'], value: number) => void;
  stocks: string[];
}

export function AlertForm({ selectedStock, onCreateAlert, stocks }: AlertFormProps) {
  const [symbol, setSymbol] = useState(selectedStock);
  const [type, setType] = useState<Alert['type']>('spread_above');
  const [value, setValue] = useState<number>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value > 0) {
      onCreateAlert(symbol, type, value);
      setValue(1);
    }
  };

  const alertTypeInfo = {
    'spread_above': { icon: '📈', label: 'Spread Above', color: 'green' },
    'spread_below': { icon: '📉', label: 'Spread Below', color: 'red' },
    'price_above': { icon: '⬆️', label: 'Price Above', color: 'blue' },
    'price_below': { icon: '⬇️', label: 'Price Below', color: 'orange' },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Stock Selection */}
        <div>
          <label className="text-slate-300 text-sm font-medium mb-2 flex items-center gap-2">
            <span>📊</span> Stock Symbol
          </label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-900/80 text-white rounded-lg border border-slate-600/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium"
          >
            {stocks.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Alert Type */}
        <div>
          <label className="text-slate-300 text-sm font-medium mb-2 flex items-center gap-2">
            <span>{alertTypeInfo[type].icon}</span> Alert Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as Alert['type'])}
            className="w-full px-4 py-2.5 bg-slate-900/80 text-white rounded-lg border border-slate-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all font-medium"
          >
            <option value="spread_above">📈 Spread Above</option>
            <option value="spread_below">📉 Spread Below</option>
            <option value="price_above">⬆️ Price Above</option>
            <option value="price_below">⬇️ Price Below</option>
          </select>
        </div>

        {/* Trigger Value */}
        <div>
          <label className="text-slate-300 text-sm font-medium mb-2 flex items-center gap-2">
            <span>🎯</span> Trigger Value {type.includes('price') ? '(₹)' : '(%)'}
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={value}
            onChange={(e) => setValue(parseFloat(e.target.value))}
            className="w-full px-4 py-2.5 bg-slate-900/80 text-white rounded-lg border border-slate-600/50 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all font-medium"
            placeholder="Enter value"
            required
          />
        </div>
      </div>

      {/* Preview Badge */}
      <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
        <p className="text-xs text-slate-400 mb-2">Alert Preview:</p>
        <div className="flex items-center gap-2">
          <span className="text-lg">{alertTypeInfo[type].icon}</span>
          <span className="text-slate-300 text-sm font-medium">
            Notify when <span className="text-blue-400 font-bold">{symbol}</span>
            {' '}{type.replace('_', ' ')}
            {' '}<span className="text-green-400 font-bold">
              {type.includes('price') ? `₹${value}` : `${value}%`}
            </span>
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2"
      >
        <span className="text-lg">➕</span>
        Create Alert
      </button>
    </form>
  );
}
