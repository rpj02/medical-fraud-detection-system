import db from '../config/database.js';
import { generateAuditPdfReport } from '../services/pdfReportService.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPORTS_DIR = path.join(__dirname, '../../reports');

export async function generateReport(req, res) {
  try {
    const { id } = req.params;
    const claim = db.prepare('SELECT * FROM claims WHERE id = ?').get(id);

    if (!claim) {
      return res.status(404).json({ success: false, error: 'Claim not found' });
    }

    const analysis = db.prepare('SELECT * FROM fraud_analyses WHERE claim_id = ?').get(id);

    const reportInfo = await generateAuditPdfReport(claim, analysis);

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, claim_id, action, actor, details)
      VALUES (?, ?, 'REPORT_GENERATED', 'SYSTEM', ?)
    `).run(`log-${Date.now()}`, id, `Generated PDF report ${reportInfo.fileName}`);

    res.json({
      success: true,
      message: 'PDF Report generated successfully.',
      data: {
        claim_id: id,
        file_name: reportInfo.fileName,
        download_url: `/api/claims/${id}/report/download`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export function downloadReport(req, res) {
  try {
    const { id } = req.params;
    const claim = db.prepare('SELECT * FROM claims WHERE id = ?').get(id);

    if (!claim) {
      return res.status(404).json({ success: false, error: 'Claim not found' });
    }

    const fileName = `Audit_Report_${claim.claim_number}.pdf`;
    const filePath = path.join(REPORTS_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      // Generate on the fly if not yet created
      const analysis = db.prepare('SELECT * FROM fraud_analyses WHERE claim_id = ?').get(id);
      generateAuditPdfReport(claim, analysis).then(() => {
        res.download(filePath, fileName);
      }).catch(err => {
        res.status(500).json({ success: false, error: err.message });
      });
      return;
    }

    res.download(filePath, fileName);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
