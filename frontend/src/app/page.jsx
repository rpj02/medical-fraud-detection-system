'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MetricsCards from '../components/MetricsCards';
import { fetchClaims } from '../lib/api';
import { ShieldAlert, ArrowRight, Upload, AlertTriangle, CheckCircle, Clock, Search, FileText } from 'lucide-react';

export default function DashboardPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClaims()
      .then((res) => {
        if (res.success) setClaims(res.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const highRiskClaims = claims.filter((c) => c.risk_level === 'HIGH' || c.risk_score >= 65);

  return (
    <div className="space-y-8">
      {/* Hero Banner Header */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
            <span>Enterprise Compliance Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Medical Reimbursement Fraud Detection
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
            AI-assisted claim analysis, document OCR extraction, price benchmarking, doctor registry validation, and explainable risk scoring.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              href="/upload"
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload New Claim Document</span>
            </Link>
            <Link
              href="/claims"
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all flex items-center space-x-2"
            >
              <span>View All Claims Audit Room</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <MetricsCards claims={claims} />

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* High Risk Alerts (2 Cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">High Fraud Risk Priority Queue</h3>
                <p className="text-xs text-slate-400">Claims requiring immediate auditor review</p>
              </div>
            </div>
            <Link href="/claims?risk_level=HIGH" className="text-xs font-bold text-blue-400 hover:underline">
              View All ({highRiskClaims.length})
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Loading claims data...</div>
          ) : highRiskClaims.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800 text-slate-400 text-xs">
              No high risk claims currently flagged.
            </div>
          ) : (
            <div className="space-y-3">
              {highRiskClaims.slice(0, 4).map((claim) => (
                <div
                  key={claim.id}
                  className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-rose-500/40 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-white">{claim.claim_number}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Score: {claim.risk_score}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Patient: <span className="font-medium text-slate-100">{claim.patient_name}</span> • Provider: <span className="font-medium text-slate-100">{claim.provider_name}</span>
                    </p>
                    <p className="text-xs text-slate-400">Doctor: {claim.doctor_name || 'N/A'}</p>
                  </div>

                  <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-white block">
                        ₹{(claim.total_amount || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {claim.reviewer_decision}
                      </span>
                    </div>
                    <Link
                      href={`/claims/${claim.id}`}
                      className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow transition-all"
                    >
                      Audit Claim
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Upload Sidebar (1 Col) */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Upload className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-lg text-white">Instant Upload</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Submit a medical bill or reimbursement claim (PDF, JPG, PNG, WEBP) for real-time AI risk analysis.
            </p>
            <div className="p-6 rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/50 text-center space-y-3">
              <FileText className="w-10 h-10 text-blue-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-200">Drag & drop medical bill file here</p>
              <p className="text-[11px] text-slate-400">PDF, PNG, JPG supported up to 25MB</p>
              <Link
                href="/upload"
                className="inline-block px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow transition-all"
              >
                Browse File
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Dual Copy Storage Protection:</p>
            <p>Original files stored immutably for audit compliance.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
