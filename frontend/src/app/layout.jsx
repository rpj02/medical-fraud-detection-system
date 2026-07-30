import './globals.css';
import Navbar from '../components/Navbar';
import Script from 'next/script';

export const metadata = {
  title: 'MediFraud Guard - AI Medical Reimbursement Fraud Detection',
  description: 'AI-assisted medical reimbursement fraud detection platform with node.js backend and next.js dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
        <style>{`
          body {
            background-color: #090d16 !important;
            color: #f8fafc !important;
            font-family: system-ui, -apple-system, sans-serif !important;
          }
          .glass-panel {
            background: rgba(15, 23, 42, 0.75) !important;
            backdrop-filter: blur(16px) !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
          }
        `}</style>
      </head>
      <body className="antialiased selection:bg-blue-600 selection:text-white min-h-screen flex flex-col bg-[#090d16] text-slate-100">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
          <p>© 2026 MediFraud Guard Platform • Built with Next.js & Node.js Express Architecture</p>
        </footer>
      </body>
    </html>
  );
}
