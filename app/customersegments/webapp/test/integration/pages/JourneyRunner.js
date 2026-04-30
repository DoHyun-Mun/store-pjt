sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"customersegments/test/integration/pages/CustomerSegmentsList",
	"customersegments/test/integration/pages/CustomerSegmentsObjectPage"
], function (JourneyRunner, CustomerSegmentsList, CustomerSegmentsObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('customersegments') + '/test/flpSandbox.html#customersegments-tile',
        pages: {
			onTheCustomerSegmentsList: CustomerSegmentsList,
			onTheCustomerSegmentsObjectPage: CustomerSegmentsObjectPage
        },
        async: true
    });

    return runner;
});

