({
    renderFlow : function(component, event, helper, flowAPIName) {
        let flow = component.find("flowData");
        if(flow){
            flow.destroy();                
        }
        $A.createComponent(
            "lightning:flow",
            {
                "aura:id": "flowData"
            },
            function(newFlow, status, errorMessage){
                //Add the new flow component to the body array
                if (status === "SUCCESS") {
                    component.set('v.flow', newFlow);
                    let relatedFlowAPIName = flowAPIName;
                    if(relatedFlowAPIName){
                        let flow = component.find("flowData");
                        flow.startFlow(relatedFlowAPIName);                
                    }
                }
                else if (status === "INCOMPLETE") {
                    console.log("No response from server or client is offline.")
                    // Show offline error
                }
                    else if (status === "ERROR") {
                        console.log("Error: " + errorMessage);
                        // Show error message
                    }
            }
        );
    }
})