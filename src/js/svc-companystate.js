(function (angular) {

  "use strict";

  angular.module("risevision.common.companystate", ["risevision.core.company",
    "risevision.common.util"
  ])

  .factory("companyState", ["$location", "getCompany", "objectHelper",
    "$rootScope", "$log", "$q",
    function ($location, getCompany, objectHelper, $rootScope, $log, $q) {
      var pendingSelectedCompany;

      var _state = {
        userCompany: {},
        selectedCompany: {}
      };

      var _resetCompanyState = function () {
        objectHelper.clearObj(_state.selectedCompany);
        objectHelper.clearObj(_state.userCompany);
        $log.debug("Company state has been reset.");
      };

      if ($location.search().cid) {
        $log.debug("cid", $location.search().cid,
          "saved for later processing.");
        pendingSelectedCompany = $location.search().cid;
      }

      var _init = function () {
        var deferred = $q.defer();

        //populate userCompany
        getCompany().then(function (company) {
          objectHelper.clearAndCopy(company, _state.userCompany);

          return _switchCompany(pendingSelectedCompany);
        })
          .then(null, function () {
            _companyState.resetCompany();
          })
          .finally(function () {
            pendingSelectedCompany = null;

            deferred.resolve(null);
            $rootScope.$broadcast(
              "risevision.company.selectedCompanyChanged");
          });

        return deferred.promise;
      };

      var _switchCompany = function (companyId) {
        var deferred = $q.defer();

        if (companyId && companyId !== _state.userCompany.id) {
          getCompany(companyId)
            .then(function (company) {
              objectHelper.clearAndCopy(company, _state.selectedCompany);

              deferred.resolve();
              $rootScope.$broadcast(
                "risevision.company.selectedCompanyChanged");
            })
            .then(null, function (resp) {
              $log.error("Failed to load selected company.", resp);

              deferred.reject(resp);
            });
        } else {
          _companyState.resetCompany();

          deferred.resolve();
          $rootScope.$broadcast(
            "risevision.company.selectedCompanyChanged");
        }

        return deferred.promise;
      };

      var _companyState = {
        init: _init,
        switchCompany: _switchCompany,
        updateCompanySettings: function (company) {
          if (company && _state.selectedCompany) {
            objectHelper.clearAndCopy(company, _state.selectedCompany);
            if (_state.userCompany.id === _state.selectedCompany.id) {
              objectHelper.clearAndCopy(company, _state.userCompany);
            }

            $rootScope.$broadcast("risevision.company.updated");
          }
        },
        resetCompany: function () {
          objectHelper.clearAndCopy(_state.userCompany, _state.selectedCompany);
        },
        resetCompanyState: _resetCompanyState,
        getUserCompanyId: function () {
          return (_state.userCompany && _state.userCompany.id) || null;
        },
        getUserCompanyName: function () {
          return (_state.userCompany && _state.userCompany.name) || null;
        },
        getSelectedCompanyId: function () {
          return (_state.selectedCompany && _state.selectedCompany.id) ||
            null;
        },
        getSelectedCompanyName: function () {
          return (_state.selectedCompany && _state.selectedCompany.name) ||
            null;
        },
        getSelectedCompanyCountry: function () {
          return (_state.selectedCompany && _state.selectedCompany.country) ||
            null;
        },
        getCopyOfUserCompany: function () {
          return objectHelper.follow(_state.userCompany);
        },
        getCopyOfSelectedCompany: function () {
          return objectHelper.follow(_state.selectedCompany);
        },
        isSubcompanySelected: function () {
          return _state.selectedCompany && _state.selectedCompany.id !==
            (_state.userCompany && _state.userCompany.id);
        },
        isTestCompanySelected: function () {
          return _state.selectedCompany && _state.selectedCompany.isTest ===
            true;
        },
        isSeller: function () {
          return (_state.selectedCompany && _state.selectedCompany.sellerId) ?
            true : false;
        },
      };

      return _companyState;
    }
  ]);

})(angular);
