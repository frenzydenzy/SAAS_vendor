import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

/**
 * @route GET /api/users/profile
 * @desc Get user profile
 * @access Private
 */
router.get('/profile', UserController.getProfile);

/**
 * @route PUT /api/users/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile', UserController.updateProfile);

/**
 * @route GET /api/users/verification-status
 * @desc Get user verification status
 * @access Private
 */
router.get('/verification-status', UserController.getVerificationStatus);

/**
 * @route POST /api/users/upload-kyc
 * @desc Upload KYC documents
 * @access Private
 */
router.post('/upload-kyc', UserController.uploadKYC);

/**
 * @route PUT /api/users/preferences
 * @desc Update user preferences
 * @access Private
 */
router.put('/preferences', UserController.updatePreferences);

/**
 * @route DELETE /api/users/account
 * @desc Delete user account
 * @access Private
 */
router.delete('/account', UserController.deleteAccount);

export default router;
