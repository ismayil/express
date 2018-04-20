import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../../config/param-validation';
import { register, login, forgotPassword, confirmUser } from '../../controllers/admin/auth.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/register')
  .post(validate(paramValidation.createUser), register);

router.route('/login')
  .post(validate(paramValidation.login), login);

router.route('/forgot_password')
  .post(validate(paramValidation.forgotPassword), forgotPassword);

router.route('/confirm_user')
  .post(validate(paramValidation.confirmUser), confirmUser);

export default router;
