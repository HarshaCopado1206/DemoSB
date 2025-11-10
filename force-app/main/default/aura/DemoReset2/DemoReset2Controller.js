({
	resetDemoFunction : function(component, event, helper) {
        var action = component.get("c.resetDemoMethod");
        console.log('--- button clicked ---');

        // console.log('--- component recordId --- ' , component.get("v.recordId"));
        // action.setParams({recId: component.get("v.recordId")});
        action.setCallback(this, function(response) {
            var state = response.getState();
            var responseValue = response.getReturnValue();

            if (state === "SUCCESS") {
                // We need to toast the success or failure
                
                var toastEvent = $A.get("e.force:showToast");
                var title = (responseValue == "Success" ? "Success!" : "Error");
                var type = (responseValue == "Success" ? "success" : "error");
                var message = (responseValue == "Success" ? "The Case has been reset successfully." : responseValue);
                toastEvent.setParams({
                    "title": title,
                    "message": message,
                    "type": type
                });
                toastEvent.fire();
                
            }
            else if (state === "INCOMPLETE") {
                var toastEvent = $A.get("e.force:showToast");
                var title = (responseValue == "Success" ? "Success!" : "Error");
                var type = (responseValue == "Success" ? "success" : "error");
                var message = (responseValue == "Success" ? "incomplete" : responseValue);
                toastEvent.setParams({
                    "title": title,
                    "message": message,
                    "type": type
                });
                toastEvent.fire();
            
            }
            else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " + errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
            }
        });

        $A.enqueueAction(action);},
    
    // this function automatic call by aura:waiting event  
    showSpinner: function(component, event, helper) {
        // make Spinner attribute true for display loading spinner 
        component.set("v.Spinner", true); 
    },
    
    // this function automatic call by aura:doneWaiting event 
    hideSpinner : function(component,event,helper){
        // make Spinner attribute to false for hide loading spinner    
        component.set("v.Spinner", false);
    }
    

})