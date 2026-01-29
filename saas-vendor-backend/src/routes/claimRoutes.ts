import { Router } from 'express';
import { ClaimController } from '../controllers/claimController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All claim routes require authentication
router.use(authMiddleware);

/**
 * @route POST /api/claims
 * @desc Create a new claim
 * @access Private
 */
router.post('/', ClaimController.createClaim);

/**
 * @route GET /api/claims/my-claims
 * @desc Get user's claims
 * @access Private
 */
router.get('/my-claims', ClaimController.getUserClaims);

/**
 * @route GET /api/claims/:claimId
 * @desc Get claim details
 * @access Private
 */
router.get('/:claimId', ClaimController.getClaimDetails);

/**
 * @route PATCH /api/claims/:claimId/approve
 * @desc Approve claim (Admin only)
 * @access Private/Admin
 */
router.patch('/:claimId/approve', adminMiddleware, ClaimController.approveClaim);

/**
 * @route PATCH /api/claims/:claimId/reject
 * @desc Reject claim (Admin only)
 * @access Private/Admin
 */
router.patch('/:claimId/reject', adminMiddleware, ClaimController.rejectClaim);

/**
 * @route GET /api/claims/:dealId/analytics
 * @desc Get claim analytics for a deal
 * @access Private/Admin
 */
router.get('/:dealId/analytics', adminMiddleware, ClaimController.getClaimAnalytics);

export default router;
