/* eslint-disable camelcase */
const { CarService } = require('../services/carService');

const listCarController = async (req, res, next) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  let limit = parseInt(req.query.limit, 10) || 5;

  if (limit <= 0) {
    limit = 5;
  } else if (limit > 10) {
    limit = 10;
  }

  const { year, final_plate, brand } = req.query;

  const offset = (page - 1) * limit;

  try {
    const { count, data } = await CarService.list(offset, limit, {
      year,
      final_plate,
      brand,
    });

    const pages = Math.ceil(count / limit);

    res.status(200).json({ count, pages, data });
  } catch (err) {
    next(err);
  }
};

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

const updateCarController = async (req, res, next) => {
  try {
    const result = await CarService.update(req.params.id, req.body);
    res.status(204).json(result);
  } catch (err) {
    next(err);
  }
};

const deleteCarController = async (req, res, next) => {
  try {
    await CarService.delete(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createCarController,
  addCarItemsController,
  getCarController,
  listCarController,
  updateCarController,
  deleteCarController,
};
