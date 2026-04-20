sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"inventorysnapshots/test/integration/pages/InventorySnapshotsList",
	"inventorysnapshots/test/integration/pages/InventorySnapshotsObjectPage"
], function (JourneyRunner, InventorySnapshotsList, InventorySnapshotsObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('inventorysnapshots') + '/test/flpSandbox.html#inventorysnapshots-tile',
        pages: {
			onTheInventorySnapshotsList: InventorySnapshotsList,
			onTheInventorySnapshotsObjectPage: InventorySnapshotsObjectPage
        },
        async: true
    });

    return runner;
});

