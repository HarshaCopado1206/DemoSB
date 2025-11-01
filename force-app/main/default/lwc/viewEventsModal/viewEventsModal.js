import { api, track } from 'lwc';
import LightningModal from 'lightning/modal';
import getEvents from '@salesforce/apex/ProcessPanelController.getEvents';

export default class ViewEventsModal extends LightningModal {
    @api recordId;

    @track events = [];
    @track error;

    columns = [
        { label: 'Subject', fieldName: 'Subject', type: 'text' },
        { label: 'Start Date/Time', fieldName: 'StartDateTime', type: 'datetime' },
        { label: 'End Date/Time', fieldName: 'EndDateTime', type: 'datetime' }
    ];

    connectedCallback() {
        console.log('ViewEventsModal connectedCallback recordId:', this.recordId);
        if (this.recordId) {
            getEvents({ relatedRecordId: this.recordId })
                .then(result => {
                    this.events = result;
                    this.error = undefined;
                    console.log('Events:', result);
                })
                .catch(error => {
                    this.error = error?.body?.message || error;
                    this.events = [];
                    console.error('Error loading events:', error);
                });
        }
    }

    get hasNoEvents() {
        return !this.error && (!this.events || this.events.length === 0);
    }

    handleClose() {
        this.close();
    }
}