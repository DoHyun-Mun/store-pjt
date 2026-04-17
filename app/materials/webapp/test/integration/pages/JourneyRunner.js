sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"materials/test/integration/pages/MaterialsList",
	"materials/test/integration/pages/MaterialsObjectPage"
], function (JourneyRunner, MaterialsList, MaterialsObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('materials') + '/test/flpSandbox.html#materials-tile',
        pages: {
			onTheMaterialsList: MaterialsList,
			onTheMaterialsObjectPage: MaterialsObjectPage
        },
        async: true
    });

    return runner;
});

