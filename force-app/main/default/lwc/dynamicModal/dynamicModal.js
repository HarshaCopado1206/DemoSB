import { LightningElement, api } from 'lwc';

export default class DynamicModal extends LightningElement {
    @api action;
    @api recordId;

    close() {
        this.dispatchEvent(new CustomEvent('close'));
    }
}