import { LightningElement, api, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getProcessActions from '@salesforce/apex/ProcessPanelController.getActions';
import createTask from '@salesforce/apex/ProcessPanelController.createTask';

export default class DynamicProcessPanel extends LightningElement {
    @api recordId;
    @api objectApiName;

    @track actions = [];
    @track showModal = false;
    @track currentAction = null;

    taskSubject = '';
    taskDueDate = '';

    // Fetch actions dynamically based on object and record
    @wire(getProcessActions, { objectApiName: '$objectApiName', recordId: '$recordId' })
    wiredActions({ error, data }) {
        if (data) {
            console.log('Actions fetched:', data);
            this.actions = Array.isArray(data) ? data : [];
        } else if (error) {
            console.error('Error fetching actions:', error);
            this.showToast('Error', 'Failed to load process actions.', 'error');
        }
    }

    handleActionClick(event) {
        const actionName = event.target.dataset.name;
        this.currentAction = this.actions.find(a => a.name === actionName);

        console.log('Selected Action:', this.currentAction?.name);

        // Reset task-related fields
        this.taskSubject = '';
        this.taskDueDate = '';
        this.showModal = true;
    }

    handleModalClose() {
        this.showModal = false;
        this.currentAction = null;
    }

    handleSubjectChange(event) {
        this.taskSubject = event.target.value;
    }

    handleDueDateChange(event) {
        this.taskDueDate = event.target.value;
    }

    handleCreateTask() {
        if (!this.taskSubject) {
            this.showToast('Validation Error', 'Please enter a subject.', 'warning');
            return;
        }

        createTask({
            relatedRecordId: this.recordId,
            subject: this.taskSubject,
            dueDate: this.taskDueDate
        })
        .then(() => {
            this.showToast('Success', 'Task created successfully.', 'success');
            this.handleModalClose();
        })
        .catch(error => {
            console.error('Error creating task:', error);
            this.showToast('Error', 'Failed to create task.', 'error');
        });
    }

    // Computed properties to control which modal to show
    get modalName() {
        return this.currentAction?.name?.toLowerCase();
    }

    get isCreateTask() {
        return this.modalName === 'createtask';
    }

    get showViewOrders() {
        return this.modalName === 'vieworders';
    }

    get showViewCustomer() {
        return this.modalName === 'viewcustomer';
    }

    get showViewDocuments() {
        return this.modalName === 'viewdocuments';
    }

    get showViewHierarchy() {
        return this.modalName === 'viewhierarchy';
    }

    get showViewTasks() {
        return this.modalName === 'viewtasks';
    }

    get showViewEvents() {
        return this.modalName === 'viewevents';
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }

    renderedCallback() {
        console.log('in Render call back DynamicProcessPanel recordId:', this.recordId);
    }

    connectedCallback() {
    console.log('In connected call back DynamicProcessPanel recordId:', this.recordId);
}

}