const { Router } = require('express');
const {
  listCarController,
  createCarController,
  addCarItemsController,
  getCarController,
  updateCarController,
} = require('../controllers/carController');

const router = Router();

router.get('/', listCarController);
router.post('/', createCarController);
router.get('/:id', getCarController);
router.put('/:id/items', addCarItemsController);
router.patch('/:id', updateCarController);

module.exports = router;
