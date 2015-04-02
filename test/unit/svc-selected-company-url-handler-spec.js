/*jshint expr:true */
"use strict";

describe("Services: selected company url handler", function() {

  beforeEach(module("risevision.common.company"));
  beforeEach(module(function ($provide) {
    //stub services
    $provide.value("$location", {
      search: function () {
        if (arguments.length === 1) {
          locationSearch = arguments[0];
        } else if (arguments.length === 2) {
          locationSearch[arguments[0]] = arguments[1];
        }
        return locationSearch;
      },
      replace: function() {}
    });
    $provide.factory("userState", [function () {
      return {
        getUserCompanyId: function() {
          return userCompanyId;
        },
        getSelectedCompanyId : function(){
          return selectedCompanyId;
        },
        switchCompany: function(companyId) {
          selectedCompanyId = companyId;
        }
      };
    }]);
  }));
  
  var selectedCompanyUrlHandler, locationSearch, userCompanyId, selectedCompanyId;
  beforeEach(function(){
    locationSearch = {"cid": null};
    userCompanyId = "user_company_id";
    selectedCompanyId = "user_company_id";
    
    inject(function($injector){
      selectedCompanyUrlHandler = $injector.get("selectedCompanyUrlHandler");
    });
  });
  
  it("should exist, also methods", function() {
    expect(selectedCompanyUrlHandler.updateUrl).to.be.ok;
    expect(selectedCompanyUrlHandler.updateSelectedCompanyFromUrl).to.be.ok;
  });

  describe("updateUrl method: ",function(){    
    it("should update the URL if userCompany = selectedCompany", function() {
      selectedCompanyUrlHandler.updateUrl();
      
      expect(locationSearch.cid).to.equal("user_company_id");
    });
    
    it("should update cid from the URL if userCompany = selectedCompany", function() {
      locationSearch = {"cid": "selected_company_id"};
      
      selectedCompanyUrlHandler.updateUrl();
      
      expect(locationSearch.cid).to.equal("user_company_id");
    });
    
    it("should add cid to the URL if userCompany != selectedCompany", function() {
      selectedCompanyId = "selected_company_id";
      locationSearch = {"cid": null};
      
      selectedCompanyUrlHandler.updateUrl();
      
      expect(locationSearch.cid).to.equal("selected_company_id");
    });
    
    it("should update existing cid in the URL if userCompany != selectedCompany", function() {
      selectedCompanyId = "selected_company_id";
      locationSearch = {"cid": "some_company_id"};
      
      selectedCompanyUrlHandler.updateUrl();
      
      expect(locationSearch.cid).to.equal("selected_company_id");
    });
  });
  
  describe("updateSelectedCompanyFromUrl method: ",function(){    
    it("should update the URL with user company", function() {
      selectedCompanyUrlHandler.updateSelectedCompanyFromUrl();
      
      expect(locationSearch.cid).to.equal("user_company_id");
      expect(selectedCompanyId).to.equal("user_company_id");
    });
    
    it("should update the URL with selected company", function() {
      selectedCompanyId = "selected_company_id";
      
      selectedCompanyUrlHandler.updateSelectedCompanyFromUrl();
      
      expect(locationSearch.cid).to.equal("selected_company_id");
      expect(selectedCompanyId).to.equal("selected_company_id");
    });
    
    it("should use cid to update selected company", function() {
      selectedCompanyId = "some_company_id";
      locationSearch = {"cid": "selected_company_id"};
      
      selectedCompanyUrlHandler.updateSelectedCompanyFromUrl();
      
      expect(locationSearch.cid).to.equal("selected_company_id");
      expect(selectedCompanyId).to.equal("selected_company_id");
    });
  });

});
