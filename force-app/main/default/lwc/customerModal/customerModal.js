import { LightningElement, api, track } from 'lwc';
import LightningModal from 'lightning/modal';
import getCustomerDetails from '@salesforce/apex/ProcessPanelController.getCustomerDetails';

export default class CustomerModal extends LightningModal {
    @api recordId;

    @track customer;
    @track error;
    _hasLoaded = false;

    renderedCallback() {
        if (this.recordId && !this._hasLoaded) {
            this._hasLoaded = true;
            this.loadCustomerDetails();
            console.log('CustomerModal renderedCallback recordId:', this.recordId);
        }
    }

    loadCustomerDetails() {
        if (!this.recordId) {
            console.warn('CustomerModal loadCustomerDetails: recordId is null or undefined');
            return;
        }

        getCustomerDetails({ accountId: this.recordId })
            .then(result => {
                this.customer = result;
                this.error = undefined;
                console.log('Customer details:', result);
            })
            .catch(error => {
                this.error = error;
                this.customer = undefined;
                console.error('Error loading customer details:', error);
            });
    }

    handleClose() {
        this.close();
    }
}