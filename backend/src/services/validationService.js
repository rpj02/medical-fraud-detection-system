// Reference Catalog of Verified Pharmacopeia Medicines
const KNOWN_MEDICINES = new Set([
  'paracetamol 500mg',
  'paracetamol 650mg',
  'amoxicillin 500mg',
  'cefixime 200mg',
  'cefradine 500mg',
  'pantoprazole 40mg',
  'ibuprofen 400mg',
  'atorvastatin 10mg',
  'xylocaine 2%',
  'multivitamin syrup',
  'salbutamol inhaler',
  'metformin 500mg',
  'azithromycin 500mg',
  'ciprofloxacin 500mg',
  'losartan 50mg'
]);

// Reference baseline cost ranges for common treatments & inpatient stays
const STANDARD_PRICE_RANGES = {
  general_consultation: { min: 300, max: 1500 },
  icu_stay_per_day: { min: 4000, max: 8000 },
  mri_brain_scan: { min: 3500, max: 7500 },
  ct_chest_scan: { min: 2500, max: 6000 },
  routine_inpatient: { min: 2000, max: 6500 }
};

export function validateMedicines(extractedMedicines = []) {
  const known = [];
  const unknown = [];

  for (const med of extractedMedicines) {
    const normalized = med.trim().toLowerCase();
    let isFound = false;

    for (const km of KNOWN_MEDICINES) {
      if (normalized.includes(km) || km.includes(normalized)) {
        isFound = true;
        break;
      }
    }

    if (isFound) {
      known.push(med);
    } else {
      unknown.push(med);
    }
  }

  return {
    status: unknown.length > 0 ? 'WARNING' : 'PASSED',
    known,
    unknown,
    total_checked: extractedMedicines.length,
    message: unknown.length > 0
      ? `${unknown.length} medicine(s) not found in National Medical Formulary index.`
      : 'All medicines verified against medical formulary catalog.'
  };
}

export function validatePrice(billedAmount, procedureCategory = 'routine_inpatient') {
  const range = STANDARD_PRICE_RANGES[procedureCategory] || STANDARD_PRICE_RANGES.routine_inpatient;
  let status = 'PASSED';
  let variancePercentage = '0%';

  if (billedAmount > range.max) {
    status = 'FLAGGED';
    const variance = ((billedAmount - range.max) / range.max) * 100;
    variancePercentage = `+${variance.toFixed(0)}%`;
  } else if (billedAmount < range.min) {
    status = 'PASSED'; // under billing is not a fraud risk
  }

  return {
    status,
    billed_amount: billedAmount,
    expected_range: range,
    variance_percentage: variancePercentage,
    detail: status === 'FLAGGED'
      ? `Claim amount (₹${billedAmount.toLocaleString('en-IN')}) exceeds standard cap (₹${range.max.toLocaleString('en-IN')}) by ${variancePercentage}.`
      : `Claim amount (₹${billedAmount.toLocaleString('en-IN')}) is within normal threshold (₹${range.min.toLocaleString('en-IN')} - ₹${range.max.toLocaleString('en-IN')}).`
  };
}
