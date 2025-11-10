({
    doInit : function(component, event, helper) {
        var action = component.get("c.getIsCommunity");
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {      
                component.set('v.isCommunity', response.getReturnValue());
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
    handleRecordUpdated: function(component, event, helper) {
        let eventParams = event.getParams();
        if(eventParams.changeType === "LOADED" || eventParams.changeType === "CHANGED") {
            //record is loaded (render other component which needs record data value)
            helper.renderFlow(component, event, helper, component.get("v.simpleRecord.Guided_Flow__c"));
        } else if(eventParams.changeType === "CHANGEDaaa") {
			alert('changed');
            // record is changed
        } else if(eventParams.changeType === "REMOVED") {
            // record is deleted
        } else if(eventParams.changeType === "ERROR") {
            console.log('error!!');
            // there’s an error while loading, saving, or deleting the record
        }
    },
    onAttachFlow : function(component, event, helper) {
        let flowSearch = component.find('flowSearch');
        if(flowSearch){
            flowSearch.updateFlow();
        }
    },
    onDetachFlow : function(component, event, helper) {
        let flowSearch = component.find('flowSearch');
        if(flowSearch){
            flowSearch.detachFlow();
        }
    },
    onFlowChange : function(component, event, helper) {
        let flowAPIName = event.getParam("value") ? event.getParam("value") : component.get("v.simpleRecord.Guided_Flow__c");
        helper.renderFlow(component, event, helper, flowAPIName);
    }
})