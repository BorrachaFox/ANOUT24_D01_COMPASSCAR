const { Router } = require('express');
const {
  listCarController,
  createCarController,
  addCarItemsController,
  getCarController,
  updateCarController,
  deleteCarController,
} = require('../controllers/carController');

const router = Router();

router.get('/', listCarController);
router.post('/', createCarController);
router.get('/:id', getCarController);
router.put('/:id/items', addCarItemsController);
router.patch('/:id', updateCarController);
router.delete('/:id', deleteCarController);

module.exports = router;
