sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'budgetplanner/test/integration/FirstJourney',
		'budgetplanner/test/integration/pages/BudgetList',
		'budgetplanner/test/integration/pages/BudgetObjectPage'
    ],
    function(JourneyRunner, opaJourney, BudgetList, BudgetObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('budgetplanner') + '/index.html'
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