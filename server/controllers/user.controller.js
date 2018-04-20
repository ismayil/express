import hash from 'password-hash';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import User from '../models/user.model';

const load = (req, res, next, id) => {
  User.get(id)
    .then((user) => {
      req.user = user; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

const get = (req, res) => {
  return res.json(req.user);
}

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
const update = (req, res, next) => {
  const {user, body} = req;

  // if passwords are not match
  if (body.password) {
    if (body.password != body.passwordConfirmation){
      const inCorrectPassword = new APIError('Passwords do not match', httpStatus['Bad Request'], true);
      return next(inCorrectPassword);
    }

    user.password = hash.generate(body.password);
  }

  const updateUserInfo = (key) => {
    if (body[key])
      user[key] = body[key];
  }

  updateUserInfo('firstname');
  updateUserInfo('lastname');
  updateUserInfo('phoneNumber');
  updateUserInfo('imgUrl');

  user.save()
    .then(() => res.json({message: "Successfully updated!"}))
    .catch(e => next(e));
}

const list = (req, res, next) => {
  const { limit = 50, skip = 0 } = req.query;
  User.list({ limit, skip })
    .then(users => res.json(users))
    .catch(e => next(e));
}

const remove = (req, res, next) => {
  const user = req.user;
  user.remove()
    .then(deletedUser => res.json(deletedUser))
    .catch(e => next(e));
}

export default { load, get, update, list, remove };
