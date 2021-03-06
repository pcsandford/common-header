angular.module("risevision.common.header")
  .directive("linkCid", ["userState",
    function (userState) {
      return {
        link: function ($scope, ele, attr) {
          var updateLinkCompanyId = function (companyId) {
            var index = attr.href.indexOf("cid=");
            var value;
            if (index > -1) {
              value = attr.href.substring(0, index + 4) + companyId;
            } else {
              value = attr.href +
                (attr.href.indexOf("?") === -1 ? "?" : "&") +
                "cid=" + companyId;
            }
            attr.$set("href", value);
          };

          $scope.$watch(function () {
            return userState.getSelectedCompanyId();
          }, function (newValue, oldValue) {
            if (newValue && newValue !== oldValue) {
              updateLinkCompanyId(newValue);
            }
          });
        }
      };
    }
  ]);
