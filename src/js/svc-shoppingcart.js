(function (angular) {
  "use strict";

  angular.module("risevision.common.shoppingcart", ["risevision.common.gapi", "risevision.common.userstate"])

  .factory("shoppingCart", ["rvStorage", "storeAPILoader", "$log", "$q", "userState",
    function (rvStorage, storeAPILoader, $log, $q, userState){
    var _items = [];

    var readFromStorage = function() {
      var deferred = $q.defer();
      if (userState.isLoggedIn()) {

        storeAPILoader().then(function (storeApi) {
          var obj = {"id": userState.getUsername()};
          var request = storeApi.cart.get(obj);
          request.execute(function (resp) {
            if(!resp.error) {
              clearItems();
              addItems(resp.items);
              deferred.resolve();
            }
            else {
              $log.warn("Error loading cart items. Error: " + resp.error);
              deferred.resolve();
            }
          });
        });

      } else {
        clearItems();
        deferred.resolve();
      }
      return deferred.promise;
    };

    var persistToStorage = function() {
      var deferred = $q.defer();
      if (userState.isLoggedIn()) {
        storeAPILoader().then(function (storeApi) {
          //remove try/catch after API is implemented
          try {
            var obj = { "data": {
              //"id": userState.getUsername(),
              "jsonItems": getJsonItems(_items),
              "shipToAttention": "",
              "useBillToAddress": true
            }};
            var request = storeApi.cart.put(obj);
            request.execute(function (resp) {
              if(!resp.error) {
                deferred.resolve();
              }
              else {
                $log.warn("Error persisting cart items. Error: " + resp.error);
                deferred.resolve();
              }
            });
          } catch (e) {
              deferred.resolve();
              $log.error("[persistToStorage] - Unimplemented API method " + e.message);
          }
        });
      }
      return deferred.promise;

    };

    var clearItems = function() {
      while(_items.length > 0) { _items.pop(); }
    };

    var addItems = function(items) {
      if (items) {
        for (var i = 0; i < items.length; i++) {
          _items.push(items[i]);
        }
      }
    };

    var cleanProducts = function(items) {
      var item;
      var res = [];
      for (var i = 0; i < items.length; i++) {
        item = {
          "productId": items[i].productId,
          "qty": items[i].qty,
          "accountingId": items[i].selected.accountingId
        };
        res.push(item);
      }
      return res;
    };

    var getJsonItems = function(items) {
      var cleanedItems = cleanProducts(items);
      return JSON.stringify(cleanedItems);
    };

    var loadReady = $q.defer();

    var cartManager = {
      loadReady: loadReady.promise,
      getSubTotal: function (isCAD) {
        var shipping = 0;
        var subTotal = 0;
        if(_items) {
          for (var i = 0; i < _items.length; i++) {
              var shippingCost = (isCAD) ? _items[i].selected.shippingCAD : _items[i].selected.shippingUSD;
              var productCost = (isCAD) ? _items[i].selected.priceCAD : _items[i].selected.priceUSD;
              if (_items[i].paymentTerms !== "Metered") {
                shipping += shippingCost * _items[i].qty || 0;
                subTotal += productCost * _items[i].qty || 0;
              }
          }
        }

        return subTotal + shipping;
      },
      getShippingTotal: function (isCAD) {
        var shipping = 0;
        if(_items) {
          for (var i = 0; i < _items.length; i++) {
              if (_items[i].paymentTerms !== "Metered") {
                var shippingCost = (isCAD) ? _items[i].selected.shippingCAD : _items[i].selected.shippingUSD;
                shipping += shippingCost * _items[i].qty || 0;
              }
          }
        }
        return shipping;
      },
      clear: function () {
        clearItems();
        persistToStorage();
        $log.debug("Shopping cart cleared.");
      },
      getItems: function () {
        return _items;
      },
      setItems: function (items) {
        $log.debug("Setting cart items", items);
        //check if they are pointing to the same object
        if (items !== _items) {
          clearItems();
          addItems(items);
        }
        persistToStorage();
      },
      initialize: function () {
        readFromStorage().then(loadReady.resolve);
        return _items;
      },
      getItemCount: function () {
        if(_items !== null) {
          return _items.length;
        }
        else {
          return 0;
        }
      },
      removeItem: function(itemToRemove) {
        if (itemToRemove) {          
          for (var i = 0; i < _items.length; i++) {
            if (_items[i].productId === itemToRemove.productId) {
              _items.splice(i, 1);
              break;
            }
          }
          persistToStorage();
        }
      },
      adjustItemQuantity: function(itemToAdjust, qty) {
        if (itemToAdjust && $.isNumeric(qty) && qty > 0) {
          persistToStorage();
        }
      },
      addItem: function(itemToAdd, qty, pricingIndex) {

        if(!userState.isRiseVisionUser()) {return; }
        var item = this.findItem(itemToAdd);

        if (item && (itemToAdd.paymentTerms === "Subscription" || itemToAdd.paymentTerms === "Metered")) {
          return;
        }

        if (itemToAdd && $.isNumeric(qty) && itemToAdd.orderedPricing.length > pricingIndex) {
          if (item) {
            // qty for existing item is increased
            item.qty = parseInt(item.qty) + parseInt(qty);
          } else {
            // item is not already in the cart
            item = angular.copy(itemToAdd);
            item.qty = qty;
            _items.push(item);
          }
          item.selected = itemToAdd.orderedPricing[pricingIndex];
          persistToStorage();
        }
      },
      findItem: function(item) {
        //returns instance of the object from _items array

        if (item) {
          for (var i = 0; i < _items.length; i++) {
            if (item.productId === _items[i].productId) {
              return _items[i];
            }
          }
        }

        return null;
      },
      itemExists: function(item) {
        if (userState.isRiseVisionUser() && item && this.findItem(item) !== null) {
          return true;
        }
        return false;
      }
    };
    cartManager.initialize();

    return cartManager;

  }]);
})(angular);
