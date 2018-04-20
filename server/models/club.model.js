import Promise from 'bluebird';
import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

/**
 * Club Schema
 */
const ClubSchema = new mongoose.Schema({
  clubname: String,
  location: {
    lat: String,
    lng: String
  },
  wifi: {
    title: String,
    password: String
  },
  food: [
    {
      title: String,
      price: Number
    }
  ],
  smoking: {
    shisha: {
      type : Boolean,
      default: false
    },
    cigarette: {
      type : Boolean,
      default: false
    }
  },
  privateRooms: {
    type : Number,
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
    type : Array,
    default: []
  },
  conditioner: {
    type : Boolean,
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
ClubSchema.plugin(uniqueValidator)

/**
 * Methods
 */
ClubSchema.method({
});

/**
 * Statics
 */
ClubSchema.statics = {
  get(id) {
    return this.findById(id)
      .exec()
      .then((club) => {
        if (club) {
          return club;
        }
        const err = new APIError('No such club exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  }
};

export default mongoose.model('Club', ClubSchema);
