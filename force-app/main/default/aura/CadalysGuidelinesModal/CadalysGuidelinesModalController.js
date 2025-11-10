({
    closeTab: function (component, event, helper) {
        helper.doCloseTab(component, event, helper);
    },

    handleSubmit: function (component, event, helper) {

        helper.doCloseTab(component, event, helper);
        helper.showToast('Success', 'Your record has been saved.', 'success');
    },

    handleInit: function (component, event, helper) {
        helper.doInitData(component, event, helper);
    }


})