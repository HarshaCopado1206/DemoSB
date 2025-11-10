({
    onInit : function(component, event, helper) {
        const videoPanelSizeValues = [
            {
                apiName: 'medium',
                label: 'Medium (66% of the screen size)'
            },
            {
                apiName: 'small',
                label: 'Small (33% of the screen size)'
            },
            {
                apiName: 'large',
                label: 'Large (100% of the screen size)'
            }
        ];

        const microphoneValues = [
            {
                apiName: 'internalMic',
                label: 'Internal Microphone (Built-In)'
            },
            {
                apiName: 'wh1000xm4Mic',
                label: 'Sony (WH-1000XM4)'
            }
        ];

        const speakerValues = [
            {
                apiName: 'internalSpeaker',
                label: 'Internal Speakers (Built-In)'
            },
            {
                apiName: 'wh10Hr000000g5BJ',
                label: 'Sony (WH-1000XM4)'
            }
        ];

        const cameraValues = [
            {
                apiName: 'internalWebcam',
                label: 'Internal Webcam (Built-In)'
            },
            {
                apiName: 'logitechWebcam',
                label: 'Logitech (LT-5560Q)'
            }
        ];

        component.set('v.videoPanelSizeValues', videoPanelSizeValues);
        component.set('v.microphoneValues', microphoneValues);
        component.set('v.speakerValues', speakerValues);
        component.set('v.cameraValues', cameraValues);
    },

    startCall : function(component, event) {
        let customEvent = component.getEvent("xDOVideoCallComponentEvent");
        customEvent.setParams(
            {
                "returnToList" : false
            }
        );
        customEvent.fire();
    },

    cancelCall : function(component, event) {
        let customEvent = component.getEvent("xDOVideoCallComponentEvent");
        customEvent.setParams(
            {
                "returnToList" : true
            }
        );
        customEvent.fire();
    }
})