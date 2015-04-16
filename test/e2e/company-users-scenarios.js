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

  describe("Companies", function() {
      before(function() {
        browser.driver.manage().deleteAllCookies();
        browser.get("/test/e2e/index.html#/shopping-cart");

        //clear local storage
        browser.executeScript("localStorage.clear();");

        browser.refresh();
        element(by.id("reset-db")).click();
      });

      describe("Company Users", function () {
        it("logs in", function () {
          browser.executeScript("gapi.setPendingSignInUser('michael.sanchez@awesome.io')");
          element(by.css("button.sign-in")).click();
          assert.eventually.isFalse(element(by.css("button.sign-in")).isDisplayed(), "sign in button should not show");
        });

        it("Opens Company Users Dialog and load company users", function() {
          element(by.css(".user-profile-dropdown img.profile-pic")).click();
          assert.eventually.isTrue(element(by.css(".dropdown-menu .company-users-menu-button")).isDisplayed(),
            "Company users menu item should present");
          element(by.css(".dropdown-menu .company-users-menu-button")).click();

          browser.sleep(500);

          assert.eventually.isTrue(element(by.css(".company-users-modal")).isDisplayed(),
            "Company users dialog should show");
        });

        it("loads up a list of users for the company", function () {
          assert.eventually.strictEqual(element.all(by.css(".company-users-list-item")).count(), 34,
            "Loads up 34 users");
        });

        it("opens up Add User dialog", function () {
          element(by.css("button.add-company-user-button")).click();
          
          browser.sleep(500);

          assert.eventually.isTrue(element(by.css(".user-settings-modal")).isPresent(), "Add user dialog should show");
        });

        it("adds a user", function () {
          element(by.id("user-settings-username")).sendKeys("noobuser@somecompany.com");
          element(by.id("user-settings-first-name")).sendKeys("John");
          element(by.id("user-settings-last-name")).sendKeys("Noob");
          element(by.id("user-settings-phone")).sendKeys("000-000-0000");
          element(by.id("user-settings-email")).sendKeys("noobuser@somecompany.com");
          element(by.id("save-button")).click();
          assert.eventually.isFalse(element(by.css(".user-settings-modal")).isPresent(), "Add user dialog should hide");

          assert.eventually.strictEqual(element.all(by.css(".company-users-list-item")).count(), 35,
            "Loads up 35 users");
        });

        it("Company Users Dialog Should Close", function () {
          element(by.css("button.close-company-users-button")).click();
          assert.eventually.isFalse(element(by.css(".company-users-modal")).isPresent(),
            "Company Users dialog should hide");
        });
      });
  });
})();
