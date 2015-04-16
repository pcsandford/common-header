(function() {

  "use strict";

  /* https://github.com/angular/protractor/blob/master/docs/getting-started.md */

  var chai = require("chai");
  var chaiAsPromised = require("chai-as-promised");

  chai.use(chaiAsPromised);
  var expect = chai.expect;
  var assert = chai.assert;

  var fs = require("fs");

  browser.driver.manage().window().setSize(1280, 768);

  describe("Registration", function() {
      before(function() {
        browser.driver.manage().deleteAllCookies();
        browser.get("/test/e2e/#/shopping-cart");

        //clear local storage
        browser.executeScript("localStorage.clear();");
        browser.refresh();
      });

      it("should show T&C Dialog on new Google Account", function() {

        element(by.id("reset-db")).click();

        expect(element(by.css("button.sign-in")).isDisplayed()).to.eventually.equal(true);
        //click on sign in button
        browser.executeScript("gapi.setPendingSignInUser('john.doe@awesome.io')");
        element(by.css("button.sign-in")).click();
        
        browser.sleep(500);
        
        //dialog shows
        assert.eventually.isTrue(element(by.css(".registration-modal")).isPresent(), "registration dialog should show");

        //fill in email address
      });

      it("should not bug me again when I click 'cancel', even after a refresh (limbo state)", function() {
        element(by.css(".registration-cancel-button")).click();
        browser.refresh();
        assert.eventually.isFalse(element(by.css("button.sign-in")).isDisplayed(), "sign in button should not show");
        assert.eventually.isFalse(element(by.css(".registration-modal")).isPresent(), "registration dialog should hide");
      });

      it("allow me to register when I've changed my mind", function() {
        assert.eventually.isTrue(element(by.css(".register-user-menu-button")).isDisplayed(), "Create Account button should show");
        element(by.css(".register-user-menu-button")).click();
        browser.sleep(500);
        assert.eventually.isTrue(element(by.css(".registration-modal")).isPresent(), "registration dialog should show");
      });

      it("should show validation errors if i have not agreed to terms and entered an email", function () {
        element(by.css(".registration-save-button")).click();
        assert.eventually.isTrue(element(by.css(".validation-error-message-accepted")).isPresent(), "t&c validation error should show");
        assert.eventually.isTrue(element(by.css(".validation-error-message-first-name")).isPresent(), "first name validation error should show");
        assert.eventually.isTrue(element(by.css(".validation-error-message-last-name")).isPresent(), "last name validation error should show");
        assert.eventually.isTrue(element(by.css(".validation-error-message-email")).isPresent(), "email validation error should show");
      });

      it("should complete the registration process", function () {
        element(by.css(".registration-modal .firstName")).sendKeys("John");
        element(by.css(".registration-modal .lastName")).sendKeys("Doe");
        element(by.css(".registration-modal .email")).sendKeys("john.doe@awesomecompany.io");
        //click authorize
        element(by.css(".accept-terms-checkbox")).click();
        element(by.css(".sign-up-newsletter-checkbox")).click();
        element(by.css(".registration-save-button")).click();
        assert.eventually.isFalse(element(by.css(".registration-modal")).isPresent(), "registration dialog should hide");
      });

      it("should update auth button", function () {
        assert.eventually.isTrue(element(by.css(".desktop-menu-item img.profile-pic")).isDisplayed(), "profile pic should show");
      });

      it("should sign up newsletter in db", function () {
        var profilePromise = browser.executeScript(function () {
            return _.find(window.gapi._fakeDb.users, function (user) {return user.username === "john.doe@awesome.io";});
          });
        expect(profilePromise).to.eventually.have.property("mailSyncEnabled", true);
        expect(profilePromise).to.eventually.have.property("email", "john.doe@awesomecompany.io");
      });
  });
})();
