import express from 'express';
import validate from 'express-validation';
import expressJwt from 'express-jwt';
import paramValidation from '../../../config/param-validation';
import config from '../../../config/config';
import {
  login,
  register,
  confirmUser,
  forgotPassword
} from '../../controllers/auth.controller';

const router = express.Router(); // eslint-disable-line new-cap

/** POST /api/auth/login - Returns token if correct username and password is provided */
router.route('/login')
  .post(validate(paramValidation.login), login);

router.route('/register')
  .post(validate(paramValidation.createUser), register);

router.route('/confirm_user')
  .post(validate(paramValidation.confirmUser), confirmUser);

router.route('/reset_password')
  .post(validate(paramValidation.forgotPassword), forgotPassword);


export default router;
