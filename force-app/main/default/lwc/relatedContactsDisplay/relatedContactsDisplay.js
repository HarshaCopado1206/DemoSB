import { LightningElement, api, wire } from 'lwc';
import getIndirectContacts from '@salesforce/apex/ContactController.getIndirectContacts';

export default class RelatedContactsDisplay extends LightningElement {
    @api recordId; // Account Id
    @api itemLimit = 5;
    @api sortBy = 'name'; // or 'frequency'

    displayedContacts = [];

    @wire(getIndirectContacts, { accountId: '$recordId', sortBy: '$sortBy', limitCount: '$itemLimit' })
    wiredContacts({ error, data }) {
        if (data) {
            console.log('Data from Apex:', data);
            this.displayedContacts = data;
        } else if (error) {
            console.error('Error fetching related contacts', error);
        }
    }
}