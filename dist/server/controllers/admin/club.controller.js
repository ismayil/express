'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _club = require('../../models/club.model');

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
 * @api {POST} /manager_api/clubs/:clubId Club confirmation
 * @APIGroup Clubs
 * @apidescription Club register confirmation
 * @apiparam {String} phoneNumber User Phone number - Should be unique. Valid version: +999999999999 `regexp(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{6}$/)`
 * @apiparam {String} password User password
 * @apiparam {String} passwordConfirmation User password confirmation
 * @apiSuccess {String} status <code>{message: "Welcome to the Vurgus!"}</code>
 * @apiError {String} message Erro message.
 */
// const create = (req, res, next) => {
//   const {
//     clubname, location, superManager
//   } = req.body;
//   const club = new Club({
//     clubname, location,
//     admin: {superAdmin}
//   });
//
//   club.save()
//     .then(savedClub => res.json(savedClub))
//     .catch(e => next(e));
// }

/**
 * @api {POST} /admin_api/clubs/:clubId Club confirmation
 * @APIGroup Clubs
 * @apidescription Club register confirmation
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
 * @apiSuccess {Object} Success message <code>{clubname, admin, wifi, smoking, games, conditioner, availableHours, food, devices, price, location, privateRooms}</code>.
 * @apiError {String} Error message.
 */
var confirmClub = function confirmClub(req, res, next) {
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

  club.save().then(function (savedClub) {
    var clubname = savedClub.clubname,
        admin = savedClub.admin,
        wifi = savedClub.wifi,
        smoking = savedClub.smoking,
        games = savedClub.games,
        conditioner = savedClub.conditioner,
        availableHours = savedClub.availableHours,
        food = savedClub.food,
        devices = savedClub.devices,
        price = savedClub.price,
        location = savedClub.location,
        privateRooms = savedClub.privateRooms;


    return res.json({
      clubname: clubname, admin: admin, wifi: wifi, smoking: smoking, games: games, conditioner: conditioner, availableHours: availableHours,
      food: food, devices: devices, price: price, location: location, privateRooms: privateRooms
    });
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
  club.remove().then(function (deletedClub) {
    return res.json(deletedClub);
  }).catch(function (e) {
    return next(e);
  });
};

exports.default = { load: load, get: get,
  // create,
  confirmClub: confirmClub,
  list: list, remove: remove
};
module.exports = exports['default'];
//# sourceMappingURL=club.controller.js.map
