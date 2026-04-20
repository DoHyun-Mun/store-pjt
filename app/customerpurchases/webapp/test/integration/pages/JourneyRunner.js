sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"customerpurchases/test/integration/pages/CustomerPurchasesList",
	"customerpurchases/test/integration/pages/CustomerPurchasesObjectPage"
], function (JourneyRunner, CustomerPurchasesList, CustomerPurchasesObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('customerpurchases') + '/test/flpSandbox.html#customerpurchases-tile',
        pages: {
			onTheCustomerPurchasesList: CustomerPurchasesList,
			onTheCustomerPurchasesObjectPage: CustomerPurchasesObjectPage
        },
        async: true
    });

    return runner;
});

