import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { resetAndSeedDatabase } from '../config/database.js';
import { saveDocumentCopies, getAllSavedBills } from '../services/storageService.js';
import { checkForDuplicate } from '../services/duplicateService.js';
import { extractFieldsFromDocument, validateMedicalDocument } from '../services/ocrService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { analyzeDocumentMetadata } from '../services/metadataService.js';
import { validateMedicines, validatePrice } from '../services/validationService.js';
import { verifyDoctor, verifyProvider } from '../services/verificationService.js';
import { calculateFraudScore } from '../services/scoringService.js';

export function getAllClaims(req, res) {
  try {
    const { status, risk_level, search } = req.query;
    let query = 'SELECT * FROM claims WHERE 1=1';
    const params = [];

    if (status && status !== 'ALL') {
      query += ' AND status = ?';
      params.push(status);
    }
    if (risk_level && risk_level !== 'ALL') {
      query += ' AND risk_level = ?';
      params.push(risk_level);
    }
    if (search) {
      query += ' AND (patient_name LIKE ? OR claim_number LIKE ? OR provider_name LIKE ? OR doctor_name LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY created_at DESC';

    const claims = db.prepare(query).all(...params);
    res.json({ success: true, data: claims });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export function getClaimById(req, res) {
  try {
    const { id } = req.params;
    const claim = db.prepare('SELECT * FROM claims WHERE id = ?').get(id);

    if (!claim) {
      return res.status(404).json({ success: false, error: 'Claim not found' });
    }

    const document = db.prepare('SELECT * FROM documents WHERE claim_id = ?').get(id);
    const analysis = db.prepare('SELECT * FROM fraud_analyses WHERE claim_id = ?').get(id);

    res.json({
      success: true,
      data: {
        ...claim,
        document,
        analysis: analysis ? {
          ...analysis,
          ocr_data: JSON.parse(analysis.ocr_data || '{}'),
          metadata_signals: JSON.parse(analysis.metadata_signals || '{}'),
          validation_results: JSON.parse(analysis.validation_results || '{}'),
          explainability_reasons: JSON.parse(analysis.explainability_reasons || '[]'),
          feature_vector: JSON.parse(analysis.feature_vector || '{}')
        } : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function uploadClaim(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No claim file uploaded.' });
    }

    const { originalname, buffer, mimetype } = req.file;

    // 1. Dual copy file storage & SHA-256 hash calculation
    const storageInfo = saveDocumentCopies(buffer, originalname);

    // 2. Validate if uploaded document is a valid medical bill
    const docValidation = await validateMedicalDocument(storageInfo.processingPath, originalname);
    if (!docValidation.isValid) {
      // Clean up temporary storage files
      try {
        if (fs.existsSync(storageInfo.originalPath)) fs.unlinkSync(storageInfo.originalPath);
        if (fs.existsSync(storageInfo.processingPath)) fs.unlinkSync(storageInfo.processingPath);
        if (storageInfo.allBillsPath && fs.existsSync(storageInfo.allBillsPath)) fs.unlinkSync(storageInfo.allBillsPath);
      } catch (err) {}

      return res.status(400).json({
        success: false,
        error: docValidation.reason || 'Invalid Document: Please upload a valid medical bill.'
      });
    }

    // 3. Check for duplicate document submissions
    const duplicateCheck = checkForDuplicate(storageInfo.fileHash);

    // 4. Extract OCR and structured fields
    const ocrData = await extractFieldsFromDocument(storageInfo.processingPath, originalname);

    // 4. Analyze document metadata signals
    const metadataCheck = analyzeDocumentMetadata(storageInfo.processingPath, originalname);

    // 5. Run validations
    const priceCheck = validatePrice(ocrData.amount);
    const medicineCheck = validateMedicines(ocrData.medicines);
    const doctorCheck = verifyDoctor(ocrData.reg_no, ocrData.doctor);
    const providerCheck = verifyProvider(ocrData.hospital);

    // 6. Calculate Explainable Fraud Score
    const scoringResult = calculateFraudScore({
      duplicateCheck,
      metadataCheck,
      priceValidation: priceCheck,
      medicineValidation: medicineCheck,
      doctorVerification: doctorCheck,
      providerVerification: providerCheck
    });

    const claimId = `clm-${Date.now()}`;
    const claimNumber = `CLM-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const initialStatus = scoringResult.score >= 65 || duplicateCheck.is_duplicate ? 'FLAGGED' : 'PENDING';

    // Save claim record
    db.prepare(`
      INSERT INTO claims (
        id, claim_number, status, patient_name, provider_name, doctor_name,
        registration_number, invoice_number, invoice_date, total_amount,
        risk_score, risk_level, reviewer_decision, reviewer_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'UNDER_REVIEW', '')
    `).run(
      claimId,
      claimNumber,
      initialStatus,
      ocrData.patient,
      ocrData.hospital,
      ocrData.doctor,
      ocrData.reg_no,
      ocrData.invoice_no,
      ocrData.invoice_date,
      ocrData.amount,
      scoringResult.score,
      scoringResult.risk_level
    );

    // Save document record
    const docId = `doc-${Date.now()}`;
    const docFileHash = storageInfo.fileHash;

    try {
      db.prepare(`
        INSERT INTO documents (id, claim_id, original_filename, file_size, mime_type, file_hash, original_path, processing_path)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        docId,
        claimId,
        originalname,
        storageInfo.fileSize,
        mimetype,
        docFileHash,
        storageInfo.originalPath,
        storageInfo.processingPath
      );
    } catch (err) {
      // Fallback if existing database file has UNIQUE constraint on file_hash
      db.prepare(`
        INSERT INTO documents (id, claim_id, original_filename, file_size, mime_type, file_hash, original_path, processing_path)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        docId,
        claimId,
        originalname,
        storageInfo.fileSize,
        mimetype,
        `${docFileHash}_dup_${Date.now()}`,
        storageInfo.originalPath,
        storageInfo.processingPath
      );
    }

    // Save fraud analysis record
    const analysisId = `anls-${claimId}`;
    db.prepare(`
      INSERT INTO fraud_analyses (id, claim_id, ocr_data, metadata_signals, validation_results, explainability_reasons, feature_vector)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      analysisId,
      claimId,
      JSON.stringify(ocrData),
      JSON.stringify(metadataCheck),
      JSON.stringify({
        duplicate_detected: duplicateCheck.is_duplicate,
        duplicate_details: duplicateCheck,
        doctor_verified: doctorCheck.verified,
        doctor_details: doctorCheck,
        provider_verified: providerCheck.verified,
        provider_details: providerCheck,
        price_validation: priceCheck,
        medicine_validation: medicineCheck
      }),
      JSON.stringify(scoringResult.reasons),
      JSON.stringify(scoringResult.feature_vector)
    );

    // Record audit log
    db.prepare(`
      INSERT INTO audit_logs (id, claim_id, action, actor, details)
      VALUES (?, ?, 'CLAIM_UPLOADED', 'SYSTEM', ?)
    `).run(`log-${Date.now()}`, claimId, `Uploaded ${originalname} - Risk Score: ${scoringResult.score}%`);

    res.json({
      success: true,
      message: 'Claim document uploaded and analyzed successfully.',
      data: {
        claim_id: claimId,
        claim_number: claimNumber,
        risk_score: scoringResult.score,
        risk_level: scoringResult.risk_level,
        status: initialStatus
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export function updateReviewerDecision(req, res) {
  try {
    const { id } = req.params;
    const { decision, notes } = req.body;

    if (!['APPROVED', 'REJECTED', 'NEEDS_INFO', 'UNDER_REVIEW'].includes(decision)) {
      return res.status(400).json({ success: false, error: 'Invalid reviewer decision state.' });
    }

    const claim = db.prepare('SELECT * FROM claims WHERE id = ?').get(id);
    if (!claim) {
      return res.status(404).json({ success: false, error: 'Claim not found' });
    }

    const newStatus = decision === 'APPROVED' ? 'APPROVED' : decision === 'REJECTED' ? 'REJECTED' : 'FLAGGED';

    db.prepare(`
      UPDATE claims 
      SET reviewer_decision = ?, status = ?, reviewer_notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(decision, newStatus, notes || '', id);

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, claim_id, action, actor, details)
      VALUES (?, ?, 'REVIEW_DECISION_UPDATED', 'AUDITOR', ?)
    `).run(`log-${Date.now()}`, id, `Decision set to ${decision}. Notes: ${notes || 'None'}`);

    res.json({
      success: true,
      message: `Claim decision updated to ${decision}.`,
      data: { claim_id: id, decision, status: newStatus, notes }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export function triggerClaimAnalysis(req, res) {
  try {
    const { id } = req.params;
    const claim = db.prepare('SELECT * FROM claims WHERE id = ?').get(id);
    if (!claim) {
      return res.status(404).json({ success: false, error: 'Claim not found' });
    }

    const document = db.prepare('SELECT * FROM documents WHERE claim_id = ?').get(id);
    const ocrData = extractFieldsFromDocument(document ? document.processing_path : '', document ? document.original_filename : '');
    const metadataCheck = analyzeDocumentMetadata(document ? document.processing_path : '', document ? document.original_filename : '');

    const duplicateCheck = checkForDuplicate(document ? document.file_hash : '');
    const priceCheck = validatePrice(ocrData.amount);
    const medicineCheck = validateMedicines(ocrData.medicines);
    const doctorCheck = verifyDoctor(ocrData.reg_no, ocrData.doctor);
    const providerCheck = verifyProvider(ocrData.hospital);

    const scoringResult = calculateFraudScore({
      duplicateCheck,
      metadataCheck,
      priceValidation: priceCheck,
      medicineValidation: medicineCheck,
      doctorVerification: doctorCheck,
      providerVerification: providerCheck
    });

    db.prepare(`
      UPDATE claims
      SET risk_score = ?, risk_level = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(scoringResult.score, scoringResult.risk_level, id);

    db.prepare(`
      UPDATE fraud_analyses
      SET ocr_data = ?, metadata_signals = ?, validation_results = ?, explainability_reasons = ?, feature_vector = ?
      WHERE claim_id = ?
    `).run(
      JSON.stringify(ocrData),
      JSON.stringify(metadataCheck),
      JSON.stringify({
        duplicate_detected: duplicateCheck.is_duplicate,
        doctor_verified: doctorCheck.verified,
        provider_verified: providerCheck.verified,
        price_validation: priceCheck,
        medicine_validation: medicineCheck
      }),
      JSON.stringify(scoringResult.reasons),
      JSON.stringify(scoringResult.feature_vector),
      id
    );

    res.json({
      success: true,
      message: 'Re-analysis executed successfully.',
      data: {
        claim_id: id,
        risk_score: scoringResult.score,
        risk_level: scoringResult.risk_level,
        reasons: scoringResult.reasons
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export function getSavedBillsList(req, res) {
  try {
    const bills = getAllSavedBills();
    const allBillsDir = path.join(__dirname, '../../uploads/all_bills');
    
    const enriched = bills.map((b) => {
      const doc = db.prepare(`
        SELECT d.*, c.claim_number, c.patient_name, c.provider_name, c.risk_score, c.risk_level
        FROM documents d
        LEFT JOIN claims c ON d.claim_id = c.id
        WHERE d.original_filename LIKE ? OR d.processing_path LIKE ?
      `).get(`%${b.filename}%`, `%${b.filename}%`);

      return {
        ...b,
        claim_number: doc ? doc.claim_number : 'CLM-SAVED',
        patient_name: doc ? doc.patient_name : 'Medical Claim Evidence',
        provider_name: doc ? doc.provider_name : 'Medical Provider',
        risk_score: doc ? doc.risk_score : 0,
        risk_level: doc ? doc.risk_level : 'LOW'
      };
    });

    res.json({ success: true, data: enriched, folder_path: allBillsDir });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export function downloadSavedBill(req, res) {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads/all_bills', filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Bill file not found.' });
    }
    res.download(filePath, filename);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export function resetDatabaseHandler(req, res) {
  try {
    resetAndSeedDatabase();
    res.json({
      success: true,
      message: 'Database refreshed and re-seeded with Indian Rupee (INR) medical claim records.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
