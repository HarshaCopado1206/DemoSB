//Batch Job for creating and uploading data in staging tables from external system
global class HealthcareQuoteBatch implements Database.Batchable<SObject> {
    global Database.QueryLocator start(Database.BatchableContext BC) {
        /*return Database.getQueryLocator([
            SELECT Id, External_Quote_ID__c, Account__c, Amount__c, Status__c, Name
            FROM Healthcare_Quote_Staging__c
        ]);*/
        DateTime lastRun = BatchJobLastRun__c.getInstance().Last_Run_Date__c;
        if (lastRun == null) {
        lastRun = DateTime.newInstance(2000,1,1); // default to very old date for first run
        }

        String query = 'SELECT Id, External_Quote_ID__c, Account__c, Amount__c, Status__c, Name FROM Healthcare_Quote_Staging__c WHERE LastModifiedDate > :lastRun';
        return Database.getQueryLocator(query);
    }

    global void execute(Database.BatchableContext BC, List<Healthcare_Quote_Staging__c> scope) {
        System.debug('==== EXECUTION STARTED ====');
        System.debug('Scope size: ' + scope.size());

        // Collect external IDs and staging record Ids
        Set<String> externalQuoteIds = new Set<String>();
        Set<Id> stagingQuoteIds = new Set<Id>();
        Map<Id, String> stagingIdToExtId = new Map<Id, String>();

        for (Healthcare_Quote_Staging__c rec : scope) {
            if (String.isNotBlank(rec.External_Quote_ID__c)) {
                externalQuoteIds.add(rec.External_Quote_ID__c);
                stagingQuoteIds.add(rec.Id);
                stagingIdToExtId.put(rec.Id, rec.External_Quote_ID__c);
            } else {
                System.debug('Skipping staging record without External_Quote_ID__c: ' + rec.Id);
            }
        }

        // Fetch existing Quotes by External ID
        Map<String, Quote> existingQuotes = new Map<String, Quote>(
            [SELECT Id, External_Quote_ID__c, Pricebook2Id FROM Quote WHERE External_Quote_ID__c IN :externalQuoteIds]
        );

        List<Quote> quotesToUpsert = new List<Quote>();
        Map<String, Id> quoteExtIdToQuoteId = new Map<String, Id>();

        // Prepare Quotes
        for (Healthcare_Quote_Staging__c staging : scope) {
            if (String.isBlank(staging.External_Quote_ID__c)) continue;

            Quote q;
            if (existingQuotes.containsKey(staging.External_Quote_ID__c)) {
                q = existingQuotes.get(staging.External_Quote_ID__c);
                System.debug('Updating existing quote for: ' + staging.External_Quote_ID__c);
            } else {
                q = new Quote();
                q.External_Quote_ID__c = staging.External_Quote_ID__c;
                q.QuoteAccountId = staging.Account__c; // Associate with Account
                System.debug('Creating new quote for: ' + staging.External_Quote_ID__c);
            }

            q.Name = staging.Name;
            q.Status = staging.Status__c;
            quotesToUpsert.add(q);
        }

        upsert quotesToUpsert External_Quote_ID__c;

        // Map External Quote ID to Quote.Id after upsert
        for (Quote q : quotesToUpsert) {
            quoteExtIdToQuoteId.put(q.External_Quote_ID__c, q.Id);
        }

        // Fetch Quote Details from staging
        List<Healthcare_QuoteDetail_Staging__c> details = [
            SELECT Id, External_Quote_Detail_ID__c, QuoteId__c, Quantity__c, UnitPrice__c, Product_Code__c
            FROM Healthcare_QuoteDetail_Staging__c
            WHERE QuoteId__c IN :stagingQuoteIds
        ];

        // Collect unique trimmed product codes
        Set<String> productCodes = new Set<String>();
        for (Healthcare_QuoteDetail_Staging__c d : details) {
            if (String.isNotBlank(d.Product_Code__c)) {
                productCodes.add(d.Product_Code__c.trim());
            }
        }
        System.debug('Product codes collected from staging details: ' + productCodes);

        // Query active Products grouped by ProductCode
        Map<String, List<Product2>> codeToProducts = new Map<String, List<Product2>>();
        for (Product2 p : [SELECT Id, Name, ProductCode FROM Product2 WHERE ProductCode IN :productCodes AND IsActive = true]) {
            if (!codeToProducts.containsKey(p.ProductCode)) {
                codeToProducts.put(p.ProductCode, new List<Product2>());
            }
            codeToProducts.get(p.ProductCode).add(p);
        }

        // Query Standard Pricebook (must be active)
        Pricebook2 standardPB = [SELECT Id, IsActive FROM Pricebook2 WHERE IsStandard = true LIMIT 1];
        if (!standardPB.IsActive) {
            standardPB.IsActive = true;
            update standardPB;
        }

        List<QuoteLineItem> lineItemsToUpsert = new List<QuoteLineItem>();

        // Helper map to cache PricebookEntries by Product2 Id
        Map<Id, PricebookEntry> productIdToPBE = new Map<Id, PricebookEntry>();

        // Process each detail record
        for (Healthcare_QuoteDetail_Staging__c detail : details) {
            if (String.isBlank(detail.External_Quote_Detail_ID__c)) {
                System.debug('Skipping detail with missing External_Quote_Detail_ID__c: ' + detail.Id);
                continue;
            }

            String extQuoteId = stagingIdToExtId.get(detail.QuoteId__c);
            Id finalQuoteId = quoteExtIdToQuoteId.get(extQuoteId);
            if (finalQuoteId == null) {
                System.debug('No Quote found for detail record: ' + detail.Id + ', External Quote ID: ' + extQuoteId);
                continue;
            }

            // Get the trimmed product code
            String prodCode = detail.Product_Code__c != null ? detail.Product_Code__c.trim() : null;

            if (String.isBlank(prodCode)) {
                System.debug('Missing product code for detail: ' + detail.Id);
                continue;
            }

            List<Product2> productsForCode = codeToProducts.get(prodCode);

            if (productsForCode == null || productsForCode.isEmpty()) {
                System.debug('Missing product for code: ' + prodCode + ' for detail: ' + detail.Id);
                continue;
            }

            // Pick first active product for the product code
            Product2 product = productsForCode[0];

            // Find or create PricebookEntry for this product in standard pricebook
            PricebookEntry pbe;
            if (productIdToPBE.containsKey(product.Id)) {
                pbe = productIdToPBE.get(product.Id);
            } else {
                List<PricebookEntry> pbes = [
                    SELECT Id, IsActive, Pricebook2Id, Product2Id, UnitPrice
                    FROM PricebookEntry
                    WHERE Product2Id = :product.Id AND Pricebook2Id = :standardPB.Id AND IsActive = true
                    LIMIT 1
                ];

                if (!pbes.isEmpty()) {
                    pbe = pbes[0];
                } else {
                    // Create PricebookEntry if missing
                    pbe = new PricebookEntry(
                        Pricebook2Id = standardPB.Id,
                        Product2Id = product.Id,
                        UnitPrice = detail.UnitPrice__c != null ? detail.UnitPrice__c : 0,
                        IsActive = true
                    );
                    try {
                        insert pbe;
                    } catch (DmlException e) {
                        System.debug('Error inserting PricebookEntry for product ' + product.Id + ': ' + e.getMessage());
                        continue;
                    }
                }
                productIdToPBE.put(product.Id, pbe);
            }

            // Ensure the Quote has Pricebook2Id assigned to standardPB.Id
            // (You may want to update the Quote here if missing or different)
            Quote qToUpdate;
            for (Quote q : quotesToUpsert) {
                if (q.Id == finalQuoteId) {
                    qToUpdate = q;
                    break;
                }
            }
            if (qToUpdate == null) {
                qToUpdate = [SELECT Id, Pricebook2Id FROM Quote WHERE Id = :finalQuoteId LIMIT 1];
            }
            if (qToUpdate.Pricebook2Id != standardPB.Id) {
                qToUpdate.Pricebook2Id = standardPB.Id;
                update qToUpdate;
            }

            QuoteLineItem item = new QuoteLineItem();
            item.External_Quote_Detail_ID__c = detail.External_Quote_Detail_ID__c;
            item.Quantity = detail.Quantity__c != null ? detail.Quantity__c : 1;
            item.UnitPrice = detail.UnitPrice__c != null ? detail.UnitPrice__c : 0;
            item.QuoteId = finalQuoteId;
            item.PricebookEntryId = pbe.Id;
            lineItemsToUpsert.add(item);
        }

        if (!lineItemsToUpsert.isEmpty()) {
            upsert lineItemsToUpsert External_Quote_Detail_ID__c;
            System.debug('Upserted QuoteLineItems: ' + lineItemsToUpsert.size());
        }

        System.debug('==== EXECUTION COMPLETED ====');
    }

    global void finish(Database.BatchableContext BC) {
        BatchJobLastRun__c setting = BatchJobLastRun__c.getInstance('Default');
        setting.Last_Run_Date__c = System.now();
        setting.Status__c = 'Success';
        update setting;
    }
}