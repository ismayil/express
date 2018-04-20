'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _expressValidation = require('express-validation');

var _expressValidation2 = _interopRequireDefault(_expressValidation);

var _paramValidation = require('../../../config/param-validation');

var _paramValidation2 = _interopRequireDefault(_paramValidation);

var _auth = require('../../controllers/admin/auth.controller');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router(); // eslint-disable-line new-cap

router.route('/register').post((0, _expressValidation2.default)(_paramValidation2.default.createUser), _auth.register);

router.route('/login').post((0, _expressValidation2.default)(_paramValidation2.default.login), _auth.login);

router.route('/forgot_password').post((0, _expressValidation2.default)(_paramValidation2.default.forgotPassword), _auth.forgotPassword);

router.route('/confirm_user').post((0, _expressValidation2.default)(_paramValidation2.default.confirmUser), _auth.confirmUser);

exports.default = router;
module.exports = exports['default'];
//# sourceMappingURL=auth.route.js.map
