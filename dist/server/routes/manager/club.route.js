'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _expressValidation = require('express-validation');

var _expressValidation2 = _interopRequireDefault(_expressValidation);

var _paramValidation = require('../../../config/param-validation');

var _paramValidation2 = _interopRequireDefault(_paramValidation);

var _club = require('../../controllers/admin/club.controller');

var _club2 = _interopRequireDefault(_club);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router(); // eslint-disable-line new-cap

router.route('/')
/** GET /api/clubs - Get list of clubs */
.get(_club2.default.list);

/** POST /api/clubs - Create new club */
// .post(validate(paramValidation.createClub), clubCtrl.create);

router.route('/:clubId')
/** GET /api/clubs/:clubId - Get club */
.get(_club2.default.get)

/** PUT /api/clubs/:clubId - Update club */
// .put(validate(paramValidation.updateClub), clubCtrl.update)

/** DELETE /api/clubs/:clubId - Delete club */
.delete(_club2.default.remove);

/** Load club when API with clubId route parameter is hit */
router.param('clubId', _club2.default.load);

exports.default = router;
module.exports = exports['default'];
//# sourceMappingURL=club.route.js.map
