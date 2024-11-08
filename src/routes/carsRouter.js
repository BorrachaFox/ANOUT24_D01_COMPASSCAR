const { Router } = require('express');
const {
  createCarController,
  addCarItemsController,
} = require('../controllers/carController');

const router = Router();

router.post('/', createCarController);
router.put('/:id/items', addCarItemsController);

module.exports = router;
