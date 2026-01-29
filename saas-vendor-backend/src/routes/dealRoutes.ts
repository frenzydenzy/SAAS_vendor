import { Router } from 'express';
import { DealController } from '../controllers/dealController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';

const router = Router();

/**
 * @route GET /api/deals
 * @desc Get all deals (public)
 * @access Public
 */
router.get('/', DealController.listDeals);

/**
 * @route GET /api/deals/search
 * @desc Search deals
 * @access Public
 */
router.get('/search', DealController.searchDeals);

/**
 * @route GET /api/deals/category/:category
 * @desc Get deals by category
 * @access Public
 */
router.get('/category/:category', DealController.getDealsByCategory);

/**
 * @route GET /api/deals/:slug
 * @desc Get single deal by slug
 * @access Public
 */
router.get('/:slug', DealController.getDealBySlug);

/**
 * @route POST /api/deals
 * @desc Create new deal
 * @access Private/Admin
 */
router.post('/', authMiddleware, adminMiddleware, DealController.createDeal);

/**
 * @route PUT /api/deals/:dealId
 * @desc Update deal
 * @access Private/Admin
 */
router.put('/:dealId', authMiddleware, adminMiddleware, DealController.updateDeal);

/**
 * @route DELETE /api/deals/:dealId
 * @desc Delete deal
 * @access Private/Admin
 */
router.delete('/:dealId', authMiddleware, adminMiddleware, DealController.deleteDeal);

/**
 * @route GET /api/deals/:dealId/eligibility
 * @desc Check user eligibility for deal
 * @access Private
 */
router.get('/:dealId/eligibility', authMiddleware, DealController.checkEligibility);

export default router;
