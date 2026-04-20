sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"dailysales/test/integration/pages/DailySalesList",
	"dailysales/test/integration/pages/DailySalesObjectPage"
], function (JourneyRunner, DailySalesList, DailySalesObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('dailysales') + '/test/flpSandbox.html#dailysales-tile',
        pages: {
			onTheDailySalesList: DailySalesList,
			onTheDailySalesObjectPage: DailySalesObjectPage
        },
        async: true
    });

    return runner;
});

