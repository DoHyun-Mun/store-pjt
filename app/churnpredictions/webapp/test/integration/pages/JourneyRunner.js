sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"churnpredictions/test/integration/pages/ChurnPredictionsList",
	"churnpredictions/test/integration/pages/ChurnPredictionsObjectPage"
], function (JourneyRunner, ChurnPredictionsList, ChurnPredictionsObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('churnpredictions') + '/test/flpSandbox.html#churnpredictions-tile',
        pages: {
			onTheChurnPredictionsList: ChurnPredictionsList,
			onTheChurnPredictionsObjectPage: ChurnPredictionsObjectPage
        },
        async: true
    });

    return runner;
});

