public with sharing class ProcessPanelController {
    @AuraEnabled(cacheable=true)
    public static List<ActionWrapper> getActions(String objectApiName, Id recordId) {
        
        system.debug('in Geta ctions method-->'+objectApiName + 'Record Id@@@-->'+recordId);
        // Read Custom Metadata
        List<Process_Action__mdt> configs = [
            SELECT Action_Name__c, Label__c, Description__c, Modal_Component_Name__c,Object_API_Name__c  
            FROM Process_Action__mdt 
            WHERE Object_API_Name__c = :objectApiName AND IsActive__c = true
        ];

        List<ActionWrapper> actions = new List<ActionWrapper>();

        for (Process_Action__mdt cfg : configs) {
            actions.add(new ActionWrapper(
                cfg.Label__c,
                cfg.Action_Name__c != null ? cfg.Action_Name__c.toLowerCase() : null,
                cfg.Object_API_Name__c,
                cfg.Description__c,
                cfg.Modal_Component_Name__c
            ));
        }
        return actions;
    }
    
    // Create Task
    @AuraEnabled
    public static Id createTask(Id relatedRecordId, String subject, Date dueDate) {
        system.debug('in create task apex'+relatedRecordId + 'subject @@'+ subject);
        Task t = new Task(
            WhatId = relatedRecordId,
            Subject = subject,
            ActivityDate = dueDate
        );
        insert t;
        return t.Id;
    }
    
    // Get related Documents (ContentDocumentLink + ContentDocument)
    @AuraEnabled(cacheable=true)
    public static List<DocumentWrapper> getDocuments(Id recordId) {
        system.debug('getDocuments-->recordId @@'+ recordId);
        List<DocumentWrapper> docs = new List<DocumentWrapper>();

        for(ContentDocumentLink cdl : [
            SELECT ContentDocument.Id, ContentDocument.Title, ContentDocument.FileType, ContentDocument.LatestPublishedVersionId
            FROM ContentDocumentLink
            WHERE LinkedEntityId = :recordId
        ]) {
            docs.add(new DocumentWrapper(
                cdl.ContentDocument.Id,
                cdl.ContentDocument.Title,
                cdl.ContentDocument.FileType,
                cdl.ContentDocument.LatestPublishedVersionId
            ));
        }
        system.debug('docs-->docs @@'+ docs);
        system.debug('docs-->docssize @@'+ docs.size());
        return docs;
    }

    // Get Customer Details (Example for Account)
    @AuraEnabled(cacheable=true)
    public static Account getCustomerDetails(Id accountId) {
        system.debug('getCustomerDetails-->accountId @@'+ accountId);
        return [SELECT Id, Name, Phone, Industry, BillingCity FROM Account WHERE Id = :accountId LIMIT 1];
    }

    // Get Hierarchy (Example for Account parent and children)
    @AuraEnabled(cacheable=true)
    public static HierarchyWrapper getHierarchy(Id recordId) {
        system.debug('getHierarchy-->recordId @@'+ recordId);
        Account root = [SELECT Id, Name, ParentId FROM Account WHERE Id = :recordId LIMIT 1];
        List<Account> children = [SELECT Id, Name, ParentId FROM Account WHERE ParentId = :recordId];

        List<HierarchyWrapper> childWrappers = new List<HierarchyWrapper>();
        for(Account child : children) {
            childWrappers.add(new HierarchyWrapper(child.Id, child.Name, new List<HierarchyWrapper>()));
        }

        return new HierarchyWrapper(root.Id, root.Name, childWrappers);
    }
    
    // Get Orders related to Account
    @AuraEnabled(cacheable=true)
    public static List<Order> getOrders(Id recordId) {
        system.debug('getOrders-->recordId @@'+ recordId);
        // Get the AccountId related to the Opportunity
        Opportunity opp = [SELECT Id, AccountId FROM Opportunity WHERE Id = :recordId LIMIT 1];
        
        if (opp.AccountId == null) {
            return new List<Order>(); 
        }
        
        // Fetch Orders related to the Account
        return [
            SELECT Id, OrderNumber, Status, EffectiveDate,Account.Name, TotalAmount
            FROM Order
            WHERE AccountId = :opp.AccountId
            ORDER BY EffectiveDate DESC
        ];
    }


    // Get Tasks related to record
    @AuraEnabled(cacheable=true)
    public static List<Task> getTasks(Id relatedRecordId) {
        system.debug('getTasks-->relatedRecordId @@'+ relatedRecordId);
        return [SELECT Id, Subject, Status, ActivityDate FROM Task WHERE WhatId = :relatedRecordId];
    }
    
    // Get Events related to record
    @AuraEnabled(cacheable=true)
    public static List<Event> getEvents(Id relatedRecordId) {
        system.debug('getEvents-->relatedRecordId @@'+ relatedRecordId);
        return [SELECT Id, Subject, StartDateTime, EndDateTime FROM Event WHERE WhatId = :relatedRecordId];
    }


    public class ActionWrapper {
        @AuraEnabled public String label;
        @AuraEnabled public String name;
        @AuraEnabled public String objectApiName;
        @AuraEnabled public String description;
        @AuraEnabled public String modalComponentName;

        public ActionWrapper(String label, String name, String objectApiName, String description, String modalComponentName) {
            this.label = label;
            this.name = name;
            this.objectApiName = objectApiName;
            this.description = description;
            this.modalComponentName = modalComponentName;
        }
    }

    public class DocumentWrapper {
        @AuraEnabled public Id docId;
        @AuraEnabled public String title;
        @AuraEnabled public String fileType;
        @AuraEnabled public Id latestVersionId;

        public DocumentWrapper(Id docId, String title, String fileType, Id latestVersionId) {
            this.docId = docId;
            this.title = title;
            this.fileType = fileType;
            this.latestVersionId = latestVersionId;
        }
    }

    public class HierarchyWrapper {
        @AuraEnabled public Id id;
        @AuraEnabled public String name;
        @AuraEnabled public List<HierarchyWrapper> children;

        public HierarchyWrapper(Id id, String name, List<HierarchyWrapper> children) {
            this.id = id;
            this.name = name;
            this.children = children;
        }
    }
}