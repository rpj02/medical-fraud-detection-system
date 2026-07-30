import db from '../config/database.js';

export function checkForDuplicate(fileHash) {
  const existingDoc = db.prepare(`
    SELECT d.*, c.claim_number, c.patient_name, c.created_at as original_claim_date 
    FROM documents d
    JOIN claims c ON d.claim_id = c.id
    WHERE d.file_hash = ?
  `).get(fileHash);

  if (existingDoc) {
    return {
      is_duplicate: true,
      matched_claim_id: existingDoc.claim_id,
      matched_claim_number: existingDoc.claim_number,
      matched_patient_name: existingDoc.patient_name,
      matched_file_hash: fileHash,
      original_submission_date: existingDoc.original_claim_date
    };
  }

  return {
    is_duplicate: false
  };
}
