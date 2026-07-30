'use client';

import { FileText, AlertTriangle, CheckCircle, IndianRupee } from 'lucide-react';

export default function MetricsCards({ claims = [] }) {
  const totalClaims = claims.length;
  const highRiskCount = claims.filter((c) => c.risk_level === 'HIGH' || c.risk_score >= 65).length;
  const approvedCount = claims.filter((c) => c.reviewer_decision === 'APPROVED' || c.status === 'APPROVED').length;
  const totalBilled = claims.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);

  const metrics = [
    {
      label: 'Total Claims Audited',
      value: totalClaims,
      subtext: 'Document evidence loaded',
      icon: FileText,
      color: 'from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/20',
      iconBg: 'bg-blue-500/10 text-blue-400'
    },
    {
      label: 'High Fraud Risk Flagged',
      value: highRiskCount,
      subtext: `${totalClaims > 0 ? Math.round((highRiskCount / totalClaims) * 100) : 0}% flag rate`,
      icon: AlertTriangle,
      color: 'from-rose-500/20 to-rose-600/5 text-rose-400 border-rose-500/20',
      iconBg: 'bg-rose-500/10 text-rose-400'
    },
    {
      label: 'Approved Reimbursements',
      value: approvedCount,
      subtext: 'Passed compliance checks',
      icon: CheckCircle,
      color: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20',
      iconBg: 'bg-emerald-500/10 text-emerald-400'
    },
    {
      label: 'Total Claimed Value',
      value: `₹${totalBilled.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      subtext: 'Active pipeline volume',
      icon: IndianRupee,
      color: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/20',
      iconBg: 'bg-amber-500/10 text-amber-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div
            key={idx}
            className={`glass-panel glass-panel-hover p-5 rounded-2xl bg-gradient-to-br ${m.color} border`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-300">{m.label}</span>
              <div className={`p-2.5 rounded-xl ${m.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{m.value}</div>
              <div className="text-xs text-slate-400 font-medium mt-1">{m.subtext}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
