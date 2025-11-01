import { LightningElement, api } from 'lwc';
import { updateRecord } from 'lightning/uiRecordApi';

export default class UrlParamCheckboxSetter extends LightningElement {
    @api recordId;

    fieldName;
    fieldValue;
    isUpdated = false;

    connectedCallback() {
        console.log('ConnectedCallback fired.');
        this.processUrlParameters();
    }

    processUrlParameters() {
        const currentPage = window.location.search;
        const urlParams = new URLSearchParams(currentPage);

        // Adjust for Salesforce namespace prefix
        this.fieldName = urlParams.get('c__field');
        this.fieldValue = urlParams.get('c__value');

        console.log('Field Name:', this.fieldName);
        console.log('Field Value:', this.fieldValue);

        if (this.fieldName && (this.fieldValue === 'TRUE' || this.fieldValue === 'FALSE')) {
            this.updateCheckboxField();
        } else {
            console.error('Invalid URL parameters.');
        }
    }

    updateCheckboxField() {
        const fields = {};
        fields.Id = this.recordId;
        fields[this.fieldName] = this.fieldValue === 'TRUE';

        console.log('Updating Record with fields:', fields);

        const recordInput = { fields };

        updateRecord(recordInput)
            .then(() => {
                this.isUpdated = true;
                console.log('Record updated successfully.');
            })
            .catch(error => {
                console.error('Error updating record:', error);
            });
    }
}