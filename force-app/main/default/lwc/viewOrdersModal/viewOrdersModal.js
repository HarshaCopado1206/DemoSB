import { LightningElement, api } from 'lwc';
import LightningModal from 'lightning/modal';
import getOrders from '@salesforce/apex/ProcessPanelController.getOrders';

export default class ViewOrdersModal extends LightningModal {
    @api recordId;
    orders = [];
    error;

    columns = [
        { label: 'Order Number', fieldName: 'OrderNumber', type: 'text' },
        { label: 'Status', fieldName: 'Status', type: 'text' },
        { label: 'Effective Date', fieldName: 'EffectiveDate', type: 'date' },
        { label: 'Account Name', fieldName: 'AccountName', type: 'text' },
        { label: 'Total Amount', fieldName: 'TotalAmount', type: 'currency' }
    ];


    connectedCallback() {
        console.log('ViewOrdersModal received recordId:', this.recordId);

        if (this.recordId) {
            this.loadOrders();
        } else {
            console.warn('recordId not available in modal at connectedCallback');
        }
    }

    loadOrders() {
        getOrders({ recordId: this.recordId })
            .then((data) => {
                //this.orders = data;
                this.orders = data.map(order => ({
                ...order,
                AccountName: order.Account ? order.Account.Name : ''
                }));
                this.error = undefined;
                console.log('Orders fetched:', data);
            })
            .catch((error) => {
                this.error = error;
                this.orders = [];
                console.error('Error fetching orders:', error);
            });
    }

    handleClose() {
        this.close();
    }
}