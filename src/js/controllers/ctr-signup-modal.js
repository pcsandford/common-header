angular.module("risevision.common.header")
  .controller("SignUpModalCtrl", ["$scope", "uiFlowManager",
  function($scope, uiFlowManager) {
    
    // Trigger Login action
    $scope.login = function () {
      uiFlowManager.invalidateStatus("signedInWithGoogle");
    };
  }
]);
