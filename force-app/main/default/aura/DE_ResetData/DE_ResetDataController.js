({
    doInit : function(component, event, helper) {
        
        var recId=component.get('v.recordId');
        console.log(recId);
        var action =component.get('c.resetTheData');
        action.setParams({
            "accId":recId 
        });
        action.setCallback(this, function(response){
            console.log(response.getState());
            if(response.getState()=='SUCCESS'){
               component.set('v.result', 'Data Reset');
            } else{
               component.set('v.result', 'No Data available to Reset');
            } 
        });
        
        $A.enqueueAction(action);
        
        
    }
})