import express from 'express';
import authRoutes from './client/auth.route';
import userRoutes from './client/user.route';
import clubRoutes from './client/club.route';

const router = express.Router(); // eslint-disable-line new-cap

// mount user routes at /users
router.use('/users', userRoutes);

// mount user routes at /clubs
router.use('/clubs', clubRoutes);

// mount auth routes at /auth
router.use('/auth', authRoutes);

export default router;
