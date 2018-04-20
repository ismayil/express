import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import hash from 'password-hash';
import request from 'request';
import randomize from 'randomatic';
import config from '../../../config/config';
import redis from '../../helpers/redis';
import APIError from '../../helpers/APIError';
import User from '../../models/user.model';

const sendSms = (phoneNumber) => {
  const verificationCode = randomize('0', 4);

  redis.set(`verification_code_${phoneNumber}`, verificationCode);
  redis.expire(`verification_code_${phoneNumber}`, 300);

  const smsTemplate = (`<?xml version="1.0" encoding="UTF-8"?>
  <request>
    <head>
      <operation>submit</operation>
      <login>vurgus</login>
      <password>azsms2018</password>
      <title>Vurgus.com</title>
      <isbulk>false</isbulk>
      <scheduled>now</scheduled>
      <controlid>${Date.now()}</controlid>
    </head>
    <body>
      <msisdn>${phoneNumber.slice(1)}</msisdn>
      <message>Your verification code: ${verificationCode}</message>
    </body>
  </request>`);

  request({
    url: 'https://sms.atatexnologiya.az/bulksms/api',
    method: 'POST',
    headers: {
      'content-type': 'application/xml',
    },
    body: smsTemplate
  }, (error, response) => {
    if (error) {
      return error;
    }

    return response;
  });
};

/**
 * @api {POST} /auth/register Registration
 * @APIGroup Auth
 * @apidescription User registration action
 * @apiparam {String} phoneNumber User Phone number - Should be unique. Valid version: +999999999999 `regexp(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{6}$/)`
 * @apiparam {String} password User password
 * @apiparam {String} passwordConfirmation User password confirmation
 * @apiSuccess {String} status <code>{message: "Welcome to the Vurgus!"}</code>
 * @apiError {String} message Error message.
 */
const register = (req, res, next) => {
  let { password } = req.body;
  const {
    firstname, lastname,
    phoneNumber,
    passwordConfirmation
  } = req.body;

  // if passwords are not match
  if (password !== passwordConfirmation) {
    const inCorrectPassword = new APIError('Passwords do not match', httpStatus['Bad Request'], true);
    return next(inCorrectPassword);
  }

  password = hash.generate(password);

  const user = new User({
    firstname,
    lastname,
    phoneNumber,
    password,
    active: false,
    isManager: true
  });

  return user.save()
    .then(() => {
      // send sms for verification
      sendSms(phoneNumber);

      return res.json({
        message: 'Welcome to the Vurgus!'
      });
    })
    .catch((e) => {
      const err = new APIError(e, httpStatus['Bad Request'], true);
      return next(err);
    });
};

/**
 * @api {POST} /auth/login Login
 * @APIGroup Auth
 * @apidescription Manager's login action
 * @apiparam {String} phoneNumber Phone number
 * @apiparam {String} password User password
 * @apiSuccess {Object} userData User full info. <code>{token: String, firstname: String, lastname: String, imgUrl: String, phoneNumber: String, userStatus: Boolean}</code>
 * @apiError UserNotFound Phone number or Password is incorrect.
 */
const login = (req, res, next) => {
  const { phoneNumber, password } = req.body;

  User.findOne({ phoneNumber }, (err, user) => {
    if (err || !user) {
      return next(err);
    }

    if (!user || !hash.verify(password, user.password)) {
      const unathorized = new APIError('Phone number or Password is incorrect', httpStatus.UNAUTHORIZED, true);
      return next(unathorized);
    }

    if (!user.active) {
      const inActive = new APIError('User is not active', httpStatus.UNAUTHORIZED, true);
      return next(inActive);
    }

    return user.save((error) => {
      if (error) {
        return next(error);
      }

      const { firstname, lastname, imgUrl, active, isManager } = user;

      const token = jwt.sign({
        phoneNumber
      }, config.jwtSecret);

      return res.json({
        token,
        firstname,
        lastname,
        imgUrl,
        isManager,
        phoneNumber: user.phoneNumber,
        userStatus: active
      });
    });
  });
};

/**
 * @api {POST} /auth/forgot_password Forgot password.
 * @APIGroup Auth
 * @apidescription Manager's reset password action
 * @apiparam {String} phoneNumber Phone number.
 * @apiSuccess {Object} userData User full info. <code>{message: String}</code>
 * @apiError UserNotFound Error on verification, please resend email.
 */
const forgotPassword = (req, res, next) => {
  const { phoneNumber } = req.body;

  console.log('phoneNumber: ', phoneNumber);

  User.findOne({
    phoneNumber
  }, (err, user) => {
    if (err || !user) {
      return next(err);
    }

    const temporaryToken = jwt.sign({
      phoneNumber
    }, config.jwtSecret);
    redis.set(`verification_token_of_${phoneNumber}`, temporaryToken);
    redis.expire(`verification_token_of_${phoneNumber}`, 300);

    sendSms(phoneNumber);

    return res.json({
      temporaryToken,
      message: 'Please wait for verification code.'
    });
  });
};

/**
 * @api {POST} /auth/confirm_user Registration confirmation.
 * @APIGroup Auth
 * @apidescription Manager confirmation actions
 * @apiparam {String} phoneNumber Phone number.
 * @apiparam {String} verificationCode Verification code
 * @apiSuccess {Object} userData User full info. <code>{token: String, firstname: String, lastname: String, phoneNumber: String, userStatus: Boolean}</code>
 * @apiError UserNotFound Error on verification, please resend email.
 */
const confirmUser = (req, res, next) => {
  const { phoneNumber, verificationCode, password, passwordConfirmation, temporaryToken } = req.body;

  // if passwords are not match (When it's reset password action)
  if (password && password !== passwordConfirmation) {
    const inCorrectPassword = new APIError('Passwords do not match', httpStatus['Bad Request'], true);
    return next(inCorrectPassword);
  }

  const redisUrl = `verification_code_${phoneNumber}`;

  return redis.get(redisUrl, (e, code) => {
    if (e) {
      return next(e);
    }

    const saveUser = () => {
      if (!code) {
        const unVerified = new APIError('Session expired! Please get new verification code.', httpStatus['Bad Request'], true);
        return next(unVerified);
      }
      if (code !== verificationCode) {
        const unVerified = new APIError('Verification code is incorrect', httpStatus['Bad Request'], true);
        return next(unVerified);
      }

      return User.findOne({
        phoneNumber
      }, (error, user) => {
        if (error || !user) {
          return next(error);
        }

        user.active = true;

        if (password) {
          user.password = hash.generate(password);
        }

        return user.save((err) => {
          if (err) {
            return next(err);
          }
          const { firstname, lastname, active } = user;

          // Send sms for user activation
          const newToken = jwt.sign({
            phoneNumber
          }, config.jwtSecret);

          return res.json({
            token: newToken,
            firstname,
            lastname,
            phoneNumber,
            userStatus: active
          });
        });
      });
    }

    if (temporaryToken) {
      const redisTokenUrl = `verification_token_of_${phoneNumber}`;
      return redis.get(redisTokenUrl, (er, verificationToken) => {
        if (er) {
          return next(er);
        }

        if (!verificationToken) {
          const unVerified = new APIError('Session expired! Please get new verification code.', httpStatus['Bad Request'], true);
          return next(unVerified);
        }

        if (verificationToken !== temporaryToken) {
          const unVerified = new APIError('Session Expired for token!', httpStatus['Bad Request'], true);
          return next(unVerified);
        }

        return saveUser();
      });
    }

    return saveUser();
  });
};

export default { register, login, forgotPassword, confirmUser };
