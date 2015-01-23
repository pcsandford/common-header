(function (angular) {
  "use strict";

  angular.module("risevision.common.shoppingcart", ["risevision.common.userstate"])

  .factory("shoppingCart", ["rvStorage", "$log", "$q", "userState",
    function (rvStorage, $log, $q, userState){
    var _items = [];

    var readFromStorage = function() {
      var storedCartContents = rvStorage.getItem("rvStore_OrderProducts");
      $log.debug("read storedCartContents", storedCartContents);
      if (storedCartContents) {
        var res = JSON.parse(storedCartContents);
        if (res && res.items) {
          while(_items.length > 0) { _items.pop(); } //clear all items
          for (var i = 0; i < res.items.length; i++) {
            _items.push(res.items[i]);
          }
          $log.debug(_items.length, "items pushed to cart.");
        }
      }
    };

    var persistToStorage = function() {
      rvStorage.setItem("rvStore_OrderProducts",
        JSON.stringify({items: _items}));
      var storedCartContents = rvStorage.getItem("rvStore_OrderProducts");
      $log.debug("written storedCartContents", storedCartContents);
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
        while(_items.length > 0) { _items.pop(); } //clear all items
        persistToStorage();
        $log.debug("Shopping cart cleared.");
      },
      destroy: function () {
        this.clear();
        persistToStorage();
        return _items;
      },
      getItems: function () {
        return _items;
      },
      setItems: function (items) {
        $log.debug("Setting cart items", items);
        while(_items.length > 0) { _items.pop(); } //clear all items
        for (var i = 0; i < items.length; i++) {
          _items.push(items[i]);
        }
        persistToStorage();
      },
      initialize: function () {
        readFromStorage();
        loadReady.resolve();
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
