'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, LayoutDashboard, FileText, Upload, FolderCheck } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Overview', icon: LayoutDashboard },
    { href: '/claims', label: 'Claims Audit', icon: FileText },
    { href: '/bills', label: 'Saved Bills', icon: FolderCheck },
    { href: '/upload', label: 'Upload Document', icon: Upload },
  ];

  return (
    <nav className="glass-panel sticky top-0 z-50 border-b border-slate-800/80 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent block">
              MediFraud Guard
            </span>
            <p className="text-xs text-slate-400 font-medium">Medical Reimbursement Intelligence</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-1 sm:space-x-2 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
