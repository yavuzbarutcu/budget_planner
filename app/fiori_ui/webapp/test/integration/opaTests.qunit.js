sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'cap/reply/fioriui/test/integration/FirstJourney',
		'cap/reply/fioriui/test/integration/pages/BudgetList',
		'cap/reply/fioriui/test/integration/pages/BudgetObjectPage'
    ],
    function(JourneyRunner, opaJourney, BudgetList, BudgetObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('cap/reply/fioriui') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheBudgetList: BudgetList,
					onTheBudgetObjectPage: BudgetObjectPage
                }
            },
            opaJourney.run
        );
    }
);