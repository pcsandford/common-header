/*jshint expr:true */
/*global gapi*/
"use strict";

describe("Services: auth & user state", function() {
  var $window, path = "";

  beforeEach(module("risevision.common.userstate"));

  beforeEach(module(function ($provide) {
    //stub services
    $provide.service("$q", function() {return Q;});
    $provide.value("$location", {
      search: function () {
        return {};
      },
      path: function () {
        return path;
      },
      protocol: function () {
        return "protocol";
      }
    });
    $provide.service("getBaseDomain", [function() {
      return function() {
        return "domain";
      };
    }]);

    $provide.factory("rvTokenStore", [function () {
      var token;
      return {
        read: function() {
          return token;
        },
        write: function(newToken) {
          token = newToken;
        },
        clear: function() {
          token = undefined;
        }
      };
    }]);
    $provide.value("$loading", {
      startGlobal: function(){},
      stopGlobal: function(){}
    });
  }));
  
  it("should exist, also methods", function(done) {
    inject(function(userState) {
      expect(userState.authenticate).to.be.ok;
      expect(userState.signOut).to.be.ok;
      expect(userState.getUserCompanyId).to.be.ok;
      ["getUserCompanyId", "getSelectedCompanyId", "getSelectedCompanyName",
      "updateCompanySettings", "getSelectedCompanyCountry", "getUsername",
      "getUserEmail", "getCopyOfProfile", "resetCompany",
      "getCopyOfUserCompany", "getCopyOfSelectedCompany", "switchCompany",
      "isSubcompanySelected", "getUserPicture", "inRVAFrame",
      "isRiseAdmin", "isRiseStoreAdmin", "isUserAdmin", "isPurchaser",
      "isSeller", "isRiseVisionUser", "isLoggedIn", "authenticate",
      "signOut", "refreshProfile", "getAccessToken"].forEach(
      function (method) {
        expect(userState).to.have.property(method);
        expect(userState[method]).to.be.a("function");
      });
      done();
    });
  });
  
  describe("user not logged in: ",function(){
    var userState;
    
    beforeEach(function() {      
      inject(function($injector){
        userState = $injector.get("userState");
      });
    });
    
    it("should not be authenticated", function(done) {
      userState.authenticate().then(done, function(msg) {
        expect(userState.isLoggedIn()).to.be.false;
        expect(msg).to.equal("user is not authenticated");

        done();
      })
      .then(null,done);
    });
  });
  
  describe("should remember user: ", function(){
    var userState;
    
    beforeEach(function() {
      gapi.setPendingSignInUser("michael.sanchez@awesome.io");
      gapi.auth.authorize({immediate: false}, function() {});

      inject(function($injector){
        userState = $injector.get("userState");
        
        // Fake user token being stored locally
        userState._setUserToken("1234");
      });
    });
    
    it("should be authenticated", function(done) {
      userState.authenticate().then(function() {
        expect(userState.isLoggedIn()).to.be.true;
        expect(userState.isRiseVisionUser()).to.be.true;
        
        expect(userState.getUsername()).to.equal("michael.sanchez@awesome.io");

        done();
      }, function(err) {
        done(err || "error");
      })
      .then(null,done);
    });
        
    it("should obtain user & company info", function(done) {
      userState.authenticate().then(function() {
        expect(userState.getUserEmail()).to.equal("michael.sanchez@awesome.io");
        expect(userState.isRiseAdmin()).to.be.false;
        expect(userState.isUserAdmin()).to.be.true;
        expect(userState.getCopyOfProfile().firstName).to.equal("Michael");
        
        expect(userState.getUserCompanyName()).to.equal("Rise Vision Test Co.");
        expect(userState.getSelectedCompanyCountry()).to.equal("CA");
        
        done();
      })
      .then(null,done);
      
    });

    it("should sign out", function(done) {
      userState.authenticate().then(function() {
        expect(userState.isLoggedIn()).to.be.true;
        
        userState.signOut().then(function() {
          expect(userState.isLoggedIn()).to.be.false;
          expect(userState.isRiseVisionUser()).to.be.false;
          
          expect(userState.getUsername()).to.not.be.truely;

          done();
        }, function(err) {
          done(err || "error");
        })
        .then(null,done);
      })
      .then(null,done);

    });
    
    it("set url path for next tests", function() {
      path = "/state=%7B%22p%22%3A%22%22%2C%22u%22%3A%22%23%2F%22%2C%22s%22%3A%22%22%7D&access_token=ya29&token_type=Bearer&expires_in=3600";
    });

  });
  
  describe("interpret auth result, new user: ", function(){
    var userState;
    
    beforeEach(function() {
      gapi.setPendingSignInUser("john.doe@awesome.io");
      gapi.auth.authorize({immediate: false}, function() {});

      inject(function($injector){
        userState = $injector.get("userState");
      });
    });
    
    it("should be authenticated", function(done) {
      userState.authenticate().then(function() {
        expect(userState.isLoggedIn()).to.be.true;
        expect(userState.isRiseVisionUser()).to.be.false;
        
        expect(userState.getUsername()).to.equal("john.doe@awesome.io");

        done();
      }, function(err) {
        done(err || "error");
      })
      .then(null,done);
    });
  });
  
  describe("interpret auth result, existing user: ", function(){
    var userState;
    
    beforeEach(function() {
      gapi.setPendingSignInUser("michael.sanchez@awesome.io");
      gapi.auth.authorize({immediate: false}, function() {});

      inject(function($injector){
        userState = $injector.get("userState");
      });
    });
    
    it("should be authenticated", function(done) {
      userState.authenticate().then(function() {
        expect(userState.isLoggedIn()).to.be.true;
        expect(userState.isRiseVisionUser()).to.be.true;
        
        expect(userState.getUsername()).to.equal("michael.sanchez@awesome.io");

        done();
      }, function(err) {
        done(err || "error");
      })
      .then(null,done);
    });

  });
  
  describe("handle api failures: ", function() {
    beforeEach(module(function ($provide) {
      $provide.service("gapiLoader", function () {
        return function() {
          var deferred = Q.defer();
          
          if (failGapiLoader) {
            deferred.reject("gapi loader failed");
          }
          else {
            deferred.resolve({
              auth: {
                authorize: function(opts, callback) {
                  if (failAuthorize) {
                    callback({
                      error: "authorize failure"
                    });
                  }
                  callback({});
                }
              }
            });
          }
          
          return deferred.promise;
        };
      });
      $provide.service("getOAuthUserInfo", function() {
        return function() {
          var deferred = Q.defer();
      
          if (failOAuthUser) {
            deferred.reject("oauth failure");
          }
          else {
            deferred.resolve({
              id: 1234,
              email: "someuser@awesome.io",
              picture: "photo.jpg"
            });
          }
          
          return deferred.promise;
        };
      });
    }));
    
    var failGapiLoader, failAuthorize, failOAuthUser;
    
    it("should throw error if gapi loader fails", function(done) {
      failGapiLoader = true;

      inject(function(userState){
        userState.authenticate().then(done, function(err) {
          expect(userState.isLoggedIn()).to.be.false;
          expect(err).to.equal("gapi loader failed");
          
          done();
        })
        .then(null,done);
      });
    });
    
    it("should throw error if gapi.auth.authorize fails", function(done) {
      failGapiLoader = false;
      failAuthorize = true;
    
      inject(function(userState){    
        userState.authenticate().then(done, function(err) {
          expect(userState.isLoggedIn()).to.be.false;
          expect(err).to.equal("authorize failure");
          
          done();
        })
        .then(null,done);
      });
    });
      
    it("should throw error on oauth failure", function(done) {
      failGapiLoader = false;
      failAuthorize = false;
      failOAuthUser = true;
    
      inject(function(userState){    
        userState.authenticate().then(done, function(err) {
          expect(userState.isLoggedIn()).to.be.false;
          expect(err).to.equal("oauth failure");
                    
          done();
        })
        .then(null,done);
      });
    });
  });
  
  xdescribe("force authentication: ", function() {
    beforeEach(module(function ($provide) {
      $window = {
        location: {
          value: "",
          replace: function() {
            
          },
          getHref: function() {
            return this.value;
          },
          setHref: function(newValue) {
            this.value = newValue;
          }
        }
      };
          
      Object.defineProperty($window.location, "href", {
        get: function() {return this.getHref(); },
        set: function(y) { this.setHref(y); }
      });
      
      $provide.value("$window", $window);
    }));
    
    var userState;
    
    beforeEach(function() {
      inject(function($injector){
        userState = $injector.get("userState");
      });
    });
    
    xit("should redirect", function(done) {
      userState.authenticate(true).then(done, done);
      
      expect(userState.isLoggedIn()).to.be.false;
      expect($window.location).to.equal("user is not authenticated");

    });
  });
});
