import express from 'express';
import {
  getStats, getAdminOrders, updateOrderStatus,
  createVegetable, updateVegetable, deleteVegetable,
  getAdminPackages, createPackage, updatePackage, deletePackage,
  getAdminBranches, createBranch, deleteBranch,
  getAdminSettings, saveAdminSettings, getAdminNotifications, getAdminCustomers
} from '../controllers/adminController.js';
import { auth, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(auth, adminOnly);

router.get('/stats', getStats);
router.get('/orders', getAdminOrders);
router.patch('/orders/:id', updateOrderStatus);

router.post('/vegetables', createVegetable);
router.put('/vegetables/:id', updateVegetable);
router.delete('/vegetables/:id', deleteVegetable);

router.get('/packages', getAdminPackages);
router.post('/packages', createPackage);
router.put('/packages/:id', updatePackage);
router.delete('/packages/:id', deletePackage);

router.get('/branches', getAdminBranches);
router.post('/branches', createBranch);
router.delete('/branches/:id', deleteBranch);

router.get('/settings', getAdminSettings);
router.post('/settings', saveAdminSettings);
router.get('/notifications', getAdminNotifications);
router.get('/customers', getAdminCustomers);

export default router;
