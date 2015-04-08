angular.module("risevision.common.header")

.controller("PaymentMethodsModalCtrl", ["$scope", "$modalInstance", "$modal",
  "$templateCache",
  function ($scope, $modalInstance, $modal, $templateCache) {
    $scope.closeModal = function () {
      $modalInstance.dismiss("cancel");
    };
    // Show Payment Methods Modal
    $scope.creditCards = function (size) {
      // var modalInstance =
      $modal.open({
        template: $templateCache.get("credit-cards-modal.html"),
        controller: "CreditCardsModalCtrl",
        size: size
      });
    };
  }
])
  .controller("CreditCardsModalCtrl", ["$scope", "$modalInstance",
    function ($scope, $modalInstance) {
      $scope.closeModal = function () {
        $modalInstance.dismiss("cancel");
      };
    }
  ]);
