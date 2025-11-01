/*
import { LightningElement } from 'lwc';

export default class Bedrockmap extends LightningElement {
    // Coordinates for The Landmark @ One Market, Suite 300, San Francisco, CA
    center = {
        location: {
            Latitude: 37.7946,
            Longitude: -122.3964
        }
    };

    // Marker for Bedrock headquarters location
    markers = [
        {
            location: {
                Latitude: 37.7946,  // Same Latitude as center
                Longitude: -122.3964 // Same Longitude as center
            },
            title: 'Bedrock Corporate Headquarters',
            description: 'The Landmark @ One Market, Suite 300, San Francisco, CA 94105',
            icon: 'standard:account'
        }
    ];
}

import { LightningElement } from 'lwc';

export default class BedrockHeadquartersMap extends LightningElement {
    // Coordinates of The Landmark @ One Market
    center = {
        location: {
            Latitude: 37.7946,
            Longitude: -122.3964
        }
    };

    mapMarkers = [
        {
            location: {
                Latitude: 37.7946,
                Longitude: -122.3964
            },
            title: 'Bedrock HQ',
            description: 'The Landmark @ One Market, Suite 300, San Francisco, CA 94105',
            icon: 'standard:company'
        }
    ];
}
*/
import { LightningElement, wire } from 'lwc';
import getOfficeLocations from '@salesforce/apex/OfficeLocationController.getOfficeLocations';

export default class BedrockHeadquartersMap extends LightningElement {
    mapMarkers = [];
    center;

    @wire(getOfficeLocations)
    wiredLocations({ error, data }) {
        if (data) {
            this.mapMarkers = data.map(loc => ({
                location: {
                    Latitude: loc.Latitude__c,
                    Longitude: loc.Longitude__c
                },
                title: loc.Title__c,
                description: loc.Description__c,
                icon: loc.Icon_Name__c || 'standard:company'
            }));
            this.center = this.mapMarkers[0]?.location;
        } else if (error) {
            console.error('Error loading office locations', error);
        }
    }
}