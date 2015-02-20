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

  describe("Companies Settings", function() {
      before(function() {
        browser.driver.manage().deleteAllCookies();
        browser.get("/test/e2e/index.html#/shopping-cart");

        //clear local storage
        browser.executeScript("localStorage.clear();");

        browser.refresh();
        element(by.id("reset-db")).click();
      });


      describe("Company Settings", function () {
        it("logs in", function () {
          browser.executeScript("gapi.setPendingSignInUser('michael.sanchez@awesome.io')");
          element(by.css("button.sign-in")).click();
          assert.eventually.isFalse(element(by.css("button.sign-in")).isDisplayed(), "sign in button should not show");
        });

        it("Opens Company Settings Dialog", function() {
          element(by.css(".user-profile-dropdown img.profile-pic")).click();
          assert.eventually.isTrue(element(by.css(".company-settings-menu-button")).isDisplayed(),
            "Company settings menu item should present");
          element(by.css(".company-settings-menu-button")).click();
          assert.eventually.isTrue(element(by.css(".company-settings-modal")).isDisplayed(),
            "Company settings dialog should show");
        });

        xit("Resets auth key", function() {
          element(by.css(".ps-reset-auth-key")).click();
          browser.switchTo().alert().then(function (prompt){ prompt.accept(); }); //confirm reset
          browser.switchTo().alert().then(function (prompt){ prompt.accept(); }); //acknowledge reset message
        });

        xit("Resets claim id", function() {
          element(by.css(".ps-reset-claim-id")).click();
          browser.switchTo().alert().then(function (prompt){ prompt.accept(); }); //confirm reset
          browser.switchTo().alert().then(function (prompt){ prompt.accept(); }); //acknowledge reset message
        });

        it("Company Settings Dialog Should Close", function () {
          element(by.css("button.close-company-settings-button")).click();
          assert.eventually.isFalse(element(by.css(".company-settings-modal")).isPresent(),
            "Company Settings dialog should hide");
        });
      });

      describe("Delete Company", function () {
        it("Opens Company Settings Dialog", function() {
          element(by.css(".user-profile-dropdown img.profile-pic")).click();
          assert.eventually.isTrue(element(by.css(".company-settings-menu-button")).isDisplayed(),
            "Company settings menu item should present");
          element(by.css(".company-settings-menu-button")).click();
          assert.eventually.isTrue(element(by.css(".company-settings-modal")).isDisplayed(),
            "Company settings dialog should show");
        });

        it("Should sign me out when deleting company", function () {
          element(by.css("button.delete-company-button")).click();
          browser.switchTo().alert().then(function (prompt){ prompt.accept(); });
          assert.eventually.isTrue(element(by.css("button.sign-in")).isDisplayed(), "Should be signed out");
        });
      });

  });
})();
