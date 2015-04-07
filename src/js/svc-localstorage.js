(function (angular) {

  "use strict";

  angular.module("risevision.common.localstorage", ["ngStorage"])
    .factory("localStorageService", ["$localStorage", "$sessionStorage",
      function ($localStorage, $sessionStorage) {

        var storageImpl = localStorage ? localStorage : sessionStorage;
        var storageImplWrapper = localStorage ? $localStorage :
          $sessionStorage;

        var factory = {};

        factory.getStorage = function () {
          return storageImplWrapper;
        };

        factory.setItemImmediate = function (key, value) {
          storageImpl.setItem(key, value);
        };

        factory.removeItemImmediate = function (key) {
          storageImpl.removeItem(key);
        };

        factory.getItem = function (key) {
          return storageImpl.getItem(key);
        };

        return factory;

      }
    ]);

})(angular);
