({
    retrieveAppointments : function(component, event, helper) {
        // create a one-time use instance of the serverEcho action
        // in the server-side controller
        // console.log('inside retrieveAppointments');
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
                    if(event.appointmentToday){
                        openUtiltyBar = true;
                        break;
                    }
                }
                // if(openUtiltyBar){
                //     helper.openUtilityBar(component);
                // }
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

    getUtilityId : function(component, helper) {
        var utilityAPI = component.find("utilitybar");
        utilityAPI.getAllUtilityInfo().then(function(response) {
            var myUtilityInfo = response[0];
            component.set('v.utilityId', myUtilityInfo.id);
        })
        .catch(function(error) {
            console.log(error);
        });
    },

    // openUtilityBar : function(component) {
    //     var utilityAPI = component.find("utilitybar");
    //     utilityAPI.openUtility({
    //         utilityId : component.get('v.utilityId')
    //     }).then(function(response) {
    //         console.log('utility opened!');
    //     })
    //     .catch(function(error) {
    //         console.log(error);
    //     });
    // },

    setUtilityWidth : function(component, widthPX) {
        var utilityAPI = component.find("utilitybar");
        utilityAPI.setPanelWidth({
            widthPX : widthPX,
            utilityId : component.get('v.utilityId')
        }).then(function(response) {
            // console.log('Utility width set to ' + widthPX + 'px!');
        })
        .catch(function(error) {
            console.log(error);
        });
    },

    setUtilityHeight : function(component, heightPX) {
        var utilityAPI = component.find("utilitybar");
        utilityAPI.setPanelHeight({
            heightPX : heightPX,
            utilityId : component.get('v.utilityId')
        }).then(function(response) {
            // console.log('Utility width set to ' + widthPX + 'px!');
        })
        .catch(function(error) {
            console.log(error);
        });
    },

    setUtilityIcon : function(component, icon) {
        var utilityAPI = component.find("utilitybar");
        // console.log('utility Id:', component.get('v.utilityId'));
        utilityAPI.setPanelHeaderIcon({
            icon : icon,
            utilityId : component.get('v.utilityId')
        }).then(function(response) {
            // console.log('Utility icon set to ' + icon + '!');
        })
        .catch(function(error) {
            console.log(error);
        });
    },

    setUtilityLabel : function(component, label) {
        var utilityAPI = component.find("utilitybar");
        // console.log('utility Id:', component.get('v.utilityId'));
        utilityAPI.setPanelHeaderLabel({
            label : label,
            utilityId : component.get('v.utilityId')
        }).then(function(response) {
            // console.log('Utility label set to ' + label + '!');
        })
        .catch(function(error) {
            console.log(error);
        });
    },

    setUtilityValuesForApptList : function(component, event, helper, fromEvent) {
        const appointmentNotificationCleared = component.get('v.appointmentNotificationCleared');
        if(appointmentNotificationCleared){
            helper.setUtilityWidth(component, 400);
            helper.setUtilityHeight(component, 380);
            helper.setUtilityIcon(component, 'utility:date_input');
            helper.setUtilityLabel(component, 'My Appointments');
        } else{
            if(fromEvent){
                const notificationShown = event.getParam('notificationShown');
                if(notificationShown){
                    helper.setUtilityWidth(component, 350);
                    helper.setUtilityHeight(component, 220);
                    helper.setUtilityIcon(component, 'utility:notification');
                    helper.setUtilityLabel(component, '');
                } else{
                    helper.setUtilityWidth(component, 400);
                    helper.setUtilityHeight(component, 380);
                    helper.setUtilityIcon(component, 'utility:date_input');
                    helper.setUtilityLabel(component, 'My Appointments');
                }
            } else{
                helper.setUtilityWidth(component, 400);
                helper.setUtilityHeight(component, 380);
                helper.setUtilityIcon(component, 'utility:date_input');
                helper.setUtilityLabel(component, 'My Appointments');
            }
        }
    }
})