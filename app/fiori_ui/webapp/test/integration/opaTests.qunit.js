sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'cap/reply/fioriui/test/integration/FirstJourney',
		'cap/reply/fioriui/test/integration/pages/BudgetMain'
    ],
    function(JourneyRunner, opaJourney, BudgetMain) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('cap/reply/fioriui') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheBudgetMain: BudgetMain
                }
            },
            opaJourney.run
        );
    }
);