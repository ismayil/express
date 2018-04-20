import Joi from 'joi';

export default {
  // POST /api/auth/register
  createUser: {
    body: {
      firstname: Joi.string().required(),
      lastname: Joi.string().required(),
      password: Joi.string().required(),
      passwordConfirmation: Joi.string().required(),
      phoneNumber: Joi.string().regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{6}$/).required()
    }
  },

  // POST /api/auth/confirm_user
  confirmUser: {
    body: {
      phoneNumber: Joi.string().required(),
      password: Joi.string(),
      passwordConfirmation: Joi.string(),
      verificationCode: Joi.string().required()
    }
  },

  // POST /api/auth/login
  login: {
    body: {
      phoneNumber: Joi.string().regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{6}$/).required(),
      password: Joi.string().required()
    }
  },

  // POST /api/auth/reset_password (Redirect to confirmUser)
  forgotPassword: {
    body: {
      phoneNumber: Joi.string().regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{6}$/).required()
    }
  },

  // PUT /api/users/:userId
  updateUser: {
    body: {
      firstname: Joi.string(),
      lastname: Joi.string(),
      phoneNumber: Joi.string().regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{6}$/),
      password: Joi.string(),
      passwordConfirmation: Joi.string(),
      imgUrl: Joi.string()
    },
    params: {
      userId: Joi.string().hex().required()
    }
  },

  // POST /api/clubs
  createClub: {
    body: {
      clubname: Joi.string().required(),
      location: Joi.object().keys({
        lat: Joi.string().required(),
        lng: Joi.string().required()
      }).required(),
      superAdmin: Joi.string().required()
    }
  },

  // POST admin_api/clubs/:clubId
  confirmClub: {
    body: {
      clubname: Joi.string().required(),
      location: Joi.object().keys({
        lat: Joi.string().required(),
        lng: Joi.string().required()
      }).required(),
      admin: Joi.object().keys({
        superAdmin: Joi.string().required(),
        moderators: Joi.array().items(Joi.string())
      }).required(),
      wifi: Joi.object().keys({
        title: Joi.string(),
        password: Joi.string()
      }),
      food: Joi.array().items(Joi.object().keys({
        title: Joi.string().required(),
        price: Joi.number().required()
      })),
      smoking: Joi.object().keys({
        shisha: Joi.boolean().required(),
        cigarette: Joi.boolean().required()
      }),
      privateRooms: Joi.number().required(),
      tables: Joi.array().items(Joi.object().keys({
        device: Joi.string().required(),
        count: Joi.number().required()
      })).required(),
      price: Joi.number().required(),
      availableHours: Joi.string().required(),
      games: Joi.array().items(Joi.string()).required(),
      conditioner: Joi.boolean().required()
    },
    params: {
      clubId: Joi.string().hex().required()
    }
  },

  // POST api/clubs/:clubId
  updateClub: {
    body: {
      clubname: Joi.string(),
      location: Joi.object().keys({
        lat: Joi.string(),
        lng: Joi.string()
      }),
      admin: Joi.object().keys({
        superAdmin: Joi.string(),
        moderators: Joi.array().items(Joi.string())
      }),
      wifi: Joi.object().keys({
        title: Joi.string(),
        password: Joi.string()
      }),
      food: Joi.array().items(Joi.object().keys({
        title: Joi.string().required(),
        price: Joi.number().required()
      })),
      smoking: Joi.object().keys({
        shisha: Joi.boolean(),
        cigarette: Joi.boolean()
      }),
      privateRooms: Joi.number(),
      tables: Joi.array().items(Joi.object().keys({
        device: Joi.string(),
        count: Joi.number()
      })),
      price: Joi.number(),
      availableHours: Joi.string(),
      games: Joi.array().items(Joi.string()),
      conditioner: Joi.boolean()
    },
    params: {
      clubId: Joi.string().hex()
    }
  },

  // POST api/clubs/:clubId/tables/:tableId
  saveTimer: {
    body: {
      date: Joi.string().required(),
      data: Joi.object().keys({
        from: Joi.string().required(),
        to: Joi.string().required(),
        price: Joi.number().required(),
        food: Joi.array().items(Joi.object().keys({
          title: Joi.string().required(),
          count: Joi.number().required()
        }))
      })
    },
    params: {
      clubId: Joi.string().hex(),
      tableId: Joi.string().hex()
    }
  }
};
