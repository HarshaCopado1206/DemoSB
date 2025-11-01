import { LightningElement, api, track } from 'lwc';
import LightningModal from 'lightning/modal';
import getDocuments from '@salesforce/apex/ProcessPanelController.getDocuments';

export default class DocumentsModal extends LightningModal {
  @api recordId;
  @track documents = [];
  @track error;

  columns = [
    { label: 'Title', fieldName: 'title', type: 'text' },
    { label: 'File Type', fieldName: 'fileType', type: 'text' },
    {
      label: 'Download',
      type: 'url',
      fieldName: 'downloadUrl',
      typeAttributes: {
        label: { fieldName: 'title' },
        target: '_blank'
      }
    }
  ];

  connectedCallback() {
    if (this.recordId) {
      getDocuments({ recordId: this.recordId })
        .then(result => {
          this.documents = result.map(doc => ({
            ...doc,
            downloadUrl: `/sfc/servlet.shepherd/version/download/${doc.latestVersionId}`
          }));
          this.error = undefined;
          console.log('Documents loaded:', this.documents);
        })
        .catch(error => {
          this.error = error;
          this.documents = [];
          console.error('Error loading documents:', error);
        });
    }
  }

  get hasNoDocuments() {
    return !this.error && (!this.documents || this.documents.length === 0);
  }

  handleClose() {
    this.close();
  }
}