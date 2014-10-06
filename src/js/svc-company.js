"use strict";

angular.module("risevision.common.company",
  [
    "risevision.common.config",
    "risevision.common.gapi",
    "risevision.common.cache",
    "risevision.common.util"
  ])

    .factory("validateAddress", ["$q", "storeAPILoader", "$log",
  function ($q, storeAPILoader, $log) {
      return function (company) {

        var deferred = $q.defer();
        $log.debug("validateAddress called", company);

        var obj = {
            "street": company.street,
            "unit": company.unit,
            "city": company.city,
            "country": company.country,
            "postalCode": company.postalCode,
            "province": company.province,
        };

        storeAPILoader.get().then(function (storeApi) {
          var request = storeApi.company.validateAddress(obj);
          request.execute(function (resp) {
              $log.debug("validateAddress resp", resp);
              deferred.resolve(resp);
          });
        });

        return deferred.promise;
    };
  }])

  .factory("createCompany", ["$q", "coreAPILoader", function ($q, coreAPILoader) {
    return function (parentCompanyId, company) {
      var deferred = $q.defer();
      company.validate = true;
      coreAPILoader().then(function (coreApi) {
        var request = coreApi.company.add({
          parentId: parentCompanyId,
          data: JSON.stringify(company)
        });
        request.execute(function (resp) {
          if(resp.result) {
            deferred.resolve(resp.item);
          }
          else {
            deferred.reject(resp);
          }
        }, deferred.reject);
      });
      return deferred.promise;
    };
  }])

  .factory("getCompany", ["coreAPILoader", "$q", "$log",
  function (coreAPILoader, $q, $log) {
    return function (id) { //get a company either by id or authKey
      $log.debug("getCompany called", id);

      var deferred = $q.defer();
        coreAPILoader().then(function (coreApi) {
          var criteria = {};
          if(id) {criteria.id = id; }
          var request = coreApi.company.get(criteria);
          request.execute(function (resp) {
              $log.debug("getCompany resp", resp);
              if(resp.result) {
                deferred.resolve(resp.item);
              }
              else {
                deferred.reject(resp);
              }
          });
        });
      return deferred.promise;
    };
  }])

  .factory("lookupCompany", ["coreAPILoader", "$q", "$log",
  function (coreAPILoader, $q, $log) {
    return function (authKey) { //get a company either by id or authKey
      $log.debug("lookupCompany called", authKey);

      var deferred = $q.defer();
        coreAPILoader().then(function (coreApi) {
          var request = coreApi.company.lookup({authKey: authKey});
          request.execute(function (resp) {
              $log.debug("lookupCompany resp", resp);
              if(resp.result) {
                deferred.resolve(resp.item);
              }
              else {
                deferred.reject(resp);
              }
          });
        });
      return deferred.promise;
    };
  }])

  .factory("moveCompany", ["coreAPILoader", "$q", "$log",
  function (coreAPILoader, $q, $log) {
    return function (authKey) { //get a company either by id or authKey
      var deferred = $q.defer();
        coreAPILoader().then(function (coreApi) {
          var request = coreApi.company.move({authKey: authKey});
          request.execute(function (resp) {
              $log.debug("moveCompany resp", resp);
              if(resp.result) {
                deferred.resolve(resp.item);
              }
              else {
                deferred.reject(resp);
              }
          });
        });
      return deferred.promise;
    };
  }])

  .factory("updateCompany", ["$q", "$log", "coreAPILoader", "pick",
   function ($q, $log, coreAPILoader, pick){
    return function (companyId, fields) {
        var deferred = $q.defer();
        fields = pick(
          fields, "name", "street", "unit", "city", "country", "postalCode", "province", "telephone");
        $log.debug("updateCompany called", companyId, fields);
        // fields.validate = validationRequired || false;
        coreAPILoader().then(function (coreApi) {
          var request = coreApi.company.update({id: companyId, data: JSON.stringify(fields)});
          request.execute(function (resp) {
            $log.debug("updateCompany resp", resp);
              deferred.resolve(resp);
          });
        });

        return deferred.promise;
    };
  }])

  .service("companyService", ["coreAPILoader", "$q", "$log", "getCompany",
    function (coreAPILoader, $q, $log, getCompany) {

    this.getCompanies = function (companyId, search, cursor, count, sort) {
      var deferred = $q.defer();
      var obj = {
        "companyId": companyId,
        "search": search,
        "cursor": cursor,
        "count": count,
        "sort": sort
      };
      $log.debug("getCompanies called with", obj);
      coreAPILoader().then(function (coreApi) {
        var request = coreApi.company.list(obj);
        request.execute(function (resp) {
            $log.debug("getCompanies resp", resp);
            deferred.resolve(resp);
        });
      });
      return deferred.promise;
    };

    this.loadSelectedCompany = function (selectedCompanyId, userCompany) {
        //this funtion assumes user and user.company are loaded
        var deferred = $q.defer();
        if (selectedCompanyId && selectedCompanyId !== userCompany.id) {
            getCompany(selectedCompanyId).then(function(res) {
                if (res.code === 0 && res.item) {
                    deferred.resolve(res.item);
                } else {
                    deferred.resolve(userCompany);
                }
            });
        } else {
            deferred.resolve(userCompany);
        }
        return deferred.promise;
    };

    this.validateAddressSimple = function(company, contact) {
      var errors = [];
      if (contact) {
          if (!contact.firstName) {
              errors.push("Missing First Name");
          }
          if (!contact.lastName) {
              errors.push("Missing Last Name");
          }
          if (!contact.email) {
              errors.push("Missing Email");
          } else {
              var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
              if (!re.test(contact.email)) {
                  errors.push("Invalid Email");
              }
          }
      }
      if (!company.street) {
          errors.push("Missing Address (Line 1)");
      }
      if (!company.city) {
          errors.push("Missing City");
      }
      if (!company.country) {
          errors.push("Missing Country");
      }
      if (!company.province) {
          errors.push("Missing State / Province");
      }
      if (!company.postalCode) {
          errors.push("Missing Zip / Postal Code");
      }
      return errors;
    };

  }]);
