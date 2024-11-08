const { Router } = require('express');
const {
  listCarController,
  createCarController,
  addCarItemsController,
  getCarController,
} = require('../controllers/carController');

const router = Router();

router.get('/', listCarController);
router.post('/', createCarController);
router.get('/:id', getCarController);
router.put('/:id/items', addCarItemsController);

module.exports = router;
