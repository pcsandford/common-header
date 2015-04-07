(function (angular) {

  "use strict";

  angular.module("risevision.common.company", [])

  .service("selectedCompanyUrlHandler", ["$location", "userState",
    function ($location, userState) {
      this.updateUrl = function () {
        var selectedCompanyId = userState.getSelectedCompanyId();
        // This parameter is only appended to the url if the user is logged in
        if (selectedCompanyId && $location.search().cid !==
          selectedCompanyId) {
          $location.search("cid", selectedCompanyId);
        }
      };

      this.updateSelectedCompanyFromUrl = function () {
        var newCompanyId = $location.search().cid;
        if (newCompanyId && userState.getUserCompanyId() &&
          newCompanyId !== userState.getSelectedCompanyId()) {
          userState.switchCompany(newCompanyId);
        } else if (!newCompanyId && userState.getSelectedCompanyId()) {
          $location.search("cid", userState.getSelectedCompanyId());
          $location.replace();
        }
      };
    }
  ]);
})(angular);
