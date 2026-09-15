import express from 'express';
import {
  register, login, getProfile, updateProfile,
  getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress, deleteAccount
} from '../controllers/authController.js';
import { auth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

router.get('/user/addresses', auth, getAddresses);
router.post('/user/addresses', auth, addAddress);
router.put('/user/addresses/:id', auth, updateAddress);
router.delete('/user/addresses/:id', auth, deleteAddress);
router.put('/user/addresses/:id/default', auth, setDefaultAddress);

router.delete('/auth/delete-account', auth, deleteAccount);

export default router;
