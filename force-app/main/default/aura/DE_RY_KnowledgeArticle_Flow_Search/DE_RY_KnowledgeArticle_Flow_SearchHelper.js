({
    modalHelper : function(component, modal, backdrop, tf) {
        var mdl = component.find(modal).getElement();
        var bkdrp = component.find(backdrop).getElement();
        if(tf){
            $A.util.addClass(mdl, 'slds-fade-in-open');
            $A.util.addClass(bkdrp, 'slds-backdrop_open');
        }else{
            $A.util.removeClass(mdl, 'slds-fade-in-open');
            $A.util.removeClass(bkdrp, 'slds-backdrop_open');
        }
    },
    showToast : function(title, message, type) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": message,
            "type": type
        });
        toastEvent.fire();
    },
    resetForm : function(component, event, helper) {
        component.find("flow-search").set('v.value', null);
        component.set('v.selectedFlowApiName', null);
        component.set('v.flowsToShow', component.get('v.allFlows'));
    },
    changeflow : function(component, event, helper, flowAPIName, isDetach){
        component.set("v.simpleRecord.Guided_Flow__c", flowAPIName);
        component.find("recordLoaderChild").saveRecord($A.getCallback(function(saveResult) {
            // use the recordUpdated event handler to handle generic logic when record is changed
            if (saveResult.state === "SUCCESS" || saveResult.state === "DRAFT") {
                let successMessage = `Flow has been ${isDetach ? 'detached' : 'attached'} successfully.`
                helper.showToast('Success!', successMessage, 'success');
                if(!flowAPIName){
                    helper.modalHelper(component, 'srModal', 'modalBkdrp', false);
                }
				$A.get('e.force:refreshView').fire();
                // handle component related logic in event handler
            } else if (saveResult.state === "INCOMPLETE") {
                console.log("User is offline, device doesn't support drafts.");
            } else if (saveResult.state === "ERROR") {
                console.log('Problem saving record, error: ' + JSON.stringify(saveResult.error));
                helper.showToast('Error!', 'Problem saving record, error: ' + JSON.stringify(saveResult.error), 'error');
            } else {
                console.log('Unknown problem, state: ' + saveResult.state + ', error: ' + JSON.stringify(saveResult.error));
            }
        }));
    },
    getFlowLabel :  function(component, event, helper, flowAPIName){
        var action = component.get("c.getFlowLabel");
        action.setParams({ flowAPIName : flowAPIName });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {      
                let rVal = response.getReturnValue();                
                component.set('v.flowLabel', rVal);
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
    }
})