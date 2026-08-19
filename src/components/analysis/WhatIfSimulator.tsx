import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { CivicCategory } from '../../types';
import { getWorkflowByCategory } from '../../engine/rulesEngine';

interface WhatIfSimulatorProps {
  category: CivicCategory;
  currentReadiness: number;
  evidenceChecked: Record<string, boolean>;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  category,
  currentReadiness,
  evidenceChecked,
}) => {
  const wf = getWorkflowByCategory(category);
  const missingItems = wf.evidenceItems.filter(item => !evidenceChecked[item.id]);

  const [simulatedItems, setSimulatedItems] = useState<Record<string, boolean>>({});

  const toggleSimulated = (id: string) => {
    setSimulatedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Calculate potential readiness boost
  let boost = 0;
  missingItems.forEach(item => {
    if (simulatedItems[item.id]) {
      boost += item.weight;
    }
  });

  const simulatedReadiness = Math.min(100, currentReadiness + boost);

  if (missingItems.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-2xl p-6 shadow-xl border border-indigo-800/40 relative overflow-hidden">
      <div className="flex items-center space-x-2 text-indigo-300">
        <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-wider">What-If Simulator</span>
      </div>

      <h3 className="text-lg font-bold mt-2">Simulate Potential Evidence Readiness</h3>
      <p className="text-xs text-indigo-200 mt-1">
        Toggle missing documents below to preview how acquiring them will strengthen your case position before taking action.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-4 bg-slate-900/60 p-4 rounded-xl border border-indigo-800/30">
        <div>
          <span className="text-[11px] text-slate-400 block">Current Readiness</span>
          <span className="text-2xl font-extrabold text-white">{currentReadiness}%</span>
        </div>
        <div>
          <span className="text-[11px] text-amber-300 block">Simulated Readiness</span>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-extrabold text-amber-400">{simulatedReadiness}%</span>
            {boost > 0 && (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-700">
                +{boost}%
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <span className="text-xs font-semibold text-slate-300 block">Try obtaining:</span>
        {missingItems.map(item => {
          const isSim = !!simulatedItems[item.id];
          return (
            <button
              key={item.id}
              onClick={() => toggleSimulated(item.id)}
              className={`w-full text-left flex items-center justify-between p-3 rounded-xl border text-xs transition ${
                isSim
                  ? 'bg-indigo-600/40 border-indigo-400 text-white'
                  : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isSim}
                  onChange={() => {}}
                  className="rounded text-indigo-500 focus:ring-indigo-400"
                />
                <span className="font-semibold">{item.title}</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full">
                +{item.weight}% Potential
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
