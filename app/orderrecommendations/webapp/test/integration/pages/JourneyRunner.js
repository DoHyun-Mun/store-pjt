sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"orderrecommendations/test/integration/pages/OrderRecommendationsList",
	"orderrecommendations/test/integration/pages/OrderRecommendationsObjectPage"
], function (JourneyRunner, OrderRecommendationsList, OrderRecommendationsObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('orderrecommendations') + '/test/flpSandbox.html#orderrecommendations-tile',
        pages: {
			onTheOrderRecommendationsList: OrderRecommendationsList,
			onTheOrderRecommendationsObjectPage: OrderRecommendationsObjectPage
        },
        async: true
    });

    return runner;
});

