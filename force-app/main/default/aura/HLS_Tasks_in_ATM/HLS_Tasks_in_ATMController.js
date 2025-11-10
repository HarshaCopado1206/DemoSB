({
    init : function(cmp, event, helper) {
        var navService = cmp.find("navService");
        var pageReference = {
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'standard-ScheduleAppointments',
                
            }
        };
        cmp.set("v.pageReference", pageReference);
        navService.navigate(pageReference);
    }
})