public with sharing class HLS_ContactController {
    public String departmentUrl { get; set; }

    public HLS_ContactController(ApexPages.StandardController controller) {
        // Query the Contact record by External_ID__c
        Contact contactRecord = [SELECT Department 
                                 FROM Contact 
                                 WHERE External_ID__c = 'Contact.001'
                                 LIMIT 1];
        
        // Prepend 'https://' to the Department value if it exists
        if (contactRecord != null && contactRecord.Department != null) {
            departmentUrl = 'https://' + contactRecord.Department;
        } else {
            departmentUrl = 'https://'; // Default to prevent broken URLs
        }
    }
}