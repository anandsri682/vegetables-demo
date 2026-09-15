import express from 'express';
import { createOrder, getCustomerOrders, getOrderById } from '../controllers/orderController.js';
import { auth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/orders', auth, createOrder);
router.get('/orders', auth, getCustomerOrders);
router.get('/orders/:id', auth, getOrderById);

export default router;
