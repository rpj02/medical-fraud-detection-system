'use client';

import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react';

export default function FraudScoreGauge({ score = 0, riskLevel = 'LOW', reasons = [] }) {
  const normalizedScore = Math.min(100, Math.max(0, score));

  let colorClass = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  let badgeBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  let Icon = ShieldCheck;

  if (normalizedScore >= 65 || riskLevel === 'HIGH') {
    colorClass = 'text-rose-500 border-rose-500/30 bg-rose-500/10';
    badgeBg = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    Icon = ShieldAlert;
  } else if (normalizedScore >= 35 || riskLevel === 'MEDIUM') {
    colorClass = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    Icon = Shield;
  }

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg text-white">Explainable Fraud Risk Score</h3>
          <p className="text-xs text-slate-400">Automated signal aggregation & rule engine</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center space-x-1.5 ${badgeBg}`}>
          <Icon className="w-3.5 h-3.5" />
          <span>{riskLevel} RISK</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Semi-circle Gauge Meter */}
        <div className="relative w-48 h-28 flex flex-col items-center justify-end">
          <svg className="w-48 h-28 overflow-visible" viewBox="0 0 200 110">
            {/* Background Arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#1e293b"
              strokeWidth="20"
              strokeLinecap="round"
            />
            {/* Active Colored Arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={normalizedScore >= 65 ? '#ef4444' : normalizedScore >= 35 ? '#f59e0b' : '#22c55e'}
              strokeWidth="20"
              strokeLinecap="round"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (251.2 * normalizedScore) / 100}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute bottom-1 text-center">
            <span className="text-3xl font-extrabold text-white tracking-tight">{normalizedScore}%</span>
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Risk Index</span>
          </div>
        </div>

        {/* Explainability Reasons */}
        <div className="flex-1 w-full space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Primary Risk Factor Signals</h4>
          {reasons && reasons.length > 0 ? (
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {reasons.map((r, i) => (
                <div key={i} className="flex items-start space-x-2 text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="text-rose-400 font-bold shrink-0 mt-0.5">•</span>
                  <span className="text-slate-200 font-medium leading-relaxed">{r}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No suspicious risk factors detected.</p>
          )}
        </div>
      </div>
    </div>
  );
}
