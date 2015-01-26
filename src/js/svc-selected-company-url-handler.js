(function (angular){

  "use strict";

  angular.module("risevision.common.company", [])

    .service("selectedCompanyUrlHandler", ["$location", "userState",
      function ($location, userState) {
        this.updateUrl = function () {
          var selectedCompanyId = userState.getSelectedCompanyId();
          // This parameter is only appended to the url if the user is logged in
          if (selectedCompanyId && selectedCompanyId !== userState.getUserCompanyId()) {
            if ($location.search().cid !== selectedCompanyId) {
              $location.search("cid", selectedCompanyId);
            }
          }
          else if ($location.search().cid) {
            $location.search({"cid" : null});
          }
        };
        
        this.updateSelectedCompanyFromUrl = function () {
          var newCompanyId = $location.search().cid;
          if(newCompanyId && userState.getUserCompanyId() && 
            newCompanyId !== userState.getSelectedCompanyId()) {
            userState.switchCompany(newCompanyId);
          }
          else if (!newCompanyId && userState.getSelectedCompanyId() &&
            userState.getSelectedCompanyId() !== userState.getUserCompanyId()) {
            $location.search("cid", userState.getSelectedCompanyId());
            $location.replace();
          }
        };
    }]);
  }
)(angular);
