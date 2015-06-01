/*jshint expr:true */
"use strict";

describe("Services: segment analytics", function() {

  beforeEach(module("risevision.common.analytics"));
  beforeEach(module(function ($provide) {
    $provide.factory("userState", [function () {
      return {
        getCopyOfProfile: function() {
          return {};
        },
        getUsername: function() {
          return "username";
        },
        getUserCompanyId: function() {
          return "companyId";
        },
        getUserCompanyName: function() {
          return "companyName";
        }
      };
    }]);
    $provide.factory("$location", [function () {
      return {
        path: function() {
          return "/somepath";
        }
      };
    }]);
  }));
  
  var segmentAnalytics, analyticsEvents, $scope;
  beforeEach(function(){
    inject(function($rootScope, $injector){
      $scope = $rootScope;
      
      segmentAnalytics = $injector.get("segmentAnalytics");
      analyticsEvents = $injector.get("analyticsEvents");
    });
  });
  
  it("should exist, also methods", function() {
    expect(segmentAnalytics.load).to.be.ok;
    ["load", "trackSubmit", "trackClick", "trackLink",
      "trackForm",
      "pageview", "identify", "group", "track", "ready", "alias",
      "page",
      "once", "off", "on"].forEach(
    function (method) {
      expect(segmentAnalytics).to.have.property(method);
      expect(segmentAnalytics[method]).to.be.a("function");
    });
  });

  it("should identify user", function(done) {
    var identifySpy = sinon.spy(segmentAnalytics, "identify");        

    $scope.$broadcast("risevision.user.authorized");
    $scope.$digest();
    
    setTimeout(function() {
      identifySpy.should.have.been.called;
      
      done();
    }, 10);
  });
  
  it("should call pageview", function(done) {
    var pageviewSpy = sinon.spy(segmentAnalytics, "pageview");

    $scope.$broadcast("$viewContentLoaded");
    $scope.$digest();
    
    setTimeout(function() {
      pageviewSpy.should.have.been.called;
      expect(segmentAnalytics.location).to.equal("/somepath");
      
      done();
    }, 10);
  });

});
