'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Download, FileText, Loader2 } from 'lucide-react';
import { submitReviewDecision, generatePdfReport, getReportDownloadUrl } from '../lib/api';

export default function ReviewerPanel({ claimId, currentDecision = 'UNDER_REVIEW', initialNotes = '', onUpdated }) {
  const [decision, setDecision] = useState(currentDecision);
  const [notes, setNotes] = useState(initialNotes);
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleDecisionSubmit = async (selectedDecision) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await submitReviewDecision(claimId, selectedDecision, notes);
      if (res.success) {
        setDecision(selectedDecision);
        setMessage({ type: 'success', text: `Decision updated to ${selectedDecision}.` });
        if (onUpdated) onUpdated();
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to record decision.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setReportLoading(true);
    try {
      const res = await generatePdfReport(claimId);
      if (res.success) {
        window.open(getReportDownloadUrl(claimId), '_blank');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-white">Reviewer Audit & Compliance Panel</h3>
          <p className="text-xs text-slate-400">Record formal reimbursement decision & notes</p>
        </div>
        <div className="text-xs font-semibold px-3 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
          Status: {decision}
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl text-xs font-medium border ${
            message.type === 'success'
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
              : 'bg-rose-950/40 text-rose-300 border-rose-800/40'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Reviewer Notes Textarea */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Compliance Auditor Notes & Case Context
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add auditor comments, findings, or reasons for decision..."
          className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
        />
      </div>

      {/* Decision Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => handleDecisionSubmit('APPROVED')}
          disabled={loading}
          className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-lg ${
            decision === 'APPROVED'
              ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-400'
              : 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Approve Claim</span>
        </button>

        <button
          onClick={() => handleDecisionSubmit('REJECTED')}
          disabled={loading}
          className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-lg ${
            decision === 'REJECTED'
              ? 'bg-rose-600 text-white shadow-rose-600/30 ring-2 ring-rose-400'
              : 'bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30'
          }`}
        >
          <XCircle className="w-4 h-4" />
          <span>Reject Claim</span>
        </button>

        <button
          onClick={() => handleDecisionSubmit('NEEDS_INFO')}
          disabled={loading}
          className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-lg ${
            decision === 'NEEDS_INFO'
              ? 'bg-amber-600 text-white shadow-amber-600/30 ring-2 ring-amber-400'
              : 'bg-amber-600/20 text-amber-300 border border-amber-500/30 hover:bg-amber-600/30'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Request Info</span>
        </button>
      </div>

      {/* PDF Export Section */}
      <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400">
          Generate official PDF compliance report for audit records.
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={handleGenerateReport}
            disabled={reportLoading}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all shadow-md"
          >
            {reportLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            ) : (
              <FileText className="w-4 h-4 text-blue-400" />
            )}
            <span>Generate & Download Audit PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
