sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'cap.reply.fioriui',
            componentId: 'BudgetObjectPage',
            contextPath: '/Budget/childBudgets'
        },
        CustomPageDefinitions
    );
});