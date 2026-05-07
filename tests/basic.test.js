// tests/basic.test.js
const assert = require('node:assert');
const test = require('node:test');
const request = require('supertest');

// Import your Express application (it won't hang now because of the fix in Step 1!)
const app = require('../index.js'); 

test('Community Login Page - GET /login', async () => {
    // 1. Arrange & Act: Request the login page
    const response = await request(app).get('/login');
    
    // 2. Assert: Check for a 200 OK success status
    assert.strictEqual(response.status, 200, 'Expected status code to be 200');
    
    // 3. Assert: Verify we are receiving an HTML page (your Pug view) back
    assert.match(String(response.headers['content-type']), /html/);
});

test('Community Registration Page - GET /register', async () => {
    const response = await request(app).get('/register');
    assert.strictEqual(response.status, 200, 'Expected status code to be 200');
    assert.match(String(response.headers['content-type']), /html/);
});

test('404 Error Handling - GET /invalid-community-link', async () => {
    // 1. Act: Request a route that doesn't exist in your index.js
    const response = await request(app).get('/invalid-community-link');
    
    // 2. Assert: Express should catch this and return a 404 Not Found
    assert.strictEqual(response.status, 404, 'Expected status code to be 404 for missing pages');
});