({
    dismissNotification : function(component, event, helper) {
        component.set('v.showGuestWaitingBar', false);
        component.set('v.mainSectionClasses', 'mainSectionCallNotStarted mainSectionCallNotStartedHeightTwo');
    },

    showGuestsWaitingModal : function(component, event, helper) {
        component.set('v.showGuestsWaitingTable', true);
    },

    hideGuestsWaitingModal : function(component, event, helper) {
        console.log('hide modal!');
        component.set('v.showGuestsWaitingTable', false);
        if(!event.getParam('guestsWaiting')){
            component.set('v.callStarted', true);
            component.set('v.showGuestWaitingBar', false);
            component.set('v.mainSectionClasses', 'mainSectionCallStarted');
        }
    },

    toggleCamera : function(component, event, helper) {
        var appEvent = $A.get("e.c:xdoEnableWebcamEvent");
        if(component.get('v.cameraOn')){
            component.set('v.cameraOn', false);
            appEvent.setParams({"enableWebcam" : false});
        } else{
            component.set('v.cameraOn', true);
            appEvent.setParams({"enableWebcam" : true});
        }
         
        appEvent.fire();
    },

    toggleMicrophone : function(component, event, helper) {
        if(component.get('v.microphoneOn')){
            component.set('v.microphoneOn', false);
        } else{
            component.set('v.microphoneOn', true);
        }
    },

    leaveCall : function(component) {
        var action = component.get("c.endVideoCall");
        action.setParams({
            appointmentId : component.get("v.appointment.appointmentId")
        });

        // Create a callback that is executed after 
        // the server-side action returns
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS" && response.getReturnValue().length) {
                console.log(JSON.stringify(response.getReturnValue()));
            }
            else if (state === "INCOMPLETE") {
                // do something
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

        $A.enqueueAction(action);

        let customEvent = component.getEvent("xDOVideoCallComponentEvent");
        customEvent.setParams(
            {
                "returnToList" : true
            }
        );
        customEvent.fire();
    }
})