import express from 'express';
import { getPackages, getPackageById } from '../controllers/packageController.js';

const router = express.Router();

router.get('/packages', getPackages);
router.get('/packages/:id', getPackageById);

export default router;
