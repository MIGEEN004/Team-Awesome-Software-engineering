// tests/basic.test.js
const assert = require('node:assert');
const test = require('node:test');
const request = require('supertest');

// Import your Express application. 
// Because you cleverly exported it using module.exports = app;
// we can test it directly without running the full server!
const app = require('../app/app'); 

test('Community Categories Page - GET /categories', async () => {
    // 1. Arrange & Act: Use supertest to simulate a GET request to your route
    const response = await request(app).get('/categories');
    
    // 2. Assert: Check if the application returns a 200 OK success status
    assert.strictEqual(response.status, 200, 'Expected status code to be 200');
    
    // 3. Assert: Verify that the response is sending back HTML (your rendered PUG view)
    assert.match(String(response.headers['content-type']), /html/);
});