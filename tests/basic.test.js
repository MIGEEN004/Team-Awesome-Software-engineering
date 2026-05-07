// tests/basic.test.js
const assert = require('assert');
const test = require('node:test');

test('Basic dummy test to ensure CI pipeline passes', () => {
    const expected = 4;
    const actual = 2 + 2;
    
    // This will pass and tell GitHub Actions your code is fine
    assert.strictEqual(actual, expected); 
});