(function (angular) {
  "use strict";

  angular.module("risevision.common.popupdetector", [])

  .factory("popupTest", ["$q", "$window", "$timeout",
    function ($q, $window, $timeout) {
      return function () {
        var deferred = $q.defer();

        var errorMsg = "<strong>Sign In Pop-Up Blocked</strong> - " +
          "Allow pop-ups from store.risevision.com in the browser settings and Sign In again.";
        $timeout(function () {
          var popup = $window.open("", "", "width=50, height=50", true);
          $timeout(function () {
            try {
              if (!popup || popup.outerHeight === 0) {
                //First Checking Condition Works For IE & Firefox
                //Second Checking Condition Works For Chrome
                deferred.reject(errorMsg);
              } else {
                popup.close();
                deferred.resolve(true);
              }
            } catch (e) {
              deferred.reject(errorMsg);
              try {
                popup.close();
              } catch (e1) {}
            }
          }, 25);
        }, 2500);
        return deferred.promise;
      };
    }
  ]);

})(angular);
