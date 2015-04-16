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

  describe("Superman (uiFlowManager tester)", function() {
      before(function() {
        browser.driver.manage().deleteAllCookies();
        browser.get("/test/e2e/index.html#/shopping-cart");
        //clear local storage
        browser.executeScript("localStorage.clear();");
        browser.refresh();
      });

      it("should show become superman button when not logged in", function() {
        assert.eventually.isTrue(element(by.css("button.sign-in")).isDisplayed(), "Sign in button should show");
        assert.eventually.isTrue(element(by.id("ps-become-superman")).isDisplayed(), "Should show Become Superman button");
        assert.eventually.isFalse(element(by.id("ps-superman-badge")).isDisplayed(), "Should show Become Superman button");
      });

      it("should become superman when signed in as a rise vision user", function() {
        //log in
        browser.executeScript("gapi.setPendingSignInUser('michael.sanchez@awesome.io')");
        element(by.id("ps-become-superman")).click();
        browser.sleep(500);
        assert.eventually.isFalse(element(by.id("ps-become-superman")).isDisplayed(), "Should show Become Superman button");
        //superman!
        assert.eventually.isTrue(element(by.id("ps-superman-badge")).isDisplayed(), "Should show Become Superman button");
      });

      it("should hide superman identity when user is logged out", function() {
        element(by.css(".desktop-menu-item img.profile-pic")).click();
        //shows sign-out menu item
        expect(element(by.css(".dropdown-menu .sign-out-button")).isDisplayed()).to.eventually.equal(true);
        //click sign out
        element(by.css(".dropdown-menu .sign-out-button")).click();
        
        browser.sleep(500);
        
        assert.eventually.isTrue(element(by.css(".sign-out-modal")).isDisplayed(), "sign-out dialog should show");
        element(by.css(".sign-out-modal .sign-out-rv-only-button")).click();

        assert.eventually.isTrue(element(by.css("button.sign-in")).isDisplayed(), "Sign in button should show");

        assert.eventually.isTrue(element(by.id("ps-become-superman")).isDisplayed(), "Should show Become Superman button");
        assert.eventually.isFalse(element(by.id("ps-superman-badge")).isDisplayed(), "Should show Become Superman button");

      });

  });
})();
