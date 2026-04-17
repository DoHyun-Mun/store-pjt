sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"supplyorders/test/integration/pages/SupplyOrdersList",
	"supplyorders/test/integration/pages/SupplyOrdersObjectPage"
], function (JourneyRunner, SupplyOrdersList, SupplyOrdersObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('supplyorders') + '/test/flpSandbox.html#supplyorders-tile',
        pages: {
			onTheSupplyOrdersList: SupplyOrdersList,
			onTheSupplyOrdersObjectPage: SupplyOrdersObjectPage
        },
        async: true
    });

    return runner;
});

