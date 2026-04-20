sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"menus/test/integration/pages/MenuItemsList",
	"menus/test/integration/pages/MenuItemsObjectPage"
], function (JourneyRunner, MenuItemsList, MenuItemsObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('menus') + '/test/flpSandbox.html#menus-tile',
        pages: {
			onTheMenuItemsList: MenuItemsList,
			onTheMenuItemsObjectPage: MenuItemsObjectPage
        },
        async: true
    });

    return runner;
});

