({
	doInit : function(component, event, helper) {
		var action = component.get('c.setMessageRead'); 
        // method name i.e. getEntity should be same as defined in apex class
        // params name i.e. entityType should be same as defined in getEntity method
        action.setParams({
            "messageID" : component.get('v.recordId') 
        });
        action.setCallback(this, function(a){
            var state = a.getState(); // get the response state
            if(state == 'SUCCESS') {
                //$A.get('e.force:refreshView').fire();
                
            }else{
                console.log('Error: ' + state);
            }
        });
        $A.enqueueAction(action);
	}
})