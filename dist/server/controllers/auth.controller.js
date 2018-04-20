'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _httpStatus = require('http-status');

var _httpStatus2 = _interopRequireDefault(_httpStatus);

var _APIError = require('../helpers/APIError');

var _APIError2 = _interopRequireDefault(_APIError);

var _nodemailer = require('nodemailer');

var _nodemailer2 = _interopRequireDefault(_nodemailer);

var _hashids = require('hashids');

var _hashids2 = _interopRequireDefault(_hashids);

var _passwordHash = require('password-hash');

var _passwordHash2 = _interopRequireDefault(_passwordHash);

var _libxmljs = require('libxmljs');

var _libxmljs2 = _interopRequireDefault(_libxmljs);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _config = require('../../config/config');

var _config2 = _interopRequireDefault(_config);

var _user = require('../models/user.model');

var _user2 = _interopRequireDefault(_user);

var _constants = require('../../config/constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hashids = new _hashids2.default();

var sendSms = function sendSms(phoneNumber) {
  var pureNum = hashids.encode(phoneNumber.slice(4));

  var smsTemplate = '<?xml version="1.0" encoding="UTF-8"?>\n    <request>\n    \t<head>\n    \t\t<operation>submit</operation>\n    \t\t<login>vurgus</login>\n    \t\t<password>azsms2018</password>\n    \t\t<title>Vurgus.com</title>\n    \t\t<isbulk>false</isbulk>\n    \t\t<scheduled>now</scheduled>\n    \t\t<controlid>' + Date.now() + '</controlid>\n    \t</head>\n    \t<body>\n    \t\t<msisdn>' + phoneNumber.slice(1) + '</msisdn>\n    \t\t<message>Your verification code: ' + pureNum + '</message>\n    \t</body>\n    </request>';

  (0, _request2.default)({
    url: 'https://sms.atatexnologiya.az/bulksms/api',
    method: "POST",
    headers: {
      "content-type": "application/xml"
    },
    body: smsTemplate
  }, function (error, response, body) {
    console.log('==================================');
    console.log('request error: ', response);
    console.log('request response: ', response);
    console.log('request body: ', body);
    console.log('==================================');
  });
};

/**
 * @api {POST} /auth/login Login
 * @APIGroup Auth
 * @apidescription User login action
 * @apiparam {String} phoneNumber Phone number
 * @apiparam {String} password User password
 * @apiSuccess {Object} userData User full info. <code>{token: String, firstname: String, lastname: String, imgUrl: String, phoneNumber: String, userStatus: Boolean}</code>
 * @apiError UserNotFound <code>login</code> or <code>Password</code> is incorrect.
 */
var login = function login(req, res, next) {
  var _req$body = req.body,
      phoneNumber = _req$body.phoneNumber,
      password = _req$body.password;


  _user2.default.findOne({ phoneNumber: phoneNumber }, function (err, user) {

    if (!_passwordHash2.default.verify(password, user.password)) {
      var unathorized = new _APIError2.default('Phone number or Password is incorrect', _httpStatus2.default.UNAUTHORIZED, true);
      return next(unathorized);
    }

    if (!user.active) {
      var inActive = new _APIError2.default('User is not active', _httpStatus2.default.UNAUTHORIZED, true);
      return next(inActive);
    }

    user.save(function (error) {
      if (error) {
        return next(error);
      } else {
        var firstname = user.firstname,
            lastname = user.lastname,
            imgUrl = user.imgUrl,
            active = user.active;


        var token = _jsonwebtoken2.default.sign({
          phoneNumber: phoneNumber
        }, _config2.default.jwtSecret);

        res.json({
          token: token,
          firstname: firstname, lastname: lastname, imgUrl: imgUrl,
          phoneNumber: user.phoneNumber,
          userStatus: active
        });
      }
    });
  });
};

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
var register = function register(req, res, next) {
  var _req$body2 = req.body,
      firstname = _req$body2.firstname,
      lastname = _req$body2.lastname,
      phoneNumber = _req$body2.phoneNumber,
      password = _req$body2.password,
      passwordConfirmation = _req$body2.passwordConfirmation;

  // if passwords are not match

  if (password != passwordConfirmation) {
    var inCorrectPassword = new _APIError2.default('Passwords do not match', _httpStatus2.default['Bad Request'], true);
    return next(inCorrectPassword);
  }

  password = _passwordHash2.default.generate(password);

  var user = new _user2.default({
    firstname: firstname,
    lastname: lastname,
    phoneNumber: phoneNumber,
    password: password,
    isManager: false
  });

  // send sms for verification
  sendSms(phoneNumber);

  user.save().then(function () {
    return res.json({
      message: "Thanks for registering! Please wait for verification code."
    });
  }).catch(function (e) {
    var err = new _APIError2.default(e, _httpStatus2.default['Bad Request'], true);
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
var confirmUser = function confirmUser(req, res, next) {
  var _req$body3 = req.body,
      phoneNumber = _req$body3.phoneNumber,
      verificationCode = _req$body3.verificationCode,
      password = _req$body3.password,
      passwordConfirmation = _req$body3.passwordConfirmation;

  // if passwords are not match (When it's reset password action)

  if (password && password != passwordConfirmation) {
    var inCorrectPassword = new _APIError2.default('Passwords do not match', _httpStatus2.default['Bad Request'], true);
    return next(inCorrectPassword);
  }

  if (phoneNumber.slice(4) != hashids.decode(verificationCode)) {
    var unVerified = new _APIError2.default('Verification code is incorrect', _httpStatus2.default['Bad Request'], true);
    return next(unVerified);
  }

  _user2.default.findOne({
    phoneNumber: phoneNumber
  }, function (err, user) {
    user.active = true;

    if (password) {
      user.password = _passwordHash2.default.generate(password);
    }

    user.save(function (err) {
      if (err) {
        next(err);
      } else {
        var firstname = user.firstname,
            lastname = user.lastname,
            _phoneNumber = user.phoneNumber,
            active = user.active;

        // Send sms for user activation

        var token = _jsonwebtoken2.default.sign({
          phoneNumber: _phoneNumber
        }, _config2.default.jwtSecret);

        res.json({
          token: token,
          firstname: firstname, lastname: lastname, phoneNumber: _phoneNumber,
          userStatus: active
        });
      }
    });
  });
};

/**
 * @api {POST} /auth/forgot_password Forgot password.
 * @APIGroup Auth
 * @apidescription User reset password action
 * @apiparam {String} phoneNumber Phone number.
 * @apiSuccess {Object} userData User full info. <code>{message: String}</code>
 * @apiError UserNotFound Error on verification, please resend email.
 */
var forgotPassword = function forgotPassword(req, res, next) {
  var phoneNumber = req.body.phoneNumber;

  // send sms for verification

  sendSms(phoneNumber);

  _user2.default.findOne({
    phoneNumber: phoneNumber
  }, function (err, user) {

    if (err) {
      return next(err);
    }

    res.json({
      message: "Please wait for verification code."
    });
  });
};

exports.default = { login: login, register: register, confirmUser: confirmUser, forgotPassword: forgotPassword };
module.exports = exports['default'];
//# sourceMappingURL=auth.controller.js.map
