import { Router } from 'express';
import { getBunkers } from '../controllers/getBunkers';

const router = Router();

router.get('/getBunkers', getBunkers);

export default router;