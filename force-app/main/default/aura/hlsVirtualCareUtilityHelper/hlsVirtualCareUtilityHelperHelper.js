({
    retrieveAppointments : function(component, event, helper) {
        // create a one-time use instance of the serverEcho action
        // in the server-side controller
        var action = component.get("c.getAppointments");

        // Create a callback that is executed after 
        // the server-side action returns
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS" && response.getReturnValue().length) {
                // console.log('Upcoming Appointments: ' + JSON.stringify(response.getReturnValue()));
                let openUtiltyBar = false;
                for(let i = 0; i < response.getReturnValue().length; i++){
                    let event = response.getReturnValue()[i];
                    if(event.appointmentToday && !event.appointmentEnded){
                        openUtiltyBar = true;
                        break;
                    }
                }
                if(openUtiltyBar){
                    helper.openUtilityBar(component);
                }
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
    },

    openUtilityBar : function(component) {
        var utilityAPI = component.find("utilitybar");
        utilityAPI.getAllUtilityInfo().then(function(response) {
            var myUtilityInfo = response[0];
            utilityAPI.openUtility({
                utilityId: myUtilityInfo.id
            });
        })
        .catch(function(error) {
            console.log(error);
        });
    }
})