trigger ReplicateFieldBeforeInsert on CustodyChainEntry (before insert) {
    Set<Id> referenceRecordIds = new Set<Id>();
    Set<Id> custodianIds = new Set<Id>();

    // Collect the Reference Record Ids from the new CustodyChainEntry records
    for (CustodyChainEntry entry : Trigger.new) {
        if (entry.ReferenceRecordId != null) {
            referenceRecordIds.add(entry.ReferenceRecordId);
        }

        if (entry.CustodianId != null) {
            custodianIds.add(entry.CustodianId);
        }
    }

    Map<Id, User> custodianIdToUserMap = new Map<Id, User>(
        [SELECT Id, Name FROM User WHERE Id IN :custodianIds]
    );

    // Query for the related records using the collected Reference Record Ids
    Map<Id, AssessmentTask> assessmentTaskRecordMap = new Map<Id, AssessmentTask>(
        [SELECT Id, Name FROM AssessmentTask WHERE Id IN :referenceRecordIds]
    );

    Map<Id, CarePgmEnrolleeWorkOrder> workOrderRecordMap = new Map<Id, CarePgmEnrolleeWorkOrder>(
        [SELECT Id, Name FROM CarePgmEnrolleeWorkOrder WHERE Id IN :referenceRecordIds]
    );

    Map<Id, CarePgmEnrolleeWkOrdStep> workOrderStepRecordMap = new Map<Id, CarePgmEnrolleeWkOrdStep>(
        [SELECT Id, Name FROM CarePgmEnrolleeWkOrdStep WHERE Id IN :referenceRecordIds]
    );

    // Update the field on CustodyChainEntry records based on the related records
    for (CustodyChainEntry entry : Trigger.new) {

        User relatedUser = custodianIdToUserMap.get(entry.CustodianId);
        if (relatedUser != null) {
            entry.Performed_by__c = relatedUser.Name;
        }

        AssessmentTask relatedRecord = assessmentTaskRecordMap.get(entry.ReferenceRecordId);
        if (relatedRecord != null) {
            entry.Custody_Chain_Event__c = relatedRecord.Name;
        }

        CarePgmEnrolleeWorkOrder relatedRecord1 = workOrderRecordMap.get(entry.ReferenceRecordId);
        if (relatedRecord1 != null) {
            entry.Custody_Chain_Event__c = relatedRecord1.Name;
        }

        CarePgmEnrolleeWkOrdStep relatedRecord2 = workOrderStepRecordMap.get(entry.ReferenceRecordId);
        if (relatedRecord2 != null) {
            entry.Custody_Chain_Event__c = relatedRecord2.Name;
        }
    }
}