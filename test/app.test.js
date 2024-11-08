/* eslint-disable arrow-body-style */
const request = require('supertest');

const app = require('../src/app');

test('Should return status 200 on root route', () => {
  return request(app).get('/')
    .then((res) => {
      expect(res.status).toBe(200);
    });
});
