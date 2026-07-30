'use client';

import { useState, useEffect } from 'react';
import { fetchSavedBills, getSavedBillDownloadUrl } from '../../lib/api';
import { FolderCheck, Download, ExternalLink, Image as ImageIcon, FileText, HardDrive, RefreshCw } from 'lucide-react';

export default function SavedBillsPage() {
  const [bills, setBills] = useState([]);
  const [folderPath, setFolderPath] = useState('');
  const [loading, setLoading] = useState(true);

  const loadBills = async () => {
    setLoading(true);
    try {
      const res = await fetchSavedBills();
      if (res.success) {
        setBills(res.data || []);
        setFolderPath(res.folder_path || '/Users/rishit/Desktop/Project/backend/uploads/all_bills');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, []);

  const API_HOST = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:5001';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Saved Bills Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Central repository of all uploaded medical bill photos and claim document evidence
          </p>
        </div>
        <button
          onClick={loadBills}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center space-x-2 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Files</span>
        </button>
      </div>

      {/* Central Folder Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center space-x-4 bg-gradient-to-r from-slate-900 to-blue-950/40">
        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
          <HardDrive className="w-6 h-6" />
        </div>
        <div className="overflow-hidden">
          <span className="text-xs font-bold text-slate-300 block">Central Server Storage Path:</span>
          <code className="text-xs font-mono text-blue-300 bg-slate-900/90 px-2.5 py-1 rounded border border-slate-800 truncate block mt-0.5">
            {folderPath || '/Users/rishit/Desktop/Project/backend/uploads/all_bills'}
          </code>
        </div>
      </div>

      {/* Saved Bills Grid */}
      {loading ? (
        <div className="glass-panel p-16 text-center text-slate-400 text-sm rounded-2xl border border-slate-800">
          Loading saved bill repository...
        </div>
      ) : bills.length === 0 ? (
        <div className="glass-panel p-16 text-center space-y-3 rounded-2xl border border-slate-800">
          <FolderCheck className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="font-bold text-base text-white">No Bill Photos Uploaded Yet</h3>
          <p className="text-xs text-slate-400">
            Upload your first medical bill document to save it here in the central vault.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bills.map((bill, idx) => {
            const isImage = /\.(png|jpe?g|webp)$/i.test(bill.filename);
            const viewUrl = `${API_HOST}${bill.viewUrl}`;
            const downloadUrl = `${API_HOST}${bill.downloadUrl}`;

            return (
              <div
                key={idx}
                className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition-all group"
              >
                <div className="space-y-3">
                  {/* File Preview Header */}
                  <div className="h-36 rounded-xl bg-slate-900 overflow-hidden relative flex items-center justify-center border border-slate-800">
                    {isImage ? (
                      <img
                        src={viewUrl}
                        alt={bill.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-center space-y-2">
                        <FileText className="w-12 h-12 text-blue-400 mx-auto" />
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          PDF Document File
                        </span>
                      </div>
                    )}
                    <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950/80 text-slate-300 border border-slate-700/80 backdrop-blur">
                      {(bill.fileSize / 1024).toFixed(1)} KB
                    </span>
                  </div>

                  {/* File Details */}
                  <div className="space-y-1">
                    <span className="font-bold text-sm text-white truncate block" title={bill.filename}>
                      {bill.filename}
                    </span>
                    <p className="text-xs text-slate-300">
                      Claim: <span className="font-medium text-slate-100">{bill.claim_number}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Uploaded: {bill.createdAt ? new Date(bill.createdAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <a
                    href={viewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                    <span>View Bill</span>
                  </a>

                  <a
                    href={downloadUrl}
                    download
                    className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
