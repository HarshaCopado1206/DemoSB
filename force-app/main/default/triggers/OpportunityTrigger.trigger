/*
trigger OpportunityTrigger on Opportunity (after update) {

    List<Order> ordersToInsert = new List<Order>();
    List<OrderItem> orderItemsToInsert = new List<OrderItem>();
    
    // Iterate through the updated Opportunities
    for (Opportunity opp : Trigger.new) {
        // Check if the Opportunity is Closed Won and was previously not Closed Won
        if (opp.StageName == 'Closed Won' && Trigger.oldMap.get(opp.Id).StageName != 'Closed Won') {
            // Create a new Order
            Order newOrder = new Order();
            newOrder.OpportunityId = opp.Id;
            newOrder.AccountId = opp.AccountId; 
            newOrder.Ready_for_Integration__c = true; // Custom field for integration flag
            newOrder.Status = 'Draft'; 
            newOrder.EffectiveDate = Date.today();
            ordersToInsert.add(newOrder);
        }
    }

    // Insert Orders
    if (!ordersToInsert.isEmpty()) {
        try {
            insert ordersToInsert;
        } catch (DmlException e) {
            System.debug('Failed to insert Orders: ' + e.getMessage());
            return; 
        }

        // Map to hold Order Ids vs corresponding OpportunityIds
        Map<Id, Id> orderToOpportunityMap = new Map<Id, Id>();
        for (Order order : ordersToInsert) {
            orderToOpportunityMap.put(order.Id, order.OpportunityId);
        }

        // Query Opportunity Line Items related to the Opportunities
        List<OpportunityLineItem> oppLineItems = [
            SELECT Id, Product2Id, Quantity, UnitPrice, OpportunityId
            FROM OpportunityLineItem
            WHERE OpportunityId IN :orderToOpportunityMap.values()
        ];

        // Create Order Line Items based on Opportunity Line Items
        for (OpportunityLineItem oppLineItem : oppLineItems) {
            OrderItem orderItem = new OrderItem();
            orderItem.OrderId = orderToOpportunityMap.keySet().iterator().next(); 
            orderItem.Product2Id = oppLineItem.Product2Id;
            orderItem.Quantity = oppLineItem.Quantity;
            orderItem.UnitPrice = oppLineItem.UnitPrice;
            orderItemsToInsert.add(orderItem);
        }

        // Insert Order Line Items
        if (!orderItemsToInsert.isEmpty()) {
            insert orderItemsToInsert;
        }

        // Publish Platform Event 
        List<Order_Notification__e> eventsToPublish = new List<Order_Notification__e>();
        for (Order order : ordersToInsert) {
            eventsToPublish.add(new Order_Notification__e(
                OrderId__c = order.Id,
                ReadyForIntegration__c = true
            ));
        }
        if (!eventsToPublish.isEmpty()) {
            EventBus.publish(eventsToPublish);
        }
    }
}*/

trigger OpportunityTrigger on Opportunity (after update) {
    
    List<Order> ordersToInsert = new List<Order>();
    List<OrderItem> orderItemsToInsert = new List<OrderItem>();

    // Map to associate OpportunityId -> Opportunity for later use
    Map<Id, Opportunity> closedWonOpportunities = new Map<Id, Opportunity>();

    // Identify Closed Won Opportunities
    for (Opportunity opp : Trigger.new) {
        Opportunity oldOpp = Trigger.oldMap.get(opp.Id);
        if (opp.StageName == 'Closed Won' && oldOpp.StageName != 'Closed Won') {
            if (opp.AccountId != null) {
                closedWonOpportunities.put(opp.Id, opp);
            } else {
                System.debug('Skipping Opportunity ' + opp.Id + ' due to missing AccountId.');
            }
        }
    }

    //Create Orders
    Map<Id, Id> opportunityToOrderMap = new Map<Id, Id>();
    for (Opportunity opp : closedWonOpportunities.values()) {
        Order newOrder = new Order();
        newOrder.OpportunityId = opp.Id;
        newOrder.AccountId = opp.AccountId;
        newOrder.Ready_for_Integration__c = true;
        newOrder.Status = 'Draft';
        newOrder.EffectiveDate = Date.today();
        if (opp.Pricebook2Id != null) {
            newOrder.Pricebook2Id = opp.Pricebook2Id;
        } else {            
            System.debug('Skipping Order creation for Opportunity ' + opp.Id + ' due to missing Pricebook2Id.');
            continue; // Skip this Opportunity
        }
        ordersToInsert.add(newOrder);
    }

    //Insert Orders and capture mapping
    try {
        if (!ordersToInsert.isEmpty()) {
            insert ordersToInsert;
            for (Order order : ordersToInsert) {
                opportunityToOrderMap.put(order.OpportunityId, order.Id);
            }
        }
    } catch (DmlException e) {
        System.debug('Failed to insert Orders: ' + e.getMessage());
        return;
    }

    // Query Opportunity Line Items (with Pricebook info)
    List<OpportunityLineItem> oppLineItems = new List<OpportunityLineItem>();
    if (!opportunityToOrderMap.isEmpty()) {
        oppLineItems = [
            SELECT Id, OpportunityId, Product2Id, Quantity, UnitPrice,
                   PricebookEntryId, ListPrice
            FROM OpportunityLineItem
            WHERE OpportunityId IN :opportunityToOrderMap.keySet()
        ];
    }

    //Create OrderItems based on OpportunityLineItems
    for (OpportunityLineItem oli : oppLineItems) {
        if (opportunityToOrderMap.containsKey(oli.OpportunityId)) {
            OrderItem oi = new OrderItem();
            oi.OrderId = opportunityToOrderMap.get(oli.OpportunityId);
            // Check that required fields are NOT null
            if (oli.PricebookEntryId != null && oli.ListPrice != null) {
                oi.PricebookEntryId = oli.PricebookEntryId;
                oi.Quantity = oli.Quantity;
                oi.UnitPrice = oli.UnitPrice;
                oi.ListPrice = oli.ListPrice;
                orderItemsToInsert.add(oi);
            } else {
                System.debug('Skipping OLI ' + oli.Id + ' due to missing PricebookEntryId or ListPrice.');
            }
            
            //orderItemsToInsert.add(oi);
        }
    }

    //Insert OrderItems
    try {
        if (!orderItemsToInsert.isEmpty()) {
            insert orderItemsToInsert;
        }
    } catch (DmlException e) {
        System.debug('Failed to insert OrderItems: ' + e.getMessage());
        return;
    }

    //Publish Platform Events
    try {
        List<Order_Notification__e> eventsToPublish = new List<Order_Notification__e>();
        for (Order order : ordersToInsert) {
            eventsToPublish.add(new Order_Notification__e(
                OrderId__c = order.Id,
                ReadyForIntegration__c = true
            ));
        }
        if (!eventsToPublish.isEmpty()) {
            System.debug('@@@publish platform events: ' );
            EventBus.publish(eventsToPublish);
        }
    } catch (Exception e) {
        System.debug('Failed to publish platform events: ' + e.getMessage());
    }
}