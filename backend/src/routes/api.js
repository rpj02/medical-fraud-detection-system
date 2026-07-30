import express from 'express';
import multer from 'multer';
import { 
  getAllClaims, 
  getClaimById, 
  uploadClaim, 
  updateReviewerDecision, 
  triggerClaimAnalysis,
  getSavedBillsList,
  downloadSavedBill,
  resetDatabaseHandler
} from '../controllers/claimController.js';
import { generateReport, downloadReport } from '../controllers/reportController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'HEALTHY', 
    timestamp: new Date().toISOString(),
    service: 'Medical Reimbursement Fraud Detection API',
    engine_version: '1.0.0-JS'
  });
});

// Database Refresh Route
router.post('/reset-db', resetDatabaseHandler);

// Claim Routes
router.get('/claims', getAllClaims);
router.post('/claims/upload', upload.single('document'), uploadClaim);
router.get('/claims/:id', getClaimById);
router.post('/claims/:id/analyze', triggerClaimAnalysis);
router.post('/claims/:id/review', updateReviewerDecision);

// PDF Report Routes
router.post('/claims/:id/report', generateReport);
router.get('/claims/:id/report/download', downloadReport);

// Saved Bills Central Repository Routes
router.get('/bills', getSavedBillsList);
router.get('/bills/download/:filename', downloadSavedBill);

export default router;
