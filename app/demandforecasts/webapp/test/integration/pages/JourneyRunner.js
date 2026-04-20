sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"demandforecasts/test/integration/pages/DemandForecastsList",
	"demandforecasts/test/integration/pages/DemandForecastsObjectPage"
], function (JourneyRunner, DemandForecastsList, DemandForecastsObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('demandforecasts') + '/test/flpSandbox.html#demandforecasts-tile',
        pages: {
			onTheDemandForecastsList: DemandForecastsList,
			onTheDemandForecastsObjectPage: DemandForecastsObjectPage
        },
        async: true
    });

    return runner;
});

