sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"suppliers/test/integration/pages/SuppliersList",
	"suppliers/test/integration/pages/SuppliersObjectPage"
], function (JourneyRunner, SuppliersList, SuppliersObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('suppliers') + '/test/flpSandbox.html#suppliers-tile',
        pages: {
			onTheSuppliersList: SuppliersList,
			onTheSuppliersObjectPage: SuppliersObjectPage
        },
        async: true
    });

    return runner;
});

