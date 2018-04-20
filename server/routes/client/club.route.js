import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../../config/param-validation';
import clubCtrl from '../../controllers/club.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/clubs - Get list of clubs */
  .get(clubCtrl.list)

  /** POST /api/clubs - Create new club */
  .post(validate(paramValidation.createClub), clubCtrl.create);

router.route('/:clubId')
  /** GET /api/clubs/:clubId - Get club */
  .get(clubCtrl.get)

  /** PUT /api/clubs/:clubId - Update club */
  .put(validate(paramValidation.updateClub), clubCtrl.update)

  /** DELETE /api/clubs/:clubId - Delete club */
  .delete(clubCtrl.remove);


router.route('/:clubId/tables/:tableId')
  /** POST /api/clubs/:clubId/tables/:tableId - Save time data */
  .post(validate(paramValidation.saveTimer), clubCtrl.saveTimer);

/** Load club when API with clubId route parameter is hit */
router.param('clubId', clubCtrl.load);

export default router;
