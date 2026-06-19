"use client";

import { useState } from 'react';
import { Alert, AlertCondition } from '@/lib/types';

interface AlertFormProps {
  selectedStock: string;
  onCreateAlert: (symbol: string, type: Alert['type'], conditions: AlertCondition[]) => void;
  stocks: string[];
}

export function AlertForm({ selectedStock, onCreateAlert, stocks }: AlertFormProps) {
  const [symbol, setSymbol] = useState(selectedStock);
  const [conditions, setConditions] = useState<AlertCondition[]>([
    { field: 'spread', operator: 'above', value: 0.5 }
  ]);

  const addCondition = () => {
    setConditions([...conditions, { field: 'spot_price', operator: 'above', value: 0 }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, key: keyof AlertCondition, value: any) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], [key]: value };
    setConditions(newConditions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (conditions.length > 0) {
      onCreateAlert(symbol, conditions.length > 1 ? 'smart' : 'single', conditions);
      setConditions([{ field: 'spread', operator: 'above', value: 0.5 }]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      {/* Conditions Builder */}
      <div className="space-y-3">
        <label className="text-slate-300 text-sm font-medium flex items-center justify-between">
          <span className="flex items-center gap-2"><span>🎯</span> Conditions</span>
          <button 
            type="button" 
            onClick={addCondition}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 px-2 py-1 rounded border border-slate-600 transition-colors"
          >
            + Add AND Condition
          </button>
        </label>
        
        {conditions.map((cond, index) => (
          <div key={index} className="flex flex-wrap md:flex-nowrap items-center gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
            {index > 0 && <span className="text-xs font-bold text-orange-400 mr-2">AND</span>}
            <select
              value={cond.field}
              onChange={(e) => updateCondition(index, 'field', e.target.value)}
              className="flex-1 min-w-[100px] px-3 py-2 bg-slate-800 text-white rounded-md border border-slate-600 focus:border-purple-500 outline-none text-sm"
            >
              <option value="spread">Spread (%)</option>
              <option value="spot_price">Spot Price (₹)</option>
              <option value="futures_price">Futures Price (₹)</option>
            </select>
            
            <select
              value={cond.operator}
              onChange={(e) => updateCondition(index, 'operator', e.target.value)}
              className="w-24 px-3 py-2 bg-slate-800 text-white rounded-md border border-slate-600 focus:border-purple-500 outline-none text-sm"
            >
              <option value="above">&gt; Above</option>
              <option value="below">&lt; Below</option>
            </select>

            <input
              type="number"
              step="0.1"
              value={cond.value}
              onChange={(e) => updateCondition(index, 'value', parseFloat(e.target.value))}
              className="w-24 px-3 py-2 bg-slate-800 text-white rounded-md border border-slate-600 focus:border-green-500 outline-none text-sm"
              required
            />
            
            {conditions.length > 1 && (
              <button 
                type="button" 
                onClick={() => removeCondition(index)}
                className="p-2 text-red-400 hover:bg-red-500/20 rounded-md transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 mt-4"
      >
        <span className="text-lg">➕</span>
        Create {conditions.length > 1 ? 'Smart ' : ''}Alert
      </button>
    </form>
  );
}
