public with sharing class OfficeLocationController {
    @AuraEnabled(cacheable=true)
    public static List<Office_Location__mdt> getOfficeLocations() {
        return [SELECT Title__c, Description__c, Latitude__c, Longitude__c, Name__c FROM Office_Location__mdt];
    }
}