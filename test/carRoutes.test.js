const request = require('supertest');
const { pool } = require('../src/config/db');
const { CarService } = require('../src/services/carService');
const { runMigrations } = require('../src/migration');

const app = require('../src/app');

const MAIN_ROUTE = '/api/v1/cars';

let testCarData;
let testCarData2;

beforeAll(async () => {
  await pool.query('DROP TABLE IF EXISTS cars_items;');
  await pool.query('DROP TABLE IF EXISTS cars;');

  await runMigrations();

  testCarData = await CarService.create({
    brand: 'Marca',
    model: 'Modelo',
    plate: 'TST-0044',
    year: 2018,
  });

  testCarData2 = await CarService.create({
    brand: 'Marca',
    model: 'Modelo',
    plate: 'TST-1D23',
    year: 2018,
  });
});

afterAll(async () => {
  await pool.end();
});

describe('1. When creating a car', () => {
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

describe('2. When putting a car item', () => {
  const validData = ['Ar condicionado', 'Trava Eletrica', 'Vidro Eletrico'];
  const invalidData = {
    empty: [],
    moreThanFive: ['1', '2', '3', '4', '5', '6'],
    repeatedItems: ['1', '1'],
  };

  const testTemplate = (data, errorMessage) => {
    return request(app)
      .put(`${MAIN_ROUTE}/${testCarData.id}/items`)
      .send(data)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.errors).toContain(errorMessage);
      });
  };

  test('should return status 204', () => {
    return request(app)
      .put(`${MAIN_ROUTE}/${testCarData.id}/items`)
      .send(validData)
      .then((res) => {
        expect(res.status).toBe(204);
      });
  });

  test('should return status 404 if car does not exist', () => {
    return request(app)
      .put(`${MAIN_ROUTE}/-1/items`)
      .send(validData)
      .then((res) => {
        expect(res.status).toBe(404);
        expect(res.body.errors).toContain('car not found');
      });
  });

  describe('Required fields validation', () => {
    // 400
    test('should fail to insert empty items', () => {
      return testTemplate(invalidData.empty, 'items is required');
    });

    test('should fail to insert more than 5 items', () => {
      return testTemplate(
        invalidData.moreThanFive,
        'items must be a maximum of 5',
      );
    });

    test('should fail to insert repeated items', () => {
      return testTemplate(
        invalidData.repeatedItems,
        'items cannot be repeated',
      );
    });
  });
});

describe('3. When getting car data by id', () => {
  let carWithItems;
  let carWithNoItems;
  const carItems = ['Ar condicionado', 'Trava Eletrica', 'Video Eletrico'];

  beforeAll(async () => {
    carWithItems = await CarService.create({
      brand: 'Marca0X',
      model: 'Teste0X',
      plate: 'TST-0X88',
      year: 2020,
    });

    await CarService.addItem(carWithItems.id, carItems);

    carWithNoItems = await CarService.create({
      brand: 'Marca0X',
      model: 'Teste0X',
      plate: 'TST-0A88',
      year: 2020,
    });
  });

  test('should return status 200 and car data + [] for items', () => {
    return request(app)
      .get(`${MAIN_ROUTE}/${carWithNoItems.id}`)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.brand).toBe('Marca0X');
        expect(res.body.model).toBe('Teste0X');
        expect(res.body.plate).toBe('TST-0A88');
        expect(res.body.year).toBe(2020);
        expect(res.body).toHaveProperty('created_at');
        expect(res.body.items).toEqual([]);
      });
  });

  test('should return status 200 and car data + car items', () => {
    return request(app)
      .get(`${MAIN_ROUTE}/${carWithItems.id}`)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.brand).toBe('Marca0X');
        expect(res.body.model).toBe('Teste0X');
        expect(res.body.plate).toBe('TST-0X88');
        expect(res.body.year).toBe(2020);
        expect(res.body).toHaveProperty('created_at');
        expect(res.body.items.sort()).toEqual(carItems.sort());
      });
  });

  test('should return status 404 if car does not exist', () => {
    return request(app)
      .get(`${MAIN_ROUTE}/-1`)
      .then((res) => {
        expect(res.status).toBe(404);
        expect(res.body.errors).toContain('car not found');
      });
  });
});
