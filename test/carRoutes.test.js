const request = require('supertest');
const { pool } = require('../src/config/db');
const { CarService } = require('../src/services/carService');
const { runMigrations } = require('../src/migration');

const app = require('../src/app');

const MAIN_ROUTE = '/api/v1/cars';

const testCarData = {
  id: 10000,
  brand: 'Marca',
  model: 'Modelo',
  plate: 'TST-1D23',
  year: 2018,
};

const testCarData2 = {
  id: 20000,
  brand: 'Marca',
  model: 'Modelo',
  plate: 'TST-0044',
  year: 2018,
};

beforeAll(async () => {
  await pool.query('DROP TABLE IF EXISTS cars_items;');
  await pool.query('DROP TABLE IF EXISTS cars;');

  await runMigrations();

  CarService.create(testCarData);
  CarService.create(testCarData2);
});

afterAll(async () => {
  await pool.end();
});

describe('When creating a car', () => {
  const validData = {
    brand: 'Marca01',
    model: 'Modelo01',
    plate: 'TST-0D00',
    year: 2018,
  };

  const testTemplate = (newData, errorMessage) => {
    return request(app)
      .post(MAIN_ROUTE)
      .send({ ...validData, ...newData })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.errors).toContain(errorMessage);
      });
  };

  test('should return status 201 and car data', () => {
    return request(app)
      .post(MAIN_ROUTE)
      .send(validData)
      .then((res) => {
        expect(res.status).toBe(201);
        expect(res.body.brand).toBe('Marca01');
        expect(res.body.model).toBe('Modelo01');
        expect(res.body.plate).toBe('TST-0D00');
        expect(res.body.year).toBe(2018);
        expect(res.body).toHaveProperty('created_at');
      });
  });

  test('should fail to create a car with duplicate plate number', () => {
    return request(app)
      .post(MAIN_ROUTE)
      .send(validData)
      .then((res) => {
        expect(res.status).toBe(409);
        expect(res.body.errors).toContain('car already exist');
      });
  });

  describe('Required fields validation', () => {
    // 400
    test('should fail to create a car without a brand', () => {
      return testTemplate({ brand: null }, 'brand is required');
    });

    test('should fail to create a car without a model', () => {
      return testTemplate({ model: null }, 'model is required');
    });

    test('should fail to create a car without a year', () => {
      return testTemplate({ year: null }, 'year is required');
    });

    test('should fail to create a car without a plate', () => {
      return testTemplate({ plate: null }, 'plate is required');
    });
  });

  describe('Invalid fields validation', () => {
    // 400
    test('should fail to create a car with an invalid plate format', () => {
      return testTemplate(
        { plate: 'AB$1234' },
        'plate must be in the correct format ABC-1C34',
      );
    });

    const maxCarAge = 10;
    const newCarYear = new Date().getFullYear() + 1;
    const minValidCarYear = newCarYear - maxCarAge;
    const invalidYear = minValidCarYear - 1;

    test('should fail to create a car with an invalid year', () => {
      return testTemplate(
        { year: invalidYear },
        `year must be between ${minValidCarYear} and ${newCarYear}`,
      );
    });
  });
});
