const { pool } = require('../config/db');

const DuplicateEntryError = require('../errors/DuplicateEntryError');
const ValidationError = require('../errors/ValidationError');

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

  return data;
};

const CarService = {
  create: createCarService,
};

module.exports = { CarService };
