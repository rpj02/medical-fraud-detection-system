import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_BASE = path.join(__dirname, '../../uploads');
const ORIGINAL_DIR = path.join(UPLOAD_BASE, 'original');
const PROCESSING_DIR = path.join(UPLOAD_BASE, 'processing');
const ALL_BILLS_DIR = path.join(UPLOAD_BASE, 'all_bills');

// Ensure upload directories exist
[ORIGINAL_DIR, PROCESSING_DIR, ALL_BILLS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

export function saveDocumentCopies(fileBuffer, originalFilename) {
  const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  const fileExt = path.extname(originalFilename) || '.pdf';
  const timestamp = Date.now();
  const safeBaseName = path.basename(originalFilename, fileExt).replace(/[^a-zA-Z0-9_-]/g, '_');
  
  const savedFilename = `${timestamp}_${safeBaseName}_${fileHash.substring(0, 8)}${fileExt}`;
  
  const originalPath = path.join(ORIGINAL_DIR, savedFilename);
  const processingPath = path.join(PROCESSING_DIR, savedFilename);
  const allBillsPath = path.join(ALL_BILLS_DIR, savedFilename);

  // Write exact original copy (immutable audit trail)
  fs.writeFileSync(originalPath, fileBuffer);
  // Write processing copy (for OCR and metadata extraction)
  fs.writeFileSync(processingPath, fileBuffer);
  // Save copy to central All Bills folder
  fs.writeFileSync(allBillsPath, fileBuffer);

  return {
    fileHash,
    fileSize: fileBuffer.length,
    originalPath,
    processingPath,
    allBillsPath,
    filename: savedFilename
  };
}

export function getAllSavedBills() {
  if (!fs.existsSync(ALL_BILLS_DIR)) return [];
  const files = fs.readdirSync(ALL_BILLS_DIR);
  return files.filter(f => !f.startsWith('.')).map(filename => {
    const filePath = path.join(ALL_BILLS_DIR, filename);
    const stats = fs.statSync(filePath);
    return {
      filename,
      filePath,
      fileSize: stats.size,
      createdAt: stats.birthtime || stats.mtime,
      viewUrl: `/uploads/all_bills/${filename}`,
      downloadUrl: `/api/bills/download/${filename}`
    };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
