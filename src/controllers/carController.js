const { CarService } = require('../services/carService');

const createCarController = async (req, res, next) => {
  try {
    const result = await CarService.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const addCarItemsController = async (req, res, next) => {
  try {
    await CarService.addItem(req.params.id, req.body);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const getCarController = async (req, res, next) => {
  try {
    const result = await CarService.getById(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createCarController,
  addCarItemsController,
  getCarController,
};
