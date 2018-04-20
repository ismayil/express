'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _passwordHash = require('password-hash');

var _passwordHash2 = _interopRequireDefault(_passwordHash);

var _httpStatus = require('http-status');

var _httpStatus2 = _interopRequireDefault(_httpStatus);

var _APIError = require('../helpers/APIError');

var _APIError2 = _interopRequireDefault(_APIError);

var _user = require('../models/user.model');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var load = function load(req, res, next, id) {
  _user2.default.get(id).then(function (user) {
    req.user = user; // eslint-disable-line no-param-reassign
    return next();
  }).catch(function (e) {
    return next(e);
  });
};

var get = function get(req, res) {
  return res.json(req.user);
};

/**
 * @api {PUT} /api/users/:userId update
 * @APIGroup Users
 * @apidescription Update user
 * @apiparam {String} firstname Firstname
 * @apiparam {String} lastname Lastname
 * @apiparam {String} phoneNumber User Phone number - Should be unique. Valid version: +999999999999 `regexp(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{6}$/)`
 * @apiparam {String} imgUrl Avatar url
 * @apiSuccess {String} Success message.
 * @apiError {String} message Erro message.
 */
var update = function update(req, res, next) {
  var user = req.user,
      body = req.body;

  // if passwords are not match

  if (body.password) {
    if (body.password != body.passwordConfirmation) {
      var inCorrectPassword = new _APIError2.default('Passwords do not match', _httpStatus2.default['Bad Request'], true);
      return next(inCorrectPassword);
    }

    user.password = _passwordHash2.default.generate(body.password);
  }

  var updateUserInfo = function updateUserInfo(key) {
    if (body[key]) user[key] = body[key];
  };

  updateUserInfo('firstname');
  updateUserInfo('lastname');
  updateUserInfo('phoneNumber');
  updateUserInfo('imgUrl');

  user.save().then(function () {
    return res.json({ message: "Successfully updated!" });
  }).catch(function (e) {
    return next(e);
  });
};

var list = function list(req, res, next) {
  var _req$query = req.query,
      _req$query$limit = _req$query.limit,
      limit = _req$query$limit === undefined ? 50 : _req$query$limit,
      _req$query$skip = _req$query.skip,
      skip = _req$query$skip === undefined ? 0 : _req$query$skip;

  _user2.default.list({ limit: limit, skip: skip }).then(function (users) {
    return res.json(users);
  }).catch(function (e) {
    return next(e);
  });
};

var remove = function remove(req, res, next) {
  var user = req.user;
  user.remove().then(function (deletedUser) {
    return res.json(deletedUser);
  }).catch(function (e) {
    return next(e);
  });
};

exports.default = { load: load, get: get, update: update, list: list, remove: remove };
module.exports = exports['default'];
//# sourceMappingURL=user.controller.js.map
