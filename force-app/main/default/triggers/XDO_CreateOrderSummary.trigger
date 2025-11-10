trigger XDO_CreateOrderSummary on Order (after update) {
    
    Set<Id> orderIds = new Set<Id>();
    
    for(Order o: Trigger.New){
        Order oldOrder = Trigger.oldMap.get(o.Id);
        
        if(oldOrder.Status !=  o.Status && o.Status == 'Activated'){
            orderIds.add(o.Id);
        }
    }
    
    if(orderIds.size() > 0 ){
        XDO_CreateOrderSummaryController.createOrderSummary(orderIds);
    }
}