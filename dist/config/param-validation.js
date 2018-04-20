'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  // POST /api/auth/register
  createUser: {
    body: {
      firstname: _joi2.default.string().required(),
      lastname: _joi2.default.string().required(),
      password: _joi2.default.string().required(),
      passwordConfirmation: _joi2.default.string().required(),
      phoneNumber: _joi2.default.string().regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{6}$/).required()
    }
  },

  // POST /api/auth/confirm_user
  confirmUser: {
    body: {
      phoneNumber: _joi2.default.string().required(),
      password: _joi2.default.string(),
      passwordConfirmation: _joi2.default.string(),
      verificationCode: _joi2.default.string().required()
    }
  },

  // POST /api/auth/login
  login: {
    body: {
      phoneNumber: _joi2.default.string().regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{6}$/).required(),
      password: _joi2.default.string().required()
    }
  },

  // POST /api/auth/reset_password (Redirect to confirmUser)
  forgotPassword: {
    body: {
      phoneNumber: _joi2.default.string().regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{6}$/).required()
    }
  },

  // PUT /api/users/:userId
  updateUser: {
    body: {
      firstname: _joi2.default.string(),
      lastname: _joi2.default.string(),
      phoneNumber: _joi2.default.string().regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{6}$/),
      password: _joi2.default.string(),
      passwordConfirmation: _joi2.default.string(),
      imgUrl: _joi2.default.string()
    },
    params: {
      userId: _joi2.default.string().hex().required()
    }
  },

  // POST /api/clubs
  createClub: {
    body: {
      clubname: _joi2.default.string().required(),
      location: _joi2.default.object().keys({
        lat: _joi2.default.string().required(),
        lng: _joi2.default.string().required()
      }).required(),
      superAdmin: _joi2.default.string().required()
    }
  },

  // POST admin_api/clubs/:clubId
  confirmClub: {
    body: {
      clubname: _joi2.default.string().required(),
      location: _joi2.default.object().keys({
        lat: _joi2.default.string().required(),
        lng: _joi2.default.string().required()
      }).required(),
      admin: _joi2.default.object().keys({
        superAdmin: _joi2.default.string().required(),
        moderators: _joi2.default.array().items(_joi2.default.string())
      }).required(),
      wifi: _joi2.default.object().keys({
        title: _joi2.default.string(),
        password: _joi2.default.string()
      }),
      food: _joi2.default.array().items(_joi2.default.object().keys({
        title: _joi2.default.string().required(),
        price: _joi2.default.number().required()
      })),
      smoking: _joi2.default.object().keys({
        shisha: _joi2.default.boolean().required(),
        cigarette: _joi2.default.boolean().required()
      }),
      privateRooms: _joi2.default.number().required(),
      tables: _joi2.default.array().items(_joi2.default.object().keys({
        device: _joi2.default.string().required(),
        count: _joi2.default.number().required()
      })).required(),
      price: _joi2.default.number().required(),
      availableHours: _joi2.default.string().required(),
      games: _joi2.default.array().items(_joi2.default.string()).required(),
      conditioner: _joi2.default.boolean().required()
    },
    params: {
      clubId: _joi2.default.string().hex().required()
    }
  },

  // POST api/clubs/:clubId
  updateClub: {
    body: {
      clubname: _joi2.default.string(),
      location: _joi2.default.object().keys({
        lat: _joi2.default.string(),
        lng: _joi2.default.string()
      }),
      admin: _joi2.default.object().keys({
        superAdmin: _joi2.default.string(),
        moderators: _joi2.default.array().items(_joi2.default.string())
      }),
      wifi: _joi2.default.object().keys({
        title: _joi2.default.string(),
        password: _joi2.default.string()
      }),
      food: _joi2.default.array().items(_joi2.default.object().keys({
        title: _joi2.default.string().required(),
        price: _joi2.default.number().required()
      })),
      smoking: _joi2.default.object().keys({
        shisha: _joi2.default.boolean(),
        cigarette: _joi2.default.boolean()
      }),
      privateRooms: _joi2.default.number(),
      tables: _joi2.default.array().items(_joi2.default.object().keys({
        device: _joi2.default.string(),
        count: _joi2.default.number()
      })),
      price: _joi2.default.number(),
      availableHours: _joi2.default.string(),
      games: _joi2.default.array().items(_joi2.default.string()),
      conditioner: _joi2.default.boolean()
    },
    params: {
      clubId: _joi2.default.string().hex()
    }
  },

  // POST api/clubs/:clubId/tables/:tableId
  saveTimer: {
    body: {
      date: _joi2.default.string().required(),
      data: _joi2.default.object().keys({
        from: _joi2.default.string().required(),
        to: _joi2.default.string().required(),
        price: _joi2.default.number().required(),
        food: _joi2.default.array().items(_joi2.default.object().keys({
          title: _joi2.default.string().required(),
          count: _joi2.default.number().required()
        }))
      })
    },
    params: {
      clubId: _joi2.default.string().hex(),
      tableId: _joi2.default.string().hex()
    }
  }
};
module.exports = exports['default'];
//# sourceMappingURL=param-validation.js.map
