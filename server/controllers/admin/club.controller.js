import Club from '../../models/club.model';

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
const confirmClub = (req, res, next) => {
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
    .then((savedClub) => {
      const {
        clubname, admin, wifi, smoking, games, conditioner, availableHours,
        food, devices, price, location, privateRooms
      } = savedClub;

      return res.json({
        clubname, admin, wifi, smoking, games, conditioner, availableHours,
        food, devices, price, location, privateRooms
      });
    })
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
  club.remove()
    .then(deletedClub => res.json(deletedClub))
    .catch(e => next(e));
}

export default { load, get,
  // create,
  confirmClub,
  list, remove
};
