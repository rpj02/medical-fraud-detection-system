'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchClaimById, triggerReAnalysis } from '../../../lib/api';
import FraudScoreGauge from '../../../components/FraudScoreGauge';
import ExtractedFields from '../../../components/ExtractedFields';
import ValidationCards from '../../../components/ValidationCards';
import ReviewerPanel from '../../../components/ReviewerPanel';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function ClaimDetailPage() {
  const params = useParams();
  const claimId = params.id;

  const [claimData, setClaimData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reAnalyzing, setReAnalyzing] = useState(false);

  const loadClaimDetails = async () => {
    setLoading(true);
    try {
      const res = await fetchClaimById(claimId);
      if (res.success) {
        setClaimData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (claimId) loadClaimDetails();
  }, [claimId]);

  const handleReAnalyze = async () => {
    setReAnalyzing(true);
    try {
      const res = await triggerReAnalysis(claimId);
      if (res.success) {
        await loadClaimDetails();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-20 text-center text-slate-400 text-sm">
        Loading claim compliance record...
      </div>
    );
  }

  if (!claimData) {
    return (
      <div className="p-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Claim Not Found</h2>
        <Link href="/claims" className="inline-block text-sm text-blue-400 hover:underline">
          Return to Claims Audit Registry
        </Link>
      </div>
    );
  }

  const analysis = claimData.analysis || {};
  const ocr = analysis.ocr_data || {};
  const metadata = analysis.metadata_signals || {};
  const validations = analysis.validation_results || {};
  const reasons = analysis.explainability_reasons || [];

  return (
    <div className="space-y-6">
      {/* Navigation Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/claims"
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{claimData.claim_number}</h1>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {claimData.status}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Submitted Date: {claimData.created_at ? new Date(claimData.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        <button
          onClick={handleReAnalyze}
          disabled={reAnalyzing}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center space-x-2 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${reAnalyzing ? 'animate-spin' : ''}`} />
          <span>Re-Run AI Analysis</span>
        </button>
      </div>

      {/* Fraud Risk Gauge & Explainability */}
      <FraudScoreGauge
        score={claimData.risk_score}
        riskLevel={claimData.risk_level}
        reasons={reasons}
      />

      {/* Extracted Fields OCR Display */}
      <ExtractedFields ocrData={ocr} />

      {/* Detail Validation Checks */}
      <ValidationCards validations={validations} metadata={metadata} />

      {/* Reviewer Action & Compliance Panel */}
      <ReviewerPanel
        claimId={claimData.id}
        currentDecision={claimData.reviewer_decision}
        initialNotes={claimData.reviewer_notes}
        onUpdated={loadClaimDetails}
      />
    </div>
  );
}
