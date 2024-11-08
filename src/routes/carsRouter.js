const { Router } = require('express');
const {
  createCarController,
} = require('../controllers/carController');

const router = Router();

router.post('/', createCarController);

module.exports = router;
