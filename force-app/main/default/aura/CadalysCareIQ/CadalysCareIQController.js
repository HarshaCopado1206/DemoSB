({
	handleInit : function(component, event, helper) {
        helper.setAlphabeticalTabs(component);
        helper.setRiskFactors(component);
        helper.setPossibleSymtoms(component);
        helper.setSymptomsPresetLists(component);
    },
    
    handleS1GenderChange : function(component, event, helper) {
		component.set('v.S1GenderInput', event.srcElement.value);
    },

    handleS1Submit: function(component, event, helper) {
		component.set('v.IsS1Submitted', true); 
    },

    clickOnBar: function(component, event, helper){
        var x = event.getSource().get('v.value');
        if(x == 1){
            component.set('v.IsS1Submitted', false);
        }
        
        component.set('v.currentStepString', x);
        component.set('v.currentStepInteger', parseInt(x));
    },

    handleNext: function(component, event, helper) {
		helper.goNext(component);
    },

    showHiddenQuestion: function(component, event, helper) {
        event.srcElement.classList.add('slds-hide');
		document.getElementById('hiddenRadioGroup').classList.remove('slds-hide');
    },

    handleRestart: function(component, event, helper) {
       helper.resetScreen(component);
    },

    handleExpandToggle: function(component, event, helper) {
       let buttonname = event.getSource().getLocalId();
       let iconname = component.find(buttonname).get('v.iconName');
       if(iconname == 'utility:chevronup'){
           component.find(buttonname).set('v.iconName','utility:chevrondown');
       }else if(iconname == 'utility:chevrondown'){
            component.find(buttonname).set('v.iconName','utility:chevronup');
       }
       document.getElementById(buttonname).classList.toggle('slds-hide');
    },
})