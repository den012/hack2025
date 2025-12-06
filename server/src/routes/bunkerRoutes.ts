import { Router } from 'express';
import { getBunkers, trackBunkerView } from '../controllers/getBunkers';

const router = Router();

router.get('/getBunkers', getBunkers);
router.post('/trackBunkerView', trackBunkerView);
export default router;