import _ from 'lodash/lodash';
import Club from '../models/club.model';

const load = (req, res, next, id) => {
  Club.get(id)
    .then((club) => {
      req.club = club; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

const get = (req, res) => {
  return res.json(req.club);
}

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
const create = (req, res, next) => {
  const {
    clubname, location, superAdmin
  } = req.body;
  const club = new Club({
    clubname, location,
    admin: {superAdmin}
  });

  club.save()
    .then(() => res.json({message: "Saved!"}))
    .catch(e => next(e));
}


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
const update = (req, res, next) => {
  const club = req.club;

  const updateClubInfos = (key) => {
    if (req.body[key])
      club[key] = req.body[key];
  }

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

  club.save()
    .then(() => res.json({message: "Thanks! We will contact with you!"}))
    .catch(e => next(e));
}

/**
 * @api {POST} /api/clubs/:clubId/tables/:tableId saveTimer
 * @APIGroup Clubs
 * @apidescription Club info save timer data
 * @apiparam {String} date Day of saved data
 * @apiparam {Object} data data <code>{from: String, to: String, price: Number, food: [{title: String, count: Number}]}</code>
 * @apiSuccess {String} Success message.
 * @apiError {String} Error message.
 */
const saveTimer = (req, res, next) => {
  const club = req.club;
  const {tableId} = req.params;
  const {date, data} = req.body;
  const {tables} = club;

  const tableIndex = _.findIndex(tables, t => t.id === parseFloat(tableId));

  if (tableIndex >= 0) {
      const tableData = tables[tableIndex].data || [];
      const dateIndex = _.findIndex(tableData, t => t.date == date);

      if (dateIndex >= 0) {
          tableData[dateIndex].data.push(data);
      }
      else {
          tableData.push({
            date, data
          });
      }
  }
  else {
      tables.push({
        id: tableId,
        data: [{
          date, data
        }]
      })
  }

  club.save()
    .then((savedData) => res.json(savedData))
    .catch(e => next(e));
}

const list = (req, res, next) => {
  const { limit = 50, skip = 0 } = req.query;
  Club.list({ limit, skip })
    .then(clubs => res.json(clubs))
    .catch(e => next(e));
}

const remove = (req, res, next) => {
  const club = req.club;
  club.isDeleted = true;
  club.save()
    .then(() => res.json({message: "We are sorry, we will contact with you!"}))
    .catch(e => next(e));
}

export default { load, get, create, update, list, remove, saveTimer };
