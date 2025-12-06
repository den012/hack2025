import express from 'express';
import { saveUser } from '../controllers/authController';

const router = express.Router();

router.post('/saveUser', saveUser);

export default router;