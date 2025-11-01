({

    doCloseTab: function (component, event, helper) {
        var workspaceAPI = component.find("guidelineWorkspace");
        workspaceAPI.getFocusedTabInfo().then(function (response) {
                var focusedTabId = response.tabId;
                workspaceAPI.closeTab({
                    tabId: focusedTabId
                });
            })
            .catch(function (error) {
                console.log(error);
            });
    },

    showToast: function (title, message, type) {
        let toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": message,
            "type": type,
            "mode": 'dismissible'
        });
        toastEvent.fire();
        //$A.get('e.force:refreshView').fire();  

    },

    doInitData: function (component, event, helper) {
        let group1 = [{
            label: 'Presence of significant radiographic findings (eg, hip joint destruction, severe narrowing, bone deformities, osteonecrosis)'
        }, {
            label: 'Optimal medical management has been tried and failed (eg, analgesics, NSAIDs, physical therapy)'
        }, {
            label: 'Patient has failed or is not candidate for more conservative measures (eg, osteotomy, hemiarthroplasty).'
        }];

        let group2 = [{
            label: 'Disabling pain'
        }, {
            label: 'Functional disability'
        }];

        let group3 = [{
                label: 'Primary or secondary tumors involving proximal femur',
                link: '(10)'
            }, {
                label: 'Osteonecrosis of femoral head',
                link: '(11)'
            }, {
                label: 'Developmental dysplasia of hip',
                link: '(12)'
            },
            {
                label: 'Chronic dislocation of hip',
                link: '(13)'
            }, {
                label: 'Displaced fracture of femoral neck',
                link: '[A](14)(15)'
            }, {
                label: 'Acetabular fracture',
                link: '(16)'
            }
        ];

        let group4 = [{
                label: 'Ipsilateral hip osteoarthritis'
            }, {
                label: 'Ipsilateral avascular necrosis of the femoral head'
            }, {
                label: 'Inflammatory arthritis'
            },
            {
                label: 'Comminuted, significantly displaced, or unstable fracture'
            }, {
                label: 'Poor bone quality (eg, thin cortices, wide intramedullary canal on imaging)'
            }, {
                label: 'Complication of internal fixation'
            }, {
                label: 'Neglected fracture'
            }
        ];

        let group5 = [{
            label: 'Failed previous hip fracture fixation',
            link: '(18)(19)(20)'
        }, {
            label: 'Revision of hip arthrodesis',
            link: '(21)'
        }];

        let group6 = [{
            label: 'Instability of one or both components'
        }, {
            label: 'Fracture or mechanical failure of implant'
        }, {
            label: 'Recurrent or irreducible dislocation'
        }, {
            label: 'Infection',
            link: '[B](25)(26)'
        }, {
            label: 'Treatment of periprosthetic fracture',
            link: '(27)'
        }, {
            label: 'Tissue or systemic reaction to metal implant',
            link: '(28)(29)'
        }, {
            label: 'Leg-length inequality'
        }];

        component.set('v.checkboxGroup1List', group1);
        component.set('v.checkboxGroup2List', group2);
        component.set('v.checkboxGroup3List', group3);
        component.set('v.checkboxGroup4List', group4);
        component.set('v.checkboxGroup5List', group5);
        component.set('v.checkboxGroup6List', group6);

    }
})