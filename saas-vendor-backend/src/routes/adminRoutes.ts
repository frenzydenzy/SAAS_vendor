import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All admin routes require authentication and admin role
router.use(authMiddleware, adminMiddleware);

/**
 * @route GET /api/admin/dashboard
 * @desc Get admin dashboard stats
 * @access Private/Admin
 */
router.get('/dashboard', AdminController.getDashboard);

/**
 * @route GET /api/admin/kyc-requests
 * @desc Get KYC verification requests
 * @access Private/Admin
 */
router.get('/kyc-requests', AdminController.getKYCRequests);

/**
 * @route PATCH /api/admin/kyc-requests/:userId/approve
 * @desc Approve KYC for user
 * @access Private/Admin
 */
router.patch('/kyc-requests/:userId/approve', AdminController.approveKYC);

/**
 * @route PATCH /api/admin/kyc-requests/:userId/reject
 * @desc Reject KYC for user
 * @access Private/Admin
 */
router.patch('/kyc-requests/:userId/reject', AdminController.rejectKYC);

/**
 * @route GET /api/admin/claims
 * @desc Get all claims (admin view)
 * @access Private/Admin
 */
router.get('/claims', AdminController.getAllClaims);

/**
 * @route GET /api/admin/analytics
 * @desc Get analytics dashboard
 * @access Private/Admin
 */
router.get('/analytics', AdminController.getAnalytics);

/**
 * @route GET /api/admin/activity-log
 * @desc Get admin activity log
 * @access Private/Admin
 */
router.get('/activity-log', AdminController.getActivityLog);

/**
 * @route POST /api/admin/seed-deals
 * @desc Seed sample deals (development only)
 * @access Private/Admin
 */
router.post('/seed-deals', AdminController.seedDeals);

export default router;
