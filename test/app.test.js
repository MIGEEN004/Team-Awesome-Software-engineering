const request = require('supertest');
const app = require('../app/app');

describe('GET /', () => {
  it('should return the home page with a 200 status code', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
  });
});