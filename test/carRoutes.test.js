const request = require('supertest');
const { pool } = require('../src/config/db');
const { CarService } = require('../src/services/carService');
const { runMigrations } = require('../src/migration');

const app = require('../src/app');

const MAIN_ROUTE = '/api/v1/cars';

let testCarData;

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
    test('should return status 404 and fail to create a car without a brand', () => {
      return testTemplate({ brand: null }, 'brand is required');
    });

    test('should return status 404 and fail to create a car without a model', () => {
      return testTemplate({ model: null }, 'model is required');
    });

    test('should return status 404 and fail to create a car without a year', () => {
      return testTemplate({ year: null }, 'year is required');
    });

    test('should return status 404 and fail to create a car without a plate', () => {
      return testTemplate({ plate: null }, 'plate is required');
    });
  });

  describe('Invalid fields validation', () => {
    test('should return status 404 and fail to create a car with an invalid plate format', () => {
      return testTemplate(
        { plate: 'AB$1234' },
        'plate must be in the correct format ABC-1C34',
      );
    });

    const maxCarAge = 10;
    const newCarYear = new Date().getFullYear() + 1;
    const minValidCarYear = newCarYear - maxCarAge;
    const invalidYear = minValidCarYear - 1;

    test('should return status 404 and fail to create a car with an invalid year', () => {
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
    test('should return status 400 and fail to insert empty items', () => {
      return testTemplate(invalidData.empty, 'items is required');
    });

    test('should return status 400 and fail to insert more than 5 items', () => {
      return testTemplate(
        invalidData.moreThanFive,
        'items must be a maximum of 5',
      );
    });

    test('should return status 400 and fail to insert repeated items', () => {
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

  test('should return status 200 and car data + [] for empty items', () => {
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

describe('4. When listing cars', () => {
  const newCars = [];
  const carCount = 12;
  const defaultLimit = 5; // Default should be 5
  const maxLimit = 10; // Default should be 10

  const pagesForLimit = (limitValue) => {
    return Math.ceil(carCount / limitValue);
  };

  beforeAll(async () => {
    await pool.query('DROP TABLE IF EXISTS cars_items;');
    await pool.query('DROP TABLE IF EXISTS cars;');

    await runMigrations();

    for (let i = 0; i < carCount; i += 1) {
      const plate = `LIS-${i.toString().padStart(4, '0')}`;
      // eslint-disable-next-line no-await-in-loop
      const result = await CarService.create({
        brand: 'Marca-LIS',
        model: `model-${i}`,
        plate,
        year: 2021,
      });
      newCars.push(result);
    }
  });

  test('should return status 200 and a list of cars with correct data', () => {
    return request(app)
      .get(`${MAIN_ROUTE}`)
      .then((res) => {
        expect(res.status).toBe(200);
      });
  });

  test('should return with the correct count and page values', () => {
    return request(app)
      .get(`${MAIN_ROUTE}`)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.count).toBe(carCount);
        expect(res.body.pages).toBe(pagesForLimit(defaultLimit));
      });
  });

  describe('Handling query parameters (page, limit)', () => {
    test('should return default limit of 5 items when limit is not specified', async () => {
      const res = await request(app).get(MAIN_ROUTE);
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(carCount);
      expect(res.body.pages).toBe(pagesForLimit(defaultLimit));
      expect(res.body.data.length).toBeLessThanOrEqual(defaultLimit);
    });

    test('should return specified limit of items within allowed range', async () => {
      const res = await request(app).get(`${MAIN_ROUTE}?limit=3`);
      expect(res.status).toBe(200);
      expect(res.body.pages).toBe(pagesForLimit(3));
      expect(res.body.data.length).toBe(3);
    });

    test('should return maximum limit of 10 items when limit is above the allowed maximum', async () => {
      const res = await request(app).get(`${MAIN_ROUTE}?limit=15`);
      expect(res.status).toBe(200);
      expect(res.body.pages).toBe(pagesForLimit(maxLimit));
      expect(res.body.data.length).toBeLessThanOrEqual(maxLimit); // Should respect max limit of 10
    });

    test('should default to 5 items if limit is a negative number', async () => {
      const res = await request(app).get(`${MAIN_ROUTE}?limit=-5`);
      expect(res.status).toBe(200);
      expect(res.body.pages).toBe(pagesForLimit(defaultLimit));
      expect(res.body.data.length).toBe(defaultLimit); // Should default to 5
    });

    test('should return the correct page and default limit of 5 items when page is specified', async () => {
      const res = await request(app).get(`${MAIN_ROUTE}?page=2`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(5); // Default limit of 5
      expect(res.body.pages).toBe(pagesForLimit(defaultLimit));
    });
  });

  describe('Handling query parameters (year, final_plate, brand)', () => {
    const carParams = {
      brand: 'Marca-PARAMS',
      model: 'model-PARAMS',
      plate: 'PRM-0000',
      year: 2024,
    };

    const carTestParamList = {
      year: carParams.year,
      final_plate: carParams.plate.slice(-1),
      brand: 'Marca-PARAMS',
    };

    beforeAll(async () => {
      await CarService.create(carParams);
    });

    const testParams = (params, data) => {
      const queryParams = params.map((p) => `${p}=${data[p]}`).join('&');
      return request(app)
        .get(`${MAIN_ROUTE}/?${queryParams}`)
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body.count).toBeGreaterThan(0);
          expect(res.body.pages).toBe(1);
          res.body.data.forEach((car) => {
            params.forEach((param) => {
              if (typeof car[param] === 'number') {
                expect(car[param]).toBeGreaterThanOrEqual(data[param]);
              } else if (typeof car[param] === 'string') {
                expect(car[param]).toContain(data[param]);
              }
            });
          });
        });
    };

    test('should return 200 and filter cars by year', () => {
      return testParams(['year'], carTestParamList);
    });

    test('should return 200 and filter cars by final_plate', () => {
      return testParams(['final_plate'], carTestParamList);
    });

    test('should return 200 and filter cars by brand', () => {
      return testParams(['brand'], carTestParamList);
    });
  });

  describe('When the car list is empty', () => {
    beforeAll(async () => {
      await pool.query('DROP TABLE IF EXISTS cars_items;');
      await pool.query('DROP TABLE IF EXISTS cars;');

      await runMigrations();
    });

    test('should return empty data + count and pages as 0', () => {
      return request(app)
        .get(`${MAIN_ROUTE}/?page=${pagesForLimit(defaultLimit) + 1}`)
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body.count).toBe(0);
          expect(res.body.pages).toBe(0);
          expect(res.body.data).toEqual([]);
        });
    });
  });
});

describe('5. When updating car data', () => {
  const validData = {
    brand: 'Marca01',
    model: 'Modelo01',
    plate: 'VAL-0D00',
    year: 2018,
  };

  let carForTest;
  let carForPlateCollision;

  beforeAll(async () => {
    carForTest = await CarService.create({
      brand: 'Marca0X',
      model: 'Teste0X',
      plate: 'TST-0A88',
      year: 2020,
    });

    carForPlateCollision = await CarService.create({
      brand: 'Marca0X',
      model: 'Teste0X',
      plate: 'COL-0A88',
      year: 2020,
    });
  });

  test('should return status 204', () => {
    return request(app)
      .patch(`${MAIN_ROUTE}/${carForTest.id}`)
      .send({ ...validData })
      .then((res) => {
        expect(res.status).toBe(204);
      });
  });

  test('should return status 409 fail if plate is already in use', () => {
    return request(app)
      .patch(`${MAIN_ROUTE}/${carForTest.id}`)
      .send({ plate: carForPlateCollision.plate })
      .then((res) => {
        expect(res.status).toBe(409);
        expect(res.body.errors).toContain('car already registered');
      });
  });

  test('should return status 404 when attempting to update a non-existent car', () => {
    return request(app)
      .patch(`${MAIN_ROUTE}/-1`)
      .send({ plate: carForPlateCollision.plate })
      .then((res) => {
        expect(res.status).toBe(404);
        expect(res.body.errors).toContain('car not found');
      });
  });

  describe('Invalid fields validation', () => {
    test('should return status 400 and fail when brand is provided without a model', () => {
      return request(app)
        .patch(`${MAIN_ROUTE}/${carForTest.id}`)
        .send({ brand: 'sasad' })
        .then((res) => {
          expect(res.status).toBe(400);
          expect(res.body.errors).toContain('model must also be informed');
        });
    });

    test('should return status 400 and fail when year is out of range (2015 and 2025)', () => {
      return request(app)
        .patch(`${MAIN_ROUTE}/${carForTest.id}`)
        .send({ year: 0 })
        .then((res) => {
          expect(res.status).toBe(400);
          expect(res.body.errors).toContain('year must be between 2015 and 2025');
        });
    });

    test('should return status 400 and fail when plate is in an incorrect format', () => {
      return request(app)
        .patch(`${MAIN_ROUTE}/${carForTest.id}`)
        .send({ plate: 'asdsa' })
        .then((res) => {
          expect(res.status).toBe(400);
          expect(res.body.errors).toContain('plate must be in the correct format ABC-1C34');
        });
    });
  });
});
