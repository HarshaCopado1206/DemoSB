import { LightningElement, api, wire, track } from 'lwc';
import LightningModal from 'lightning/modal';
import getHierarchy from '@salesforce/apex/ProcessPanelController.getHierarchy';

export default class HierarchyModal extends LightningModal {
    @api recordId;

    @track hierarchy;
    @track error;

    renderedCallback() {
        if (this.recordId && !this._hasLoaded) {
            this._hasLoaded = true;
            this.loadHierarchy();
            console.log('CustomerModal renderedCallback recordId:', this.recordId);
        }
    }

    loadHierarchy() {
        getHierarchy({ recordId: this.recordId })
            .then(result => {
                this.hierarchy = result;
                this.error = undefined;
                console.log('Hierarchy:', result);
            })
            .catch(error => {
                this.error = error;
                this.hierarchy = undefined;
                console.error('Error loading hierarchy:', error);
            });
    }

    handleClose() {
        this.close();
    }
}