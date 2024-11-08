const { pool } = require('../config/db');

const DuplicateEntryError = require('../errors/DuplicateEntryError');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');

const { isValidPlate } = require('../utils/carDataValidation/isValidPlate');
const {
  isValidYear,
  invalidYearMessage,
} = require('../utils/carDataValidation/isValidYear');

const createCarService = async (car) => {
  const errors = [];

  const {
    brand, model, plate, year,
  } = car;

  if (!brand) errors.push('brand is required');
  if (!model) errors.push('model is required');
  if (!year) errors.push('year is required');
  if (!plate) errors.push('plate is required');

  if (!isValidYear(year, 10)) errors.push(invalidYearMessage(10));
  if (!isValidPlate(plate)) {
    errors.push('plate must be in the correct format ABC-1C34');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors);
  }

  const [carExist] = await pool.query(`
    SELECT * FROM cars WHERE plate = ?; 
  `, [plate]);

  if (carExist.length > 0) throw new DuplicateEntryError('car already exist');

  await pool.query(`
    INSERT INTO cars (brand, model, plate, year)
    VALUES (?, ?, ?, ?)
  `, [brand, model, plate, year]);

  const [data] = await pool.query(`
    SELECT * FROM cars WHERE id = lAST_INSERT_ID();
  `);

  return data[0];
};

const addCarItemsService = async (carId, items) => {
  const errors = [];

  const [carExist] = await pool.query(
    `
    SELECT * FROM cars WHERE id = ?; 
  `,
    [carId],
  );

  if (carExist.length === 0) throw new NotFoundError('car not found');

  if (items.length === 0) errors.push('items is required');
  if (items.length > 5) errors.push('items must be a maximum of 5');

  const setItems = new Set(items);
  if (setItems.size !== items.length) errors.push('items cannot be repeated');

  if (errors.length > 0) {
    throw new ValidationError(errors);
  }

  await pool.query(
    `
    DELETE FROM cars_items WHERE car_id = ?
  `,
    [carId],
  );

  items.forEach(async (item) => {
    await pool.query(
      `
      INSERT INTO cars_items (name, car_id)
      VALUES (?, ?)
    `,
      [item, carId],
    );
  });
};

const CarService = {
  create: createCarService,
  addItem: addCarItemsService,
};

module.exports = { CarService };
