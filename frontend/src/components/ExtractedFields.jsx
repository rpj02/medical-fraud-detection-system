'use client';

import { Building2, UserCheck, CreditCard, Calendar, Hash, Pill, FileCode2 } from 'lucide-react';

export default function ExtractedFields({ ocrData = {} }) {
  const fields = [
    { label: 'Hospital / Provider', value: ocrData.hospital, icon: Building2 },
    { label: 'Attending Doctor', value: ocrData.doctor, icon: UserCheck },
    { label: 'Registration Number', value: ocrData.reg_no, icon: Hash },
    { label: 'Patient Name', value: ocrData.patient, icon: UserCheck },
    { label: 'Invoice Number', value: ocrData.invoice_no, icon: FileCode2 },
    { label: 'Invoice Date', value: ocrData.invoice_date, icon: Calendar },
    {
      label: 'Billed Amount',
      value: ocrData.amount ? `₹${Number(ocrData.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'N/A',
      icon: CreditCard,
      highlight: true
    },
  ];

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-white">Extracted Document Data (OCR)</h3>
          <p className="text-xs text-slate-400">Structured field extraction & parsing engine</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
          Confidence: {ocrData.ocr_confidence || 95}%
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((f, idx) => {
          const Icon = f.icon;
          return (
            <div key={idx} className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-slate-800 text-blue-400">
                <Icon className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">{f.label}</span>
                <span className={`text-sm font-bold truncate block ${f.highlight ? 'text-blue-400 text-base' : 'text-slate-100'}`}>
                  {f.value || 'Not Detected'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Extracted Medicines List */}
      <div className="pt-2">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          <Pill className="w-4 h-4 text-indigo-400" />
          <span>Extracted Prescribed Medicines / Procedure Items</span>
        </div>
        {ocrData.medicines && ocrData.medicines.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {ocrData.medicines.map((med, i) => (
              <span key={i} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800/90 text-slate-200 border border-slate-700/60">
                {med}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No prescribed items parsed.</p>
        )}
      </div>
    </div>
  );
}
