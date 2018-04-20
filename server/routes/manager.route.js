import express from 'express';
import authRoutes from './manager/auth.route';
import clubRoutes from './manager/club.route';
import userRoutes from './manager/user.route';

const router = express.Router(); // eslint-disable-line new-cap

// mount auth routes at /auth
router.use('/auth', authRoutes);

// mount user routes at /clubs
router.use('/clubs', clubRoutes);

// mount user routes at /users
router.use('/users', userRoutes);

export default router;
