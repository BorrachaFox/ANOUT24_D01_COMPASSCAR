const { CarService } = require('../services/carService');

const createCarController = async (req, res, next) => {
  try {
    const result = await CarService.create(req.body);
    res.status(201).json(result[0]);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createCarController,
};
