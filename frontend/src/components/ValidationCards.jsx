'use client';

import { CheckCircle2, AlertCircle, AlertTriangle, ShieldCheck, IndianRupee, Pill, FileCode } from 'lucide-react';

export default function ValidationCards({ validations = {}, metadata = {} }) {
  const price = validations.price_validation || {};
  const medicine = validations.medicine_validation || {};
  const isDuplicate = validations.duplicate_detected;
  const isDoctorVerified = validations.doctor_verified;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* 1. Price Benchmark Check */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <IndianRupee className="w-5 h-5 text-amber-400" />
            <h4 className="font-bold text-sm text-white">Price Benchmark Analysis</h4>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
              price.status === 'FLAGGED'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {price.status || 'PASSED'}
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {price.detail || 'Claim amount compared against national procedure tariff references.'}
        </p>
        {price.expected_range && (
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
            <div>
              <span className="text-slate-400 block">Expected Cap:</span>
              <span className="font-bold text-slate-200">
                ₹{price.expected_range.min.toLocaleString('en-IN')} - ₹{price.expected_range.max.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block">Billed Variance:</span>
              <span className={`font-bold ${price.status === 'FLAGGED' ? 'text-rose-400' : 'text-emerald-400'}`}>
                {price.variance_percentage || '0%'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Medicine Formulary Check */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Pill className="w-5 h-5 text-indigo-400" />
            <h4 className="font-bold text-sm text-white">Pharmacopeia Formulary Check</h4>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
              medicine.status === 'WARNING'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {medicine.status || 'PASSED'}
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {medicine.message || 'Medicines cross-referenced with approved medical formulary index.'}
        </p>
        {medicine.unknown && medicine.unknown.length > 0 && (
          <div className="bg-amber-950/30 p-2.5 rounded-xl border border-amber-800/40 text-xs text-amber-300">
            <span className="font-bold block mb-1">Unrecognized Item Alert:</span>
            <ul className="list-disc list-inside space-y-0.5">
              {medicine.unknown.map((u, i) => (
                <li key={i}>{u}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 3. License & Duplicate Check */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h4 className="font-bold text-sm text-white">Doctor License Verification</h4>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
              isDoctorVerified
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}
          >
            {isDoctorVerified ? 'VERIFIED' : 'UNVERIFIED'}
          </span>
        </div>
        <p className="text-xs text-slate-300">
          {isDoctorVerified
            ? 'Physician license is active and matched against state council registry.'
            : 'Physician registration code not found in official registry database.'}
        </p>
      </div>

      {/* 4. PDF Metadata & SHA-256 Duplicate Check */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileCode className="w-5 h-5 text-purple-400" />
            <h4 className="font-bold text-sm text-white">Document Structure & Duplicate Check</h4>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
              isDuplicate || metadata.is_edited
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {isDuplicate ? 'DUPLICATE' : metadata.is_edited ? 'MODIFIED' : 'CLEAN'}
          </span>
        </div>
        <p className="text-xs text-slate-300">
          {isDuplicate
            ? 'Exact SHA-256 duplicate document submission detected.'
            : metadata.is_edited
            ? `Edited using ${metadata.editing_software || 'editing utility'}.`
            : 'Original untouched PDF document file structure verified.'}
        </p>
      </div>
    </div>
  );
}
