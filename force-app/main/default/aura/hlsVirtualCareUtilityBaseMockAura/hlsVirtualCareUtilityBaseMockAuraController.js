({
    doInit : function(component, event, helper) {
        // console.log('doInit');
        helper.getUtilityId(component, helper);
        // helper.setUtilityBarWidth(component, 1600);
        helper.retrieveAppointments(component, event, helper);
    },

    handleNotificationShown : function(component, event, helper) {
        helper.setUtilityValuesForApptList(component, event, helper, true);
    },

    startCall : function(component, event, helper) {
        event.stopPropagation();
        const appointment = event.getParam('appointment');
        console.log('rabble ok123', JSON.stringify(appointment.meetingWithLastName));
        component.set('v.appointment', appointment);
        component.set('v.showAppointmentNotificationAndList', false);
        component.set('v.showVideoCallSettings', true);
        helper.setUtilityWidth(component, 800);
        helper.setUtilityHeight(component, 480);
        helper.setUtilityIcon(component, 'utility:video');
        helper.setUtilityLabel(component, 'Video Call');
    },

    handleCallComponentEvent : function(component, event, helper) {
        const returnToList = event.getParam("returnToList");
        if(returnToList){
            component.set('v.appointmentNotificationCleared', true);
            component.set('v.showVideoCallSettings', false);
            component.set('v.showVideoCall', false);
            component.set('v.triggerRefreshAppointments', true);
            component.set('v.triggerRefreshAppointments', false);
            helper.setUtilityValuesForApptList(component, event, helper, false);
            component.set('v.showAppointmentNotificationAndList', true);
        } else{
            component.set('v.showVideoCallSettings', false);
            helper.setUtilityWidth(component, 800);
            helper.setUtilityHeight(component, 480);
            helper.setUtilityIcon(component, 'utility:video');
            helper.setUtilityLabel(component, 'Video Call');
            component.set('v.showVideoCall', true);
        }
    }
})