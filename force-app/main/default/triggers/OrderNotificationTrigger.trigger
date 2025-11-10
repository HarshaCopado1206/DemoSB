trigger OrderNotificationTrigger on Order_Notification__e (after insert) {
    for (Order_Notification__e event : Trigger.New) {
        System.debug('Order Event Received: ' + event.OrderId__c);
    }
}