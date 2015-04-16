(function() {

  "use strict";

  /* https://github.com/angular/protractor/blob/master/docs/getting-started.md */

  var chai = require("chai");
  var chaiAsPromised = require("chai-as-promised");

  chai.use(chaiAsPromised);
  var expect = chai.expect;
  var assert = chai.assert;

  var fs = require("fs");

  browser.driver.manage().window().setSize(1124, 850);

  describe("System Messages", function() {
      before(function() {
        browser.driver.manage().deleteAllCookies();
        browser.get("/test/e2e/index.html#/system-messages");
        //clear local storage
        browser.executeScript("localStorage.clear();");
        browser.refresh();
        element(by.id("reset-db")).click();
      });

      it("should not show system message icon when not logged in", function() {
        assert.eventually.isTrue(element(by.css("button.sign-in")).isDisplayed(), "Sign in button should show");
        assert.eventually.isFalse(element(by.css(".dropdown .system-messages-button")).isDisplayed(), "Should not show system messages icon");
        assert.eventually.strictEqual(element(by.css(".dropdown .system-messages-badge")).getText(), "", "Should not show system message badge");
      });

      it("should show system messages when logged in", function() {
        //log in
        browser.executeScript("gapi.setPendingSignInUser('michael.sanchez@awesome.io')");
        element(by.css("button.sign-in")).click();
        
        browser.sleep(500);

        assert.eventually.isTrue(element(by.css(".dropdown .system-messages-button")).isDisplayed(), "Should show system messages icon");
        assert.eventually.strictEqual(element(by.css(".dropdown .system-messages-badge")).getText(), "14", "Badge should show correct number of system messages");
      });

      it("should hide system messages icon when there are no messages", function() {
        element(by.id("clear-system-messages-button")).click();
        browser.refresh();
        
        browser.sleep(500);

        assert.eventually.isFalse(element(by.css(".dropdown .system-messages-button")).isDisplayed(), "Should hide system messages icon");
      });
  });
})();
