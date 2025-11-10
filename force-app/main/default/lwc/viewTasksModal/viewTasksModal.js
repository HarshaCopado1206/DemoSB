import { LightningElement, api, track } from 'lwc';
import LightningModal from 'lightning/modal';
import getTasks from '@salesforce/apex/ProcessPanelController.getTasks';

export default class ViewTasksModal extends LightningModal {
  @api recordId;

  @track tasks = [];
  @track error;

  columns = [
    { label: 'Subject', fieldName: 'Subject', type: 'text' },
    { label: 'Status', fieldName: 'Status', type: 'text' },
    { label: 'Due Date', fieldName: 'ActivityDate', type: 'date' }
  ];

  connectedCallback() {
    console.log('ViewTasksModal connectedCallback recordId:', this.recordId);
    if (this.recordId) {
      getTasks({ relatedRecordId: this.recordId })
        .then(result => {
          this.tasks = result;
          this.error = undefined;
          console.log('Tasks:', result);
        })
        .catch(error => {
          this.error = error?.body?.message || error;
          this.tasks = [];
          console.error('Error loading tasks:', error);
        });
    }
  }

  get hasNoTasks() {
    return !this.error && (!this.tasks || this.tasks.length === 0);
  }

  handleClose() {
    this.close();
  }
}