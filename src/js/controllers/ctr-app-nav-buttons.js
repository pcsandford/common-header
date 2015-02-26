angular.module("risevision.common.header")
  .controller("AppNavButtonsCtr", ["$scope", "userState",
    function ($scope, userState) {
      $scope.presentationsVisible = true;
      $scope.schedulesVisible = true;
      $scope.displaysVisible = true;

      var updateNavSecurity = function () {
        $scope.presentationsVisible = (userState.hasRole("ce") || userState
          .hasRole("cp"));
        $scope.schedulesVisible = userState.hasRole("cp");
        $scope.displaysVisible = userState.hasRole("da");
      };

      $scope.$watch(function () {
        return userState.isRiseVisionUser();
      }, function (value) {
        if (value) {
          updateNavSecurity();
        }
      });
    }
  ]);
