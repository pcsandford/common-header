"use strict";
angular.module("risevison.common.auth", ["risevision.common.gapi"])
  .service("apiAuth", ["$interval", "$rootScope", "$q", "$http", "gapiLoader", "storeAPILoader", "oauthAPILoader",
    function apiAuthConstructor($interval, $rootScope, $q, $http, gapiLoader, storeAPILoader, oauthAPILoader, CLIENT_ID) {

      var SCOPES = "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile";

      this.checkAuth = function (silentCheck) {
        var deferred = $q.defer();
        gapiLoader.get().then(function (gApi) {
          gApi.auth.authorize({ client_id: CLIENT_ID, scope: SCOPES, immediate: silentCheck}, function (authResult) {
            deferred.resolve(authResult);
          });
        });
        return deferred.promise;
      };

      this.getUserCompanies = function () {
          var deferred = $q.defer();
          storeAPILoader.get().then(function (storeClient) {
            var request = storeClient.usercompanies.get({});
            request.execute(function (resp) {
              deferred.resolve(resp);
            });
          });
          return deferred.promise;
      };

      this.getProfile = function () {
        var deferred = $q.defer();
        oauthAPILoader.get().then(function (gApi) {
          var request = gApi.client.oauth2.userinfo.get({});
          request.execute(function (resp) {
            deferred.resolve(resp);
          });
        });
        return deferred.promise;
      };

}]);
