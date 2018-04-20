'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _mongooseUniqueValidator = require('mongoose-unique-validator');

var _mongooseUniqueValidator2 = _interopRequireDefault(_mongooseUniqueValidator);

var _httpStatus = require('http-status');

var _httpStatus2 = _interopRequireDefault(_httpStatus);

var _APIError = require('../helpers/APIError');

var _APIError2 = _interopRequireDefault(_APIError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Club Schema
 */
var ClubSchema = new _mongoose2.default.Schema({
  clubname: String,
  location: {
    lat: String,
    lng: String
  },
  wifi: {
    title: String,
    password: String
  },
  food: [{
    title: String,
    price: Number
  }],
  smoking: {
    shisha: {
      type: Boolean,
      default: false
    },
    cigarette: {
      type: Boolean,
      default: false
    }
  },
  privateRooms: {
    type: Number,
    default: 0
  },
  tables: [{
    // table id
    id: Number,
    // device title (exp: PS3)
    device: String,
    data: [{
      // data by day
      date: String,
      // data by timer saved
      data: [{
        // when started timer
        from: String,
        // when finished timer
        to: String,
        // total price
        price: Number,
        // ordered services
        food: [{
          // food title
          title: String,
          // how much
          count: Number
        }]
      }]
    }]
  }],
  price: Number,
  availableHours: String,
  games: {
    type: Array,
    default: []
  },
  conditioner: {
    type: Boolean,
    default: false
  },
  admin: {
    superAdmin: {
      type: String
    },
    moderators: {
      type: Array,
      default: []
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
ClubSchema.plugin(_mongooseUniqueValidator2.default);

/**
 * Methods
 */
ClubSchema.method({});

/**
 * Statics
 */
ClubSchema.statics = {
  get: function get(id) {
    return this.findById(id).exec().then(function (club) {
      if (club) {
        return club;
      }
      var err = new _APIError2.default('No such club exists!', _httpStatus2.default.NOT_FOUND);
      return _bluebird2.default.reject(err);
    });
  },
  list: function list() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$skip = _ref.skip,
        skip = _ref$skip === undefined ? 0 : _ref$skip,
        _ref$limit = _ref.limit,
        limit = _ref$limit === undefined ? 50 : _ref$limit;

    return this.find().sort({ createdAt: -1 }).skip(+skip).limit(+limit).exec();
  }
};

exports.default = _mongoose2.default.model('Club', ClubSchema);
module.exports = exports['default'];
//# sourceMappingURL=club.model.js.map
