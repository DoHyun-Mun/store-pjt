sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"salesanomalies/test/integration/pages/SalesAnomaliesList",
	"salesanomalies/test/integration/pages/SalesAnomaliesObjectPage"
], function (JourneyRunner, SalesAnomaliesList, SalesAnomaliesObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('salesanomalies') + '/test/flpSandbox.html#salesanomalies-tile',
        pages: {
			onTheSalesAnomaliesList: SalesAnomaliesList,
			onTheSalesAnomaliesObjectPage: SalesAnomaliesObjectPage
        },
        async: true
    });

    return runner;
});

