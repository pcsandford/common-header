/*jshint expr:true */
"use strict";

describe("Services: company state", function() {

  beforeEach(module("risevision.common.companystate"));
  beforeEach(module(function ($provide) {
    //stub services
    $provide.service("$q", function() {return Q;});
    $provide.value("$location", {
      search: function () {
        if (subCompany) {
          return {"cid": "RV_subcompany_id"};
        }
        else {
          return {};
        }
      }
    });
    $provide.factory("getCompany", [function () {
      return function(companyId) {
        var deferred = Q.defer();
        
        apiCount++;
        if (companyId) {
          expect(companyId).to.equal("RV_subcompany_id");
          
          deferred.resolve({
            "id": "RV_subcompany_id",
            "parentId": "RV_parent_id",
            "name": "Sub Company"
          });
        }
        else {
          deferred.resolve({
            "id": "RV_parent_id",
            "parentId": "fb788f1f",
            "name": "Parent Company",
            "country": "CA"
          });
        }
        return deferred.promise;
      };
    }]);
  }));
  
  var companyState, subCompany, apiCount, rootScope, broadcastSpy;
  
  beforeEach(function() {
    apiCount = 0;
  });
  
  describe("no selected company: ",function(){
    beforeEach(function(done){
      subCompany = false;
      
      inject(function($injector){
        companyState = $injector.get("companyState");
        rootScope = $injector.get("$rootScope");
        broadcastSpy = sinon.spy(rootScope, "$broadcast");
      });
      
      companyState.init();

      setTimeout(function() {
        broadcastSpy.should.have.been.calledWithExactly("risevision.company.selectedCompanyChanged");
        broadcastSpy.should.have.been.calledOnce;
        done();
      }, 10);
    });
    
    it("should exist, also methods", function() {
      expect(companyState.init).to.be.ok;
      expect(companyState.switchCompany).to.be.ok;
      expect(companyState.updateCompanySettings).to.be.ok;
      expect(companyState.updateUserCompanySettings).to.be.ok;
      ["init", "switchCompany", "updateCompanySettings", "resetCompany",
      "resetCompanyState", "getUserCompanyId", "getSelectedCompanyId", 
      "getSelectedCompanyName", "getSelectedCompanyCountry",
      "getCopyOfUserCompany", "getCopyOfSelectedCompany",
      "isSubcompanySelected", "isTestCompanySelected", "isSeller"].forEach(
      function (method) {
        expect(companyState).to.have.property(method);
        expect(companyState[method]).to.be.a("function");
      });
    });

    it("should initialize without selected company", function(done) {
      expect(apiCount).to.equal(1);
      expect(companyState.getUserCompanyId()).to.equal("RV_parent_id");
      expect(companyState.getSelectedCompanyId()).to.equal("RV_parent_id");
      expect(companyState.getSelectedCompanyName()).to.equal("Parent Company");
      expect(companyState.getSelectedCompanyCountry()).to.equal("CA");
      expect(companyState.isSubcompanySelected()).to.be.false;

      done();
    });
    
    it("should switch company", function(done) {
      companyState.switchCompany("RV_subcompany_id");
      setTimeout(function() {
        broadcastSpy.should.have.been.calledWithExactly("risevision.company.selectedCompanyChanged");
        broadcastSpy.should.have.been.calledTwice;
        expect(apiCount).to.equal(2);

        expect(companyState.getUserCompanyId()).to.equal("RV_parent_id");
        expect(companyState.getSelectedCompanyId()).to.equal("RV_subcompany_id");
        expect(companyState.getSelectedCompanyName()).to.equal("Sub Company");
        expect(companyState.isSubcompanySelected()).to.be.true;
        
        done();
      },10);
    });
    
    it("should reset company", function(done) {
      companyState.switchCompany("RV_subcompany_id");
      setTimeout(function() {
        expect(companyState.getSelectedCompanyId()).to.equal("RV_subcompany_id");
        expect(companyState.isSubcompanySelected()).to.be.true;
        
        broadcastSpy.should.have.been.calledWithExactly("risevision.company.selectedCompanyChanged");
        broadcastSpy.should.have.been.calledTwice;
        
        companyState.resetCompany();

        broadcastSpy.should.have.been.calledWithExactly("risevision.company.selectedCompanyChanged");
        broadcastSpy.should.have.been.calledThrice;
        expect(apiCount).to.equal(2);
        
        expect(companyState.getSelectedCompanyId()).to.equal("RV_parent_id");
        expect(companyState.isSubcompanySelected()).to.be.false;
        
        done();
      },10);
    });
    
    it("should not make an extra api call if parent is used", function() {
      companyState.switchCompany("RV_parent_id");
      broadcastSpy.should.have.been.calledWithExactly("risevision.company.selectedCompanyChanged");
      broadcastSpy.should.have.been.calledTwice;
      expect(apiCount).to.equal(1);
      expect(companyState.getSelectedCompanyId()).to.equal("RV_parent_id");
      expect(companyState.isSubcompanySelected()).to.be.false;
    });

    it("should update company settings", function(done) {
      var companyWithNewSettings = {
          "id": "RV_parent_id",
          "parentId": "fb788f1f",
          "name": "Parent Company new name",
          "country": "US"
      };
      broadcastSpy.reset();
      companyState.updateCompanySettings(companyWithNewSettings);
      setTimeout(function() {
          broadcastSpy.should.have.been.calledWith("risevision.company.updated");
          expect(broadcastSpy.args[0][1].companyId).to.equal("RV_parent_id");
          broadcastSpy.should.have.been.calledOnce;
          expect(companyState.getUserCompanyId()).to.equal("RV_parent_id");
          expect(companyState.getSelectedCompanyId()).to.equal("RV_parent_id");
          expect(companyState.getSelectedCompanyName()).to.equal("Parent Company new name");
          expect(companyState.getSelectedCompanyCountry()).to.equal("US");
          expect(companyState.isSubcompanySelected()).to.be.false;
          done();
      },10);
    });

    it("should update selected company settings without loosing fields", function(done) {
      var companyWithNewSettings = {
          "id": "RV_parent_id",
          "parentId": "fb788f1f",
          "name": "Parent Company new name",
          "country": "US"
      };
      companyState.updateCompanySettings(companyWithNewSettings);
      var copyOfCompany = companyState.getCopyOfSelectedCompany(true);
      copyOfCompany.country = "CA";
      companyState.updateCompanySettings(copyOfCompany);
      setTimeout(function() {
          expect(companyState.getSelectedCompanyId()).to.equal("RV_parent_id");
          expect(companyState.getSelectedCompanyCountry()).to.equal("CA");
          done();
      },10);
    });

    it("should update user company settings without loosing fields", function(done) {
      var companyWithNewSettings = {
          "id": "RV_parent_id",
          "parentId": "fb788f1f",
          "name": "Parent Company new name",
          "country": "US"
      };
      companyState.updateUserCompanySettings(companyWithNewSettings);
      var copyOfCompany = companyState.getCopyOfUserCompany(true);
      companyState.updateUserCompanySettings(copyOfCompany);
      setTimeout(function() {
          expect(companyState.getUserCompanyId()).to.equal("RV_parent_id");
          done();
      },10);
    });

  });
  
  describe("selected company: ", function() {
    beforeEach(function(){
      subCompany = true;
      
      inject(function($injector){
        companyState = $injector.get("companyState");
        rootScope = $injector.get("$rootScope");
        broadcastSpy = sinon.spy(rootScope, "$broadcast");
      });
    });
    
    it("should initialize with selected company", function(done) {
      companyState.init();
      
      setTimeout(function() {
        broadcastSpy.should.have.been.calledWithExactly("risevision.company.selectedCompanyChanged");
        broadcastSpy.should.have.been.calledOnce;

        expect(apiCount).to.equal(2);
        expect(companyState.getUserCompanyId()).to.equal("RV_parent_id");
        expect(companyState.getSelectedCompanyId()).to.equal("RV_subcompany_id");
        expect(companyState.getSelectedCompanyName()).to.equal("Sub Company");
        expect(companyState.isSubcompanySelected()).to.be.true;
        
        done();
      },10);
    });
    
    it("should not reset sub-company if init is called twice", function(done) {
      companyState.init();
      
      setTimeout(function() {
        companyState.init();
        
        setTimeout(function() {
          broadcastSpy.should.have.been.calledWithExactly("risevision.company.selectedCompanyChanged");
          broadcastSpy.should.have.been.calledTwice;

          expect(apiCount).to.equal(4);
          expect(companyState.getUserCompanyId()).to.equal("RV_parent_id");
          expect(companyState.getSelectedCompanyId()).to.equal("RV_subcompany_id");
          expect(companyState.getSelectedCompanyName()).to.equal("Sub Company");
          expect(companyState.isSubcompanySelected()).to.be.true;
          
          done();
        },10);
      },10);
    });
  });
});
