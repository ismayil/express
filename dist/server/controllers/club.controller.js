'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash/lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _club = require('../models/club.model');

var _club2 = _interopRequireDefault(_club);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var load = function load(req, res, next, id) {
  _club2.default.get(id).then(function (club) {
    req.club = club; // eslint-disable-line no-param-reassign
    return next();
  }).catch(function (e) {
    return next(e);
  });
};

var get = function get(req, res) {
  return res.json(req.club);
};

/**
 * @api {POST} /api/clubs create
 * @APIGroup Clubs
 * @apidescription Create club
 * @apiparam {String} clubname Clubname
 * @apiparam {Object} location Location <code>{lng: String, lat: String}</code>
 * @apiparam {String} superAdmin Superadmin id
 * @apiSuccess {String} Success message.
 * @apiError {String} Error message.
 */
var create = function create(req, res, next) {
  var _req$body = req.body,
      clubname = _req$body.clubname,
      location = _req$body.location,
      superAdmin = _req$body.superAdmin;

  var club = new _club2.default({
    clubname: clubname, location: location,
    admin: { superAdmin: superAdmin }
  });

  club.save().then(function () {
    return res.json({ message: "Saved!" });
  }).catch(function (e) {
    return next(e);
  });
};

/**
 * @api {POST} /api/clubs/:clubId update
 * @APIGroup Clubs
 * @apidescription Club info update
 * @apiparam {String} clubname Clubname
 * @apiparam {Object} location Location <code>{lng: String, lat: String}</code>
 * @apiparam {Object} admin Admins <code>{superAdmin: String, moderators: [...String]}</code>
 * @apiparam {Object} wifi Wifi <code>{title: String, password: String}</code>
 * @apiparam {Object} smoking <code>{shisha: Boolean, cigarette: Boolean}<code>
 * @apiparam {Array} games Available games in this club
 * @apiparam {Boolean} conditioner Has air conditioner or not
 * @apiparam {String} availableHours Available hours of club
 * @apiparam {Array} food Objects with the <code>{title: String, price: Number}</code>
 * @apiparam {Array} devices Objects with the <code>{title: String, data: [{ date: String, data: [{ from: String, to: String, price: Number, food: [{ title: String, count: Number}]}]}]}</code>
 * @apiparam {Number} price Hourly price
 * @apiSuccess {String} Success message.
 * @apiError {String} Error message.
 */
var update = function update(req, res, next) {
  var club = req.club;

  var updateClubInfos = function updateClubInfos(key) {
    if (req.body[key]) club[key] = req.body[key];
  };

  updateClubInfos('clubname');
  updateClubInfos('admin');
  updateClubInfos('wifi');
  updateClubInfos('smoking');
  updateClubInfos('games');
  updateClubInfos('conditioner');
  updateClubInfos('availableHours');
  updateClubInfos('food');
  updateClubInfos('devices');
  updateClubInfos('price');
  updateClubInfos('location');
  updateClubInfos('privateRooms');

  club.save().then(function () {
    return res.json({ message: "Thanks! We will contact with you!" });
  }).catch(function (e) {
    return next(e);
  });
};

/**
 * @api {POST} /api/clubs/:clubId/tables/:tableId saveTimer
 * @APIGroup Clubs
 * @apidescription Club info save timer data
 * @apiparam {String} date Day of saved data
 * @apiparam {Object} data data <code>{from: String, to: String, price: Number, food: [{title: String, count: Number}]}</code>
 * @apiSuccess {String} Success message.
 * @apiError {String} Error message.
 */
var saveTimer = function saveTimer(req, res, next) {
  var club = req.club;
  var tableId = req.params.tableId;
  var _req$body2 = req.body,
      date = _req$body2.date,
      data = _req$body2.data;
  var tables = club.tables;


  var tableIndex = _lodash2.default.findIndex(tables, function (t) {
    return t.id === parseFloat(tableId);
  });

  if (tableIndex >= 0) {
    var tableData = tables[tableIndex].data || [];
    var dateIndex = _lodash2.default.findIndex(tableData, function (t) {
      return t.date == date;
    });

    if (dateIndex >= 0) {
      tableData[dateIndex].data.push(data);
    } else {
      tableData.push({
        date: date, data: data
      });
    }
  } else {
    tables.push({
      id: tableId,
      data: [{
        date: date, data: data
      }]
    });
  }

  club.save().then(function (savedData) {
    return res.json(savedData);
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

  _club2.default.list({ limit: limit, skip: skip }).then(function (clubs) {
    return res.json(clubs);
  }).catch(function (e) {
    return next(e);
  });
};

var remove = function remove(req, res, next) {
  var club = req.club;
  club.isDeleted = true;
  club.save().then(function () {
    return res.json({ message: "We are sorry, we will contact with you!" });
  }).catch(function (e) {
    return next(e);
  });
};

exports.default = { load: load, get: get, create: create, update: update, list: list, remove: remove, saveTimer: saveTimer };
module.exports = exports['default'];
//# sourceMappingURL=club.controller.js.map
