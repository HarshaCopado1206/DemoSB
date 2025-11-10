/*
public with sharing class ContactController {
    @AuraEnabled(cacheable=true)
    public static List<ContactWrapper> getIndirectContacts(Id accountId, String sortBy, Integer limitCount) {
        System.debug('✅ getIndirectContacts called with: ' + accountId);

        List<ContactWrapper> results = new List<ContactWrapper>();
        List<Contact> contacts = [SELECT Id, Name, Email FROM Contact WHERE AccountId = :accountId LIMIT :limitCount];

        System.debug('✅ Contacts found: ' + contacts.size());

        for (Contact c : contacts) {
            ContactWrapper cw = new ContactWrapper();
            cw.Id = c.Id;
            cw.Name = c.Name;
            cw.Email = c.Email;
            cw.RelatedAccountCount = 1;
            results.add(cw);
        }

        return results;
    }

    public class ContactWrapper {
        @AuraEnabled public Id Id;
        @AuraEnabled public String Name;
        @AuraEnabled public String Email;
        @AuraEnabled public Integer RelatedAccountCount;
    }
}
*/

public with sharing class ContactController {

    @AuraEnabled(cacheable=true)
    public static List<ContactWrapper> getIndirectContacts(Id accountId, String sortBy, Integer limitCount) {
        System.debug('getIndirectContacts called with: ' + accountId);

        if (accountId == null) {
            return new List<ContactWrapper>();
        }

        // Step 1: Get AccountContactRelations for the current Account
        List<AccountContactRelation> acrList = [
            SELECT Contact.Id, Contact.Name, Contact.Email
            FROM AccountContactRelation
            WHERE AccountId = :accountId
        ];

        System.debug('AccountContactRelations found: ' + acrList.size());

        // Step 2: Collect Contact Ids from the AccountContactRelations for current Account
        Set<Id> contactIds = new Set<Id>();
        for (AccountContactRelation acr : acrList) {
            if (acr.ContactId != null) {
                contactIds.add(acr.ContactId);
            }
        }

        if (contactIds.isEmpty()) {
            return new List<ContactWrapper>();
        }

        // Step 3: Get counts of related accounts for these contacts in bulk (aggregate query)
        // Map<ContactId, countOfAccounts>
        Map<Id, Integer> contactToAccountCount = new Map<Id, Integer>();
        for (AggregateResult ar : [
            SELECT ContactId, COUNT_DISTINCT(AccountId) countAcc
            FROM AccountContactRelation
            WHERE ContactId IN :contactIds
            GROUP BY ContactId
        ]) {
            contactToAccountCount.put(
                (Id)ar.get('ContactId'),
                (Integer)ar.get('countAcc')
            );
        }

        // Step 4: Build ContactWrapper list with counts
        Map<Id, ContactWrapper> contactMap = new Map<Id, ContactWrapper>();

        for (AccountContactRelation acr : acrList) {
            Contact c = acr.Contact;
            if (c == null) continue;

            if (!contactMap.containsKey(c.Id)) {
                ContactWrapper cw = new ContactWrapper();
                cw.Id = c.Id;
                cw.Name = c.Name;
                cw.Email = c.Email;
                cw.RelatedAccountCount = contactToAccountCount.containsKey(c.Id) ? contactToAccountCount.get(c.Id) : 1;
                contactMap.put(c.Id, cw);
            }
        }

        List<ContactWrapper> results = new List<ContactWrapper>(contactMap.values());

        // Step 5: Sort results manually (no lambdas)
        sortContactWrappers(results, sortBy);

        // Step 6: Apply limitCount if specified and less than list size
        List<ContactWrapper> limitedResults = new List<ContactWrapper>();
        for (Integer i = 0; i < limitCount && i < results.size(); i++) {
            limitedResults.add(results[i]);
        }
        results = limitedResults;

        return results;
    }

    // Custom sort method to sort list based on sortBy
    private static void sortContactWrappers(List<ContactWrapper> listToSort, String sortBy) {
        Integer n = listToSort.size();

        for (Integer i = 0; i < n - 1; i++) {
            for (Integer j = 0; j < n - i - 1; j++) {
                Boolean swapNeeded = false;

                if (sortBy == 'Name') {
                    if (listToSort[j].Name != null && listToSort[j + 1].Name != null &&
                        listToSort[j].Name.toLowerCase() > listToSort[j + 1].Name.toLowerCase()) {
                        swapNeeded = true;
                    }
                } else if (sortBy == 'RelatedAccountCount') {
                    if (listToSort[j].RelatedAccountCount < listToSort[j + 1].RelatedAccountCount) {
                        // Descending order
                        swapNeeded = true;
                    }
                }

                if (swapNeeded) {
                    ContactWrapper temp = listToSort[j];
                    listToSort[j] = listToSort[j + 1];
                    listToSort[j + 1] = temp;
                }
            }
        }
    }

    public class ContactWrapper {
        @AuraEnabled public Id Id;
        @AuraEnabled public String Name;
        @AuraEnabled public String Email;
        @AuraEnabled public Integer RelatedAccountCount;
    }
}