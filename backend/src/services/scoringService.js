/**
 * Composite Deterministic & Explainable Fraud Risk Scoring Algorithm
 */
export function calculateFraudScore({
  duplicateCheck,
  metadataCheck,
  priceValidation,
  medicineValidation,
  doctorVerification,
  providerVerification
}) {
  let score = 5.0; // Baseline low risk score
  const reasons = [];

  // 1. Exact Duplicate Check (+45 Risk)
  if (duplicateCheck.is_duplicate) {
    score += 45;
    reasons.push(`CRITICAL: Exact SHA-256 duplicate document detected matching claim ${duplicateCheck.matched_claim_number} (+45 Risk)`);
  }

  // 2. Doctor License Verification (+25 Risk)
  if (!doctorVerification.verified) {
    score += 25;
    reasons.push(`Doctor license ${doctorVerification.reg_number || 'UNKNOWN'} could not be verified in Medical Council DB (+25 Risk)`);
  }

  // 3. Price Validation Check (+20 Risk)
  if (priceValidation && priceValidation.status === 'FLAGGED') {
    score += 20;
    reasons.push(`Claimed amount (₹${priceValidation.billed_amount.toLocaleString('en-IN')}) exceeds reference range threshold by ${priceValidation.variance_percentage} (+20 Risk)`);
  }

  // 4. Metadata Tampering Check (+15 Risk)
  if (metadataCheck.is_edited) {
    score += 15;
    reasons.push(`PDF structural metadata indicates editing software was used (${metadataCheck.editing_software}) (+15 Risk)`);
  }

  // 5. Unrecognized Medicines (+15 Risk)
  if (medicineValidation.unknown && medicineValidation.unknown.length > 0) {
    score += 15;
    reasons.push(`Unrecognized item(s) present: "${medicineValidation.unknown.join(', ')}" (+15 Risk)`);
  }

  // 6. Provider Accreditation (+10 Risk)
  if (!providerVerification.verified) {
    score += 10;
    reasons.push(`Provider hospital (${providerVerification.provider_name}) is unlisted or pending registry accreditation (+10 Risk)`);
  }

  // Cap score between 0 and 99.9
  score = Math.min(99.9, Math.max(0, parseFloat(score.toFixed(1))));

  let riskLevel = 'LOW';
  if (score >= 65) {
    riskLevel = 'HIGH';
  } else if (score >= 35) {
    riskLevel = 'MEDIUM';
  }

  if (reasons.length === 0) {
    reasons.push('All document checks, doctor licenses, and pricing benchmarks passed standard verification.');
  }

  return {
    score,
    risk_level: riskLevel,
    reasons,
    feature_vector: {
      is_duplicate: duplicateCheck.is_duplicate ? 1 : 0,
      doctor_verified: doctorVerification.verified ? 1 : 0,
      price_flagged: priceValidation.status === 'FLAGGED' ? 1 : 0,
      metadata_edited: metadataCheck.is_edited ? 1 : 0,
      unknown_medicines: medicineValidation.unknown ? medicineValidation.unknown.length : 0,
      provider_verified: providerVerification.verified ? 1 : 0
    }
  };
}
