sap.ui.define([
    "sap/m/MessageToast"
], function(MessageToast) {
    'use strict';

    return {
        newChildBudget: function(oEvent) {
            MessageToast.show("Custom handler invoked.");
        }
    };
});
