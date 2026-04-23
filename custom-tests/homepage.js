describe('Gaming Website Test', function() {
  it('should load the homepage', function(browser) {
    browser
      .navigateTo('http://localhost:3000')
      .waitForElementVisible('body', 5000)
      .assert.titleContains('Gaming Website') 
      .end();
  });
});
