import { Router } from 'express';
import authRoutes from './authRoutes';
import projectRoutes from './projectRoutes';
import logRoutes from './logRoutes';
import imageRoutes from './imageRoutes';
import terminalRoutes from './terminalRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/logs', logRoutes);
router.use('/images', imageRoutes);
router.use('/terminal', terminalRoutes);

export default router;
