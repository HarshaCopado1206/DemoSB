({
	setAlphabeticalTabs : function(component) {
		component.set('v.alphabeticalTabs', ("bcdefghijklmnopqrstuvwxyz").toUpperCase().split(""));
    },
     
    setPossibleSymtoms : function(component) {
        let symptoms = [
            {
               "label": "Abdominal guarding"
            },
            {
               "label": "Abdominal pain",
               "more" : true 
            },
            {
               "label": "Abnormal foveal avascular zone"
            },
            {
               "label": "Abnormally deep, labored and gasping breathing"
            },
            {
               "label": "Abnormal or loss of taste",
               "more" : true 
            },
            {
               "label": "Abnormal vaginal discharge",
               "more" : true 
            },
            {
               "label": "Absence of deep reflexes",
               "more" : true 
            },
            {
               "label": "Absence of first menstrual period at age 16"
            },
            {
               "label": "Absence of menstrual period"
            },
            {
               "label": "Accelerated breathing"
            },
            {
               "label": "Activity related to sex despite negative consequences"
            },
            {
               "label": "Acute thigh or buttock pain appearing during exertion and relieving after short rest"
            },
            {
               "label": "Adenoid face"
            },
            {
               "label": "Agitation"
            },
            {
               "label": "Ailments occurring when reducing alcohol consumption"
            },
            {
               "label": "Allen-Cleckley sign"
            },
            {
               "label": "Anemia"
            },
            {
               "label": "Anorectal pain"
            },
            {
               "label": "Anxiety",
               "more": true
            },
            {
               "label": "Aponeurotic reflex"
            },
            {
               "label": "Appendix removal in the past"
            },
            {
               "label": "Appetite for salty foods"
            },
            {
               "label": "Apraxia",
               "more": true
            },
            {
               "label": "Ascites"
            },
            {
               "label": "Asymmetrical neck"
            },
            {
               "label": "Asymmetric pupils"
            },
            {
               "label": "Atonic bladder"
            },
            {
               "label": "Auscultative rales over the thorax"
            },
            {
               "label": "Avoiding actions, places, or people that bring back memories of trauma"
            },
            {
               "label": "Avoiding eating and drinking in public"
            },
            {
               "label": "Avoiding eating in someone's presence"
            },
            {
               "label": "Avoiding public appearances"
            },
            {
               "label": "Avoiding talking to authority figures"
            },
            {
               "label": "Avoiding thoughts, feelings, conversations related to traumatic experience"
            },
            {
               "label": "Axillary or inguinal freckle"
            } 
         ];
        component.set('v.symptomsList', symptoms);
    },

    setRiskFactors : function(component) {
        let riskfactors = [
            {
                "label": "Abdominal injury"
            },
            {
                "label": "Age < 18"
            },
            {
                "label": "Age 45-55"
            },
            {
                "label": "Age above 40"
            },
            {
                "label": "Age above 60"
            },
            {
                "label": "Animal bite"
            },
            {
                "label": "Anticoagulant use"
            },
            {
                "label": "Atherosclerosis"
            },
            {
                "label": "Atmospheric pressure changes"
            }
        ];
        component.set('v.riskFactorsList', riskfactors);
          
    },

    setSymptomsPresetLists : function(component) {
        let p1 = [
            {
                "label": "Headache, pulsating"
            }
        ];

        let p2 = [
            {
                "label": "Facial pain, paranasal sinus"
            }
        ];
        component.set('v.symptomsPresetList1', p1); 
        component.set('v.symptomsPresetList2', p2); 
    },

    goNext: function(component){
        let currentStep = component.get('v.currentStepInteger');
        currentStep += 1;
        component.set('v.currentStepInteger', currentStep);
        component.set('v.currentStepString', currentStep+'');
    },

    resetScreen: function(component){
        component.set('v.currentStepInteger', 1 );
        component.set('v.currentStepString', '1' );
        component.set('v.S1GenderInput', 'male' );
        component.set('v.S1AgeInput', '' );
        component.set('v.S1ProblemInput', '' );
        component.set('v.IsS1Submitted', false);
        document.getElementById('male').checked = true;
    }
})