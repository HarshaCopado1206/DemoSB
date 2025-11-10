({
    handleClickGuidelineType: function (component, event, helper) {
        //debugger
        let selectedButtonLabel = event.target.dataset.name,
            buttons = document.getElementsByName('typebutton');
        buttons.forEach(e => e.classList.replace('slds-button_brand', 'slds-button_neutral'));
        component.set('v.recommendedGuidelinesType', selectedButtonLabel);
        event.target.classList.replace('slds-button_neutral', 'slds-button_brand');
        console.log(selectedButtonLabel);
    },

    handleInitData: function (component, event, helper) {
        let guidelinesList = [{
                name: 'Hip Arthroplasty'
            }],
            recGuidelinesDiagnosesList = [{
                    name: 'Hip Arthroplasty',
                    product: 'Inpatient and Surgical Care'
                },
                {
                    name: 'Hip Resurfacing',
                    product: 'Inpatient and Surgical Care'
                },
                {
                    name: 'Hip Arthroplasty',
                    product: 'Recovery Facility Care'
                },
                {
                    name: 'Inpatient Rehabilitation Facility (Acute Rehabilitation): Hip Arthroplasty',
                    product: 'Recovery Facility Care'
                },
                {
                    name: 'Hip Arthroplasty',
                    product: 'Home Care'
                }
            ],
            recGuidelinesServicesList = [{
                    name: 'Hip Arthroplasty',
                    product: 'Inpatient and Surgical Care'
                },
                {
                    name: 'Hip Arthroscopy',
                    product: 'Inpatient and Surgical Care'
                },
                {
                    name: 'Hip Resurfacing',
                    product: 'Inpatient and Surgical Care'
                },
                {
                    name: 'Hip Pain and Osteoarthritis - Referral Management',
                    product: 'Ambulatory Care'
                },
                {
                    name: 'Osteoarthritis Rehabilitation',
                    product: 'Ambulatory Care'
                }
            ];

        helper.callServerGetUserFullname(component, event, helper);
        helper.setLastModifiedDateTime(component);
        component.set('v.guidelinesList', guidelinesList);
        component.set('v.recGuidelinesDiagnosesList', recGuidelinesDiagnosesList);
        component.set('v.recGuidelinesServicesList', recGuidelinesServicesList);
        //debugger
    },

    callServerGetUserFullname: function (component, event, helper) {
        helper.callServer(
            component,
            "c.getCurrentUserFullName",
            function (response) {
                if (response) {
                    component.set("v.fullname", response);
                }
            }, {}
        );
    },

    setLastModifiedDateTime: function (component, event) {
        component.set('v.lastModifiedDate', Date.now());
    },

    callServer: function (component, method, callback, params) {
        let action = component.get(method);
        if (params) {
            action.setParams(params);
        }

        action.setCallback(this, function (response) {
            const state = response.getState();
            if (state === "SUCCESS") {
                // pass returned value to callback function
                callback.call(this, response.getReturnValue());
            } else if (state === "ERROR") {
                // generic error handler
                var errors = response.getError();
                if (errors) {
                    console.log("Errors", errors);
                    if (errors[0] && errors[0].message) {
                        throw new Error("Error" + errors[0].message);
                    }
                } else {
                    throw new Error("Unknown Error");
                }
            }
        });

        $A.enqueueAction(action);
    }
})