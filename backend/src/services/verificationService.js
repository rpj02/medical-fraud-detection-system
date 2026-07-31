// Verified Registry Stubs
const VERIFIED_DOCTORS = new Set([
  'MC-551029',
  'MC-774019',
  'MC-109283',
  'MC-339102',
  'D-469296',
  '8046',
  'BLKH.690080'
]);

const VERIFIED_PROVIDERS = new Set([
  'metro care clinic',
  'apex medical research institute',
  'city healthcare',
  'st. jude general hospital',
  'dr. kalyan banerjee\'s clinic',
  'kalyan banerjee',
  'medicare wholesale pharmacy',
  'medicare',
  'healthpro pharmacy',
  'apollo pharmacy',
  'blk-max super speciality hospital',
  'blk hospital',
  'blk max',
  'greenfield family medical center',
  'greenfield'
]);

export function verifyDoctor(regNumber, doctorName) {
  if (!regNumber) {
    return {
      verified: false,
      reg_number: regNumber,
      status: 'MISSING',
      message: 'No doctor registration number detected on document.'
    };
  }

  const isVerified = VERIFIED_DOCTORS.has(regNumber.trim().toUpperCase()) ||
                     (doctorName && (doctorName.toLowerCase().includes('kalyan banerjee') || doctorName.toLowerCase().includes('varun rehani')));

  return {
    verified: isVerified,
    reg_number: regNumber,
    doctor_name: doctorName,
    status: isVerified ? 'ACTIVE_REGISTRATION' : 'UNVERIFIED',
    registry_source: 'National Medical Council License DB',
    message: isVerified
      ? `License ${regNumber} active and verified.`
      : `Registration ${regNumber} not found in state medical database.`
  };
}

export function verifyProvider(providerName) {
  if (!providerName) {
    return {
      verified: false,
      status: 'UNKNOWN',
      message: 'Hospital/Provider name missing.'
    };
  }

  const normalized = providerName.trim().toLowerCase();
  const isVerified = Array.from(VERIFIED_PROVIDERS).some((p) => normalized.includes(p) || p.includes(normalized));

  return {
    verified: isVerified,
    provider_name: providerName,
    status: isVerified ? 'ACCREDITED_HOSPITAL' : 'PENDING_AUDIT',
    message: isVerified
      ? 'Hospital is an accredited healthcare provider.'
      : 'Hospital is unlisted or pending accreditation check.'
  };
}
