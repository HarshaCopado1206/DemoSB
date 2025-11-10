({
    doInit : function(component, event, helper) {
        var action = component.get("c.getFlowNames");
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {      
                let rVal = response.getReturnValue();                
                component.set('v.allFlows', rVal);
                component.set('v.flowsToShow', rVal);
            }
            else if (state === "INCOMPLETE") {
                // do something
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            console.log("Error message: " + 
                                        errors[0].message);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });
        $A.enqueueAction(action);
    },
    searchFlows : function(component, event, helper) {
        let allFlows = component.get('v.allFlows');
        let queryTerm = component.find('flow-search').get('v.value').toLowerCase();
        let flowsToShow;
        if(queryTerm){
            flowsToShow = allFlows.filter((item) => item.Label.toLowerCase().includes(queryTerm) || item.ApiName.toLowerCase().includes(queryTerm));
        }else{
            component.set('v.selectedFlowApiName', null);
            flowsToShow = allFlows;
        }
        component.set('v.flowsToShow', flowsToShow);
    },
    onFocus : function(component,event,helper){
        var forOpen = component.find("searchRes");
        $A.util.addClass(forOpen, 'slds-is-open');
        $A.util.removeClass(forOpen, 'slds-is-close');
    },
    onBlur : function (component, event, helper) {
        window.setTimeout(
            $A.getCallback(function() {
                var forOpen = component.find("searchRes");
                $A.util.removeClass(forOpen, 'slds-is-open');
                $A.util.addClass(forOpen, 'slds-is-close');
            }), 200
        );
    },
    selectFlow : function (component, event, helper) {
        let label = event.currentTarget.title;
        let apiName = event.currentTarget.dataset.apiname;
        console.log(label, apiName);
        component.find("flow-search").set('v.value', label);
        component.set('v.selectedFlowApiName', apiName);
    },
    handleRecordUpdated: function(component, event, helper) {
        let eventParams = event.getParams();
        if(eventParams.changeType === "LOADED" || eventParams.changeType === "CHANGED") {
            //record is loaded (render other component which needs record data value)
            let relatedFlowAPIName = component.get("v.simpleRecord.Guided_Flow__c");
            let publishStatus = component.get("v.simpleRecord.PublishStatus");
            if(relatedFlowAPIName && publishStatus == 'Draft'){
            	helper.getFlowLabel(component, event, helper, relatedFlowAPIName);
            }
            //console.log("You loaded a record in " + relatedFlowAPIName);
        } else if(eventParams.changeType === "REMOVED") {
            // record is deleted
        } else if(eventParams.changeType === "ERROR") {
            console.log('error!!');
            // there’s an error while loading, saving, or deleting the record
        }
    },
    attachFlow: function(component, event, helper) {
        let selectedFlowApiName = component.get('v.selectedFlowApiName');
        if(selectedFlowApiName){
            helper.changeflow(component, event, helper, selectedFlowApiName, false);
            component.set('v.flowLabel', '');
            helper.resetForm(component);
            component.set('v.mode', 'view');
        }
    },
    onUpdateFlow : function(component, event, helper) {
        //helper.modalHelper(component, 'srModal', 'modalBkdrp', true);
    },
    onCancel : function(component, event, helper) {
        helper.resetForm(component);
        component.set('v.mode', 'view');
    },
    onDetachFlow : function(component, event, helper) {
        helper.changeflow(component, event, helper, null, true);
    },
    confirmDetachFlow: function(component, event, helper) {
        helper.modalHelper(component, 'srModal', 'modalBkdrp', true);
    },
    closeModal : function(component, event, helper) {
        helper.modalHelper(component, 'srModal', 'modalBkdrp', false);
    },
    handleEdit :  function(component, event, helper) {
        component.set('v.mode', 'edit');
    },
    refreshView : function(component, event, helper) {
        component.find('recordLoaderChild').reloadRecord(true);
    }
})