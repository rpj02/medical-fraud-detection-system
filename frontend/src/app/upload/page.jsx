'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadClaimDocument } from '../../lib/api';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a medical bill document to upload.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const res = await uploadClaimDocument(selectedFile);
      if (res.success && res.data && res.data.claim_id) {
        // Redirect directly to the newly created claim audit room
        router.push(`/claims/${res.data.claim_id}`);
      } else {
        setError(res.error || 'Upload failed.');
        setUploading(false);
      }
    } catch (err) {
      setError(err.message || 'Error communicating with backend.');
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Upload Claim Document
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Upload a medical bill, hospital discharge summary, or pharmacy receipt for automated fraud screening.
        </p>
      </div>

      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/60 text-rose-200 border-2 border-rose-500/60 text-xs font-medium flex items-center space-x-3 shadow-xl">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-white text-sm block">Invalid Document</span>
              <span className="text-rose-300 font-medium text-xs leading-relaxed">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleUploadSubmit} className="space-y-6">
          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
              selectedFile
                ? 'border-blue-500 bg-blue-500/5'
                : 'border-slate-700 bg-slate-900/40 hover:border-slate-600'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer space-y-3 block">
              {selectedFile ? (
                <div className="space-y-2">
                  <div className="p-3 rounded-full bg-blue-500/20 text-blue-400 w-12 h-12 mx-auto flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-white block">{selectedFile.name}</span>
                    <span className="text-xs text-slate-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'Document'}
                    </span>
                  </div>
                  <span className="text-xs text-blue-400 font-semibold hover:underline block pt-1">
                    Click to change file
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-full bg-slate-800 text-blue-400 w-14 h-14 mx-auto flex items-center justify-center">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="font-bold text-base text-white block">
                      Click to upload or drag & drop claim file
                    </span>
                    <span className="text-xs text-slate-400">PDF, JPG, PNG, WEBP (Max size 25MB)</span>
                  </div>
                </div>
              )}
            </label>
          </div>

          {/* Dual Copy Audit Guarantee Info */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
            <div className="flex items-center space-x-2 font-bold text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Evidence Tampering Protection Active</span>
            </div>
            <p className="text-slate-400 pl-6">
              Uploaded files are stored in two copies: <code className="text-blue-300 bg-slate-800 px-1 py-0.5 rounded">original/</code> for legal auditability and <code className="text-blue-300 bg-slate-800 px-1 py-0.5 rounded">processing/</code> for OCR field extraction.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading || !selectedFile}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold text-sm shadow-xl shadow-blue-600/25 flex items-center justify-center space-x-2 transition-all"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Processing & Scoring Claim Fraud Risk...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Upload & Execute AI Fraud Analysis</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
