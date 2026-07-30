'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchClaims, resetDatabase } from '../../lib/api';
import { Search, Filter, AlertTriangle, ShieldCheck, ShieldAlert, ArrowRight, RefreshCw, Database } from 'lucide-react';

export default function ClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [search, setSearch] = useState('');
  const [riskLevel, setRiskLevel] = useState('ALL');
  const [status, setStatus] = useState('ALL');

  const loadClaims = async () => {
    setLoading(true);
    try {
      const res = await fetchClaims({ search, risk_level: riskLevel, status });
      if (res.success) {
        setClaims(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDb = async () => {
    if (!confirm('Are you sure you want to refresh and reset the database with fresh INR sample data?')) return;
    setResetting(true);
    try {
      await resetDatabase();
      await loadClaims();
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, [search, riskLevel, status]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Claims Audit Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Comprehensive repository of submitted medical claims and risk analysis records
          </p>
        </div>
        <div className="flex items-center space-x-2 self-start md:self-auto">
          <button
            onClick={handleResetDb}
            disabled={resetting}
            className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs font-bold border border-rose-800/60 flex items-center space-x-2 transition-all shadow"
          >
            <Database className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>Reset & Seed Database</span>
          </button>
          <button
            onClick={loadClaims}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center space-x-2 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient, doctor, hospital or invoice..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Risk Level Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="HIGH">High Risk Only (≥65%)</option>
            <option value="MEDIUM">Medium Risk (35-64%)</option>
            <option value="LOW">Low Risk (&lt;35%)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Reviewer Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="FLAGGED">Flagged for Fraud</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Claims Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-sm">Loading claim registry...</div>
        ) : claims.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-sm">No claims found matching filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-4">Claim ID & Patient</th>
                  <th className="p-4">Hospital / Provider</th>
                  <th className="p-4">Attending Doctor</th>
                  <th className="p-4">Amount Billed</th>
                  <th className="p-4">Fraud Risk Score</th>
                  <th className="p-4">Review Decision</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {claims.map((claim) => {
                  const isHigh = claim.risk_level === 'HIGH' || claim.risk_score >= 65;
                  const isMed = claim.risk_level === 'MEDIUM' || (claim.risk_score >= 35 && claim.risk_score < 65);

                  return (
                    <tr key={claim.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-4 font-medium">
                        <span className="font-bold text-white block text-sm">{claim.claim_number}</span>
                        <span className="text-slate-300">{claim.patient_name || 'N/A'}</span>
                      </td>
                      <td className="p-4 text-slate-300 font-medium">
                        {claim.provider_name || 'N/A'}
                      </td>
                      <td className="p-4 text-slate-300">
                        <div>{claim.doctor_name || 'N/A'}</div>
                        <span className="text-[10px] text-slate-400">Reg: {claim.registration_number || 'N/A'}</span>
                      </td>
                      <td className="p-4 font-extrabold text-white text-sm">
                        ₹{(claim.total_amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md font-bold text-[11px] border ${
                            isHigh
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : isMed
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          {isHigh ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                          <span>{claim.risk_score}% ({claim.risk_level})</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-200 uppercase text-[11px]">
                          {claim.reviewer_decision || claim.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/claims/${claim.id}`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white font-bold border border-blue-500/30 transition-all"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
