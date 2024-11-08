const { Router } = require('express');
const {
  createCarController,
  addCarItemsController,
  getCarController,
} = require('../controllers/carController');

const router = Router();

router.post('/', createCarController);
router.get('/:id', getCarController);
router.put('/:id/items', addCarItemsController);

module.exports = router;
