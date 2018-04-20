import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import nodemailer from 'nodemailer';
import Hashids from 'hashids';
import hash from 'password-hash';
import libxmljs from 'libxmljs';
import https from 'https';
import request from 'request';
import config from '../../config/config';
import User from '../models/user.model';
import { CLIENT_URL, SERVER_EMAIL, SMS_API } from '../../config/constants';

const hashids = new Hashids();

const sendSms = (phoneNumber) => {
  const pureNum = hashids.encode(phoneNumber.slice(4));

  const smsTemplate =
    `<?xml version="1.0" encoding="UTF-8"?>
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
    		<message>Your verification code: ${pureNum}</message>
    	</body>
    </request>`;

  request({
      url: 'https://sms.atatexnologiya.az/bulksms/api',
      method: "POST",
      headers: {
          "content-type": "application/xml",
      },
      body: smsTemplate
  }, function (error, response, body){
      console.log('==================================');
      console.log('request error: ', response);
      console.log('request response: ', response);
      console.log('request body: ', body);
      console.log('==================================');
  })
}

/**
 * @api {POST} /auth/login Login
 * @APIGroup Auth
 * @apidescription User login action
 * @apiparam {String} phoneNumber Phone number
 * @apiparam {String} password User password
 * @apiSuccess {Object} userData User full info. <code>{token: String, firstname: String, lastname: String, imgUrl: String, phoneNumber: String, userStatus: Boolean}</code>
 * @apiError UserNotFound <code>login</code> or <code>Password</code> is incorrect.
 */
const login = (req, res, next) => {
  const { phoneNumber, password } = req.body;

  User.findOne({ phoneNumber }, (err, user) => {

    if (!hash.verify(password, user.password)){
      const unathorized = new APIError('Phone number or Password is incorrect', httpStatus.UNAUTHORIZED, true);
      return next(unathorized);
    }

    if (!user.active) {
      const inActive = new APIError('User is not active', httpStatus.UNAUTHORIZED, true);
      return next(inActive);
    }

    user.save((error) => {
      if(error) {
        return next(error);
      }
      else {
        const { firstname, lastname, imgUrl, active } = user;

        const token = jwt.sign({
          phoneNumber
        }, config.jwtSecret);

        res.json({
          token,
          firstname, lastname, imgUrl,
          phoneNumber: user.phoneNumber,
          userStatus: active
        })
      }
    });
  });
}


/**
 * @api {POST} /auth/register Registration
 * @APIGroup Auth
 * @apidescription User registration action
 * @apiparam {String} firstname Firstname
 * @apiparam {String} lastname Lastname
 * @apiparam {String} phoneNumber User Phone number - Should be unique. Valid version: +999999999999 `regexp(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{6}$/)`
 * @apiparam {String} password User password
 * @apiparam {String} passwordConfirmation User password confirmation
 * @apiSuccess {String} status <code>{message: "Welcome to the Vurgus!"}</code>
 * @apiError {String} message Erro message.
 */
const register = (req, res, next) => {
  let {
    firstname, lastname,
    phoneNumber,
    password,
    passwordConfirmation
  } = req.body;

  // if passwords are not match
  if (password != passwordConfirmation){
    const inCorrectPassword = new APIError('Passwords do not match', httpStatus['Bad Request'], true);
    return next(inCorrectPassword);
  }

  password = hash.generate(password);

  const user = new User({
    firstname,
    lastname,
    phoneNumber,
    password,
    isManager: false
  });

  // send sms for verification
  sendSms(phoneNumber);

  user.save()
    .then(() => res.json({
      message: "Thanks for registering! Please wait for verification code."
    })).catch((e) => {
      const err = new APIError(e, httpStatus['Bad Request'], true);
      return next(err);
    });
};
// let transporter = nodemailer.createTransport({
//   service: 'Gmail',
//   auth: {
//     user: SERVER_EMAIL, // Your email id
//     pass: '13nicataxmedov342142913' // Your password
//   }
// });
//
// let text = `
//   ${CLIENT_URL}/user_confirmation?token=${token}
// `;
//
// let mailOptions = {
//   from: SERVER_EMAIL, // sender address
//   to: email, // list of receivers
//   subject: 'Email Example', // Subject line
//   text: text //, // plaintext body
//   // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
// };
//
// console.log('transporter..');
//
// transporter.sendMail(mailOptions, function(error, info){
//   if(error){
//     return next(error);
//   }
//   else{
//     return res.json({
//       message: `
//         Thanks for registering!
//         Please check an email for verification code.
//       `
//     })
//   };
// });

/**
 * @api {POST} /auth/confirm_user Registration confirmation.
 * @APIGroup Auth
 * @apidescription User registration confirmation action
 * @apiparam {String} phoneNumber Phone number.
 * @apiparam {String} verificationCode Verification code
 * @apiSuccess {Object} userData User full info. <code>{token: String, firstname: String, lastname: String, phoneNumber: String, userStatus: Boolean}</code>
 * @apiError UserNotFound Error on verification, please resend email.
 */
const confirmUser = (req, res, next) => {

  const { phoneNumber, verificationCode, password, passwordConfirmation } = req.body;

  // if passwords are not match (When it's reset password action)
  if (password && password != passwordConfirmation){
    const inCorrectPassword = new APIError('Passwords do not match', httpStatus['Bad Request'], true);
    return next(inCorrectPassword);
  }

  if (phoneNumber.slice(4) != hashids.decode(verificationCode)) {
    const unVerified = new APIError('Verification code is incorrect', httpStatus['Bad Request'], true);
    return next(unVerified);
  }

  User.findOne({
    phoneNumber
  }, (err, user) => {
    user.active = true;

    if (password){
      user.password = hash.generate(password);
    }

    user.save((err) => {
      if(err) {
        next(err)
      }
      else {
        const { firstname, lastname, phoneNumber, active } = user;

        // Send sms for user activation
        const token = jwt.sign({
          phoneNumber
        }, config.jwtSecret);

        res.json({
          token,
          firstname, lastname, phoneNumber,
          userStatus: active
        })
      }
    });
  });
}

/**
 * @api {POST} /auth/forgot_password Forgot password.
 * @APIGroup Auth
 * @apidescription User reset password action
 * @apiparam {String} phoneNumber Phone number.
 * @apiSuccess {Object} userData User full info. <code>{message: String}</code>
 * @apiError UserNotFound Error on verification, please resend email.
 */
const forgotPassword = (req, res, next) => {
  const { phoneNumber } = req.body;

  // send sms for verification
  sendSms(phoneNumber);

  User.findOne({
    phoneNumber
  }, (err, user) => {

    if (err) {
      return next(err);
    }

    res.json({
      message: "Please wait for verification code."
    })
  });
}


export default { login, register, confirmUser, forgotPassword };
