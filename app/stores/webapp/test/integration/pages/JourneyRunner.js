sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"stores/test/integration/pages/StoresList",
	"stores/test/integration/pages/StoresObjectPage"
], function (JourneyRunner, StoresList, StoresObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('stores') + '/test/flpSandbox.html#stores-tile',
        pages: {
			onTheStoresList: StoresList,
			onTheStoresObjectPage: StoresObjectPage
        },
        async: true
    });

    return runner;
});

