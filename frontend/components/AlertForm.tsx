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

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-slate-400 text-xs mb-1 block">Stock</label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-blue-500 outline-none text-sm"
          >
            {stocks.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1 block">Alert Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as Alert['type'])}
            className="w-full px-3 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-blue-500 outline-none text-sm"
          >
            <option value="spread_above">Spread Above</option>
            <option value="spread_below">Spread Below</option>
            <option value="price_above">Price Above</option>
            <option value="price_below">Price Below</option>
          </select>
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1 block">
            Value {type.includes('price') ? '(₹)' : '(%)'}
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={value}
            onChange={(e) => setValue(parseFloat(e.target.value))}
            className="w-full px-3 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-blue-500 outline-none text-sm"
            required
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
      >
        Create Alert
      </button>
    </form>
  );
}
