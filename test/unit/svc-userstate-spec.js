/*jshint expr:true */
"use strict";

describe("Services: auth & user state", function() {

  beforeEach(module("risevision.common.userstate"));

  beforeEach(module(function ($provide) {
    //stub services
    $provide.service("$q", function() {return Q;});
    $provide.value("$location", {
      search: function () {
        return {};
      },
      path: function () {
        return "";
      }
    });
    $provide.factory("gapiLoader", [function () {
      return {};
    }]);
  }));

  it("should exist, also methods", function(done) {
    inject(function(userState) {
      expect(userState.authenticate).to.be.ok;
      expect(userState.signOut).to.be.ok;
      expect(userState.getUserCompanyId).to.be.ok;
      ["getUserCompanyId", "getSelectedCompanyId", "getSelectedCompanyName",
      "updateCompanySettings", "getSelectedCompanyCountry", "getUsername",
      "getUserEmail", "getCopyOfProfile", "resetCompany",
      "getCopyOfUserCompany", "getCopyOfSelectedCompany", "switchCompany",
      "isSubcompanySelected", "getUserPicture", "inRVAFrame",
      "isRiseAdmin", "isRiseStoreAdmin", "isUserAdmin", "isPurchaser",
      "isSeller", "isRiseVisionUser", "isLoggedIn", "authenticate",
      "signOut", "refreshProfile", "getAccessToken"].forEach(
      function (method) {
        expect(userState).to.have.property(method);
        expect(userState[method]).to.be.a("function");
      });
      done();
    });
  });
});
