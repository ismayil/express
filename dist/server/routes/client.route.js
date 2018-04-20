'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _auth = require('./client/auth.route');

var _auth2 = _interopRequireDefault(_auth);

var _user = require('./client/user.route');

var _user2 = _interopRequireDefault(_user);

var _club = require('./client/club.route');

var _club2 = _interopRequireDefault(_club);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router(); // eslint-disable-line new-cap

// mount user routes at /users
router.use('/users', _user2.default);

// mount user routes at /clubs
router.use('/clubs', _club2.default);

// mount auth routes at /auth
router.use('/auth', _auth2.default);

exports.default = router;
module.exports = exports['default'];
//# sourceMappingURL=client.route.js.map
