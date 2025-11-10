({
    handleClickGuidelineType: function (component, event, helper) {
        helper.handleClickGuidelineType(component, event, helper);
    },

    handleInit: function (component, event, helper) {
        helper.handleInitData(component, event, helper);
    },

    updateLastModifiedDate: function (component, event) {
        component.set('v.lastModifiedDate', Date.now());
    },


    openSubtab: function (component, event, helper) {
        //debugger
        let workspaceAPI = component.find("cadalysGuidelineWorkspace");
        workspaceAPI.getEnclosingTabId().then(function (enclosingTabId) {
            workspaceAPI.openSubtab({
                parentTabId: enclosingTabId,
                url: '/lightning/cmp/c__CadalysGuidelinesModal?c__caseId=' + component.get('v.recordId'),
                focus: true
            }).then(function (response) {
                workspaceAPI.setTabLabel({
                    tabId: response,
                    label: "CareIQ / Guideline"
                });
            }).catch(function (error) {
                console.log("error");
            });
        });
    },

})