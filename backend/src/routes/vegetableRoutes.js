import express from 'express';
import { getVegetables, getCategories, getBranches, getSettings } from '../controllers/vegetableController.js';

const router = express.Router();

router.get('/vegetables', getVegetables);
router.get('/categories', getCategories);
router.get('/branches', getBranches);
router.get('/settings', getSettings);

export default router;
