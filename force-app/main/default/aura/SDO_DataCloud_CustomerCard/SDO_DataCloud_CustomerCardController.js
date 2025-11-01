({
    doInit : function(component, event, helper) {
        var action = component.get('c.getContact');
        var currentRecord = component.get('v.recordId');
        var segments = component.get('v.segmentNames');
        
        if(segments != null){
        	var segList = segments.split(',');
        	component.set('v.segList', segList);
        }

        action.setParams( {currentRecord : currentRecord} ); 
        action.setCallback(this, function(response){
            var state = response.getState();
            if (component.isValid() && state === "SUCCESS"){ 
                
                component.set("v.customer", response.getReturnValue());
                
            } else {
                console.log("Failed with state" + state);
            }
        })
        $A.enqueueAction(action);      
    }
})