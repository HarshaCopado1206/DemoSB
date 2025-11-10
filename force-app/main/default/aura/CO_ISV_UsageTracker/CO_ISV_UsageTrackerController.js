({
	doInit : function(component, event, helper) {
		let action = component.get("c.checkAndsendUsageEmail");
        action.setParams({
            isTest: false
        });
        $A.enqueueAction(action);
	}
})