sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"storeproducts/test/integration/pages/StoreProductsList",
	"storeproducts/test/integration/pages/StoreProductsObjectPage"
], function (JourneyRunner, StoreProductsList, StoreProductsObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('storeproducts') + '/test/flpSandbox.html#storeproducts-tile',
        pages: {
			onTheStoreProductsList: StoreProductsList,
			onTheStoreProductsObjectPage: StoreProductsObjectPage
        },
        async: true
    });

    return runner;
});

