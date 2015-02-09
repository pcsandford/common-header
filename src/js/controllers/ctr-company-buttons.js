angular.module("risevision.common.header")
.controller("CompanyButtonsCtrl", [ "$scope", "$modal", "$templateCache",
  "userState", "selectedCompanyUrlHandler",
  function($scope, $modal, $templateCache, userState,
    selectedCompanyUrlHandler) {
    $scope.inRVAFrame = userState.inRVAFrame();

    $scope.$watch(function () {return userState.getSelectedCompanyId(); },
    function (newCompanyId) {
      if(newCompanyId) {
        $scope.isSubcompanySelected = userState.isSubcompanySelected();
        selectedCompanyUrlHandler.updateUrl();
      }
    });

    $scope.$watch(function () {return userState.getSelectedCompanyName(); },
    function (selectedCompanyName) {
      if(selectedCompanyName) {
        $scope.selectedCompanyName = userState.getSelectedCompanyName();
      }
    });

    $scope.$watch(function () {return userState.isRiseVisionUser(); },
    function (isRvUser) {
      $scope.isRiseVisionUser = isRvUser;
      if(isRvUser === true) {
        $scope.isUserAdmin = userState.isUserAdmin();
        $scope.isPurchaser = userState.isPurchaser();
      }
    });

    $scope.$watch(function () {return userState.isRiseAdmin(); },
    function (isRvAdmin) { $scope.isRiseVisionAdmin = isRvAdmin; });

    //detect selectCompany changes on route UI
    $scope.$on("$stateChangeSuccess", selectedCompanyUrlHandler.updateSelectedCompanyFromUrl);
    $scope.$on("$routeChangeSuccess", selectedCompanyUrlHandler.updateSelectedCompanyFromUrl);

    $scope.addSubCompany = function() {
      $modal.open({
        template: $templateCache.get("subcompany-modal.html"),
        controller: "SubCompanyModalCtrl",
        size: "lg"
      });
    };

    // Show Company Settings Modal
    $scope.companySettings = function() {
      $modal.open({
        template: $templateCache.get("company-settings-modal.html"),
        controller: "CompanySettingsModalCtrl",
        size: "lg",
        resolve: {
          companyId: function () {
            return userState.getSelectedCompanyId();
          }
        }
      });
    };

    // Show Company Users Modal
    $scope.companyUsers = function(size) {
      $modal.open({
        template: $templateCache.get("company-users-modal.html"),
        controller: "CompanyUsersModalCtrl",
        size: size,
        backdrop: true,
        resolve: {
          company: function () {
            return userState.getCopyOfSelectedCompany();
          }
        }
      });
    };

    $scope.switchCompany = function () {
      var modalInstance = $modal.open({
        template: $templateCache.get("company-selector-modal.html"),
        controller: "companySelectorCtr",
        backdrop: true,
        resolve: {
          companyId: function () {
            return userState.getSelectedCompanyId();
          }
        }
      });
      modalInstance.result.then(userState.switchCompany);
    };

    // Show Move Company Modal
    $scope.moveCompany = function(size) {
      // var modalInstance =
      $modal.open({
        template: $templateCache.get("move-company-modal.html"),
        controller: "MoveCompanyModalCtrl",
        size: size
      });
    };

    $scope.resetCompany = function () {
      userState.resetCompany();
    };

  }
]);
