// tests/basic.test.js
const assert = require('node:assert');
const test = require('node:test');
const request = require('supertest');

// Import your Express application
const app = require('../app/app'); 

// --- TEST 1: The Categories Page ---
test('Community Categories Page - GET /categories', async () => {
    const response = await request(app).get('/categories');
    assert.strictEqual(response.status, 200, 'Expected status code to be 200');
    assert.match(String(response.headers['content-type']), /html/);
});

// --- TEST 2: 404 Error Handling (NEW) ---
test('404 Error Handling - GET /this-page-does-not-exist', async () => {
    // 1. Arrange & Act: Request a random route that you haven't defined in app.js
    const response = await request(app).get('/this-page-does-not-exist');
    
    // 2. Assert: Express should automatically catch this and return a 404 Not Found status
    assert.strictEqual(response.status, 404, 'Expected status code to be 404 for missing pages');
});