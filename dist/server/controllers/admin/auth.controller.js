'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _httpStatus = require('http-status');

var _httpStatus2 = _interopRequireDefault(_httpStatus);

var _passwordHash = require('password-hash');

var _passwordHash2 = _interopRequireDefault(_passwordHash);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _randomatic = require('randomatic');

var _randomatic2 = _interopRequireDefault(_randomatic);

var _config = require('../../../config/config');

var _config2 = _interopRequireDefault(_config);

var _redis = require('../../helpers/redis');

var _redis2 = _interopRequireDefault(_redis);

var _APIError = require('../../helpers/APIError');

var _APIError2 = _interopRequireDefault(_APIError);

var _user = require('../../models/user.model');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sendSms = function sendSms(phoneNumber) {
  var verificationCode = (0, _randomatic2.default)('0', 4);

  _redis2.default.set('verification_code_' + phoneNumber, verificationCode);
  _redis2.default.expire('verification_code_' + phoneNumber, 300);

  var smsTemplate = '<?xml version="1.0" encoding="UTF-8"?>\n  <request>\n    <head>\n      <operation>submit</operation>\n      <login>vurgus</login>\n      <password>azsms2018</password>\n      <title>Vurgus.com</title>\n      <isbulk>false</isbulk>\n      <scheduled>now</scheduled>\n      <controlid>' + Date.now() + '</controlid>\n    </head>\n    <body>\n      <msisdn>' + phoneNumber.slice(1) + '</msisdn>\n      <message>Your verification code: ' + verificationCode + '</message>\n    </body>\n  </request>';

  (0, _request2.default)({
    url: 'https://sms.atatexnologiya.az/bulksms/api',
    method: 'POST',
    headers: {
      'content-type': 'application/xml'
    },
    body: smsTemplate
  }, function (error, response) {
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
var register = function register(req, res, next) {
  var password = req.body.password;
  var _req$body = req.body,
      firstname = _req$body.firstname,
      lastname = _req$body.lastname,
      phoneNumber = _req$body.phoneNumber,
      passwordConfirmation = _req$body.passwordConfirmation;

  // if passwords are not match

  if (password !== passwordConfirmation) {
    var inCorrectPassword = new _APIError2.default('Passwords do not match', _httpStatus2.default['Bad Request'], true);
    return next(inCorrectPassword);
  }

  password = _passwordHash2.default.generate(password);

  var user = new _user2.default({
    firstname: firstname,
    lastname: lastname,
    phoneNumber: phoneNumber,
    password: password,
    active: false,
    isManager: true
  });

  return user.save().then(function () {
    // send sms for verification
    sendSms(phoneNumber);

    return res.json({
      message: 'Welcome to the Vurgus!'
    });
  }).catch(function (e) {
    var err = new _APIError2.default(e, _httpStatus2.default['Bad Request'], true);
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
var login = function login(req, res, next) {
  var _req$body2 = req.body,
      phoneNumber = _req$body2.phoneNumber,
      password = _req$body2.password;


  _user2.default.findOne({ phoneNumber: phoneNumber }, function (err, user) {
    if (err || !user) {
      return next(err);
    }

    if (!user || !_passwordHash2.default.verify(password, user.password)) {
      var unathorized = new _APIError2.default('Phone number or Password is incorrect', _httpStatus2.default.UNAUTHORIZED, true);
      return next(unathorized);
    }

    if (!user.active) {
      var inActive = new _APIError2.default('User is not active', _httpStatus2.default.UNAUTHORIZED, true);
      return next(inActive);
    }

    return user.save(function (error) {
      if (error) {
        return next(error);
      }

      var firstname = user.firstname,
          lastname = user.lastname,
          imgUrl = user.imgUrl,
          active = user.active,
          isManager = user.isManager;


      var token = _jsonwebtoken2.default.sign({
        phoneNumber: phoneNumber
      }, _config2.default.jwtSecret);

      return res.json({
        token: token,
        firstname: firstname,
        lastname: lastname,
        imgUrl: imgUrl,
        isManager: isManager,
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
var forgotPassword = function forgotPassword(req, res, next) {
  var phoneNumber = req.body.phoneNumber;


  console.log('phoneNumber: ', phoneNumber);

  _user2.default.findOne({
    phoneNumber: phoneNumber
  }, function (err, user) {
    if (err || !user) {
      return next(err);
    }

    var temporaryToken = _jsonwebtoken2.default.sign({
      phoneNumber: phoneNumber
    }, _config2.default.jwtSecret);
    _redis2.default.set('verification_token_of_' + phoneNumber, temporaryToken);
    _redis2.default.expire('verification_token_of_' + phoneNumber, 300);

    sendSms(phoneNumber);

    return res.json({
      temporaryToken: temporaryToken,
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
var confirmUser = function confirmUser(req, res, next) {
  var _req$body3 = req.body,
      phoneNumber = _req$body3.phoneNumber,
      verificationCode = _req$body3.verificationCode,
      password = _req$body3.password,
      passwordConfirmation = _req$body3.passwordConfirmation,
      temporaryToken = _req$body3.temporaryToken;

  // if passwords are not match (When it's reset password action)

  if (password && password !== passwordConfirmation) {
    var inCorrectPassword = new _APIError2.default('Passwords do not match', _httpStatus2.default['Bad Request'], true);
    return next(inCorrectPassword);
  }

  var redisUrl = 'verification_code_' + phoneNumber;

  return _redis2.default.get(redisUrl, function (e, code) {
    if (e) {
      return next(e);
    }

    var saveUser = function saveUser() {
      if (!code) {
        var unVerified = new _APIError2.default('Session expired! Please get new verification code.', _httpStatus2.default['Bad Request'], true);
        return next(unVerified);
      }
      if (code !== verificationCode) {
        var _unVerified = new _APIError2.default('Verification code is incorrect', _httpStatus2.default['Bad Request'], true);
        return next(_unVerified);
      }

      return _user2.default.findOne({
        phoneNumber: phoneNumber
      }, function (error, user) {
        if (error || !user) {
          return next(error);
        }

        user.active = true;

        if (password) {
          user.password = _passwordHash2.default.generate(password);
        }

        return user.save(function (err) {
          if (err) {
            return next(err);
          }
          var firstname = user.firstname,
              lastname = user.lastname,
              active = user.active;

          // Send sms for user activation

          var newToken = _jsonwebtoken2.default.sign({
            phoneNumber: phoneNumber
          }, _config2.default.jwtSecret);

          return res.json({
            token: newToken,
            firstname: firstname,
            lastname: lastname,
            phoneNumber: phoneNumber,
            userStatus: active
          });
        });
      });
    };

    if (temporaryToken) {
      var redisTokenUrl = 'verification_token_of_' + phoneNumber;
      return _redis2.default.get(redisTokenUrl, function (er, verificationToken) {
        if (er) {
          return next(er);
        }

        if (!verificationToken) {
          var unVerified = new _APIError2.default('Session expired! Please get new verification code.', _httpStatus2.default['Bad Request'], true);
          return next(unVerified);
        }

        if (verificationToken !== temporaryToken) {
          var _unVerified2 = new _APIError2.default('Session Expired for token!', _httpStatus2.default['Bad Request'], true);
          return next(_unVerified2);
        }

        return saveUser();
      });
    }

    return saveUser();
  });
};

exports.default = { register: register, login: login, forgotPassword: forgotPassword, confirmUser: confirmUser };
module.exports = exports['default'];
//# sourceMappingURL=auth.controller.js.map
