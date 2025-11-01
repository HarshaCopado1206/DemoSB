global class HLS_AtlasRAG_Multisite {
    // Define a list of website URLs on which to perform the search
    private static final List<String> SITE_URLS = new List<String>{
        'https://help.salesforce.com/s/',
        'hhttps://slack.com/help',
        'https://www.tableau.com/support/help'
        // Add more sites here if necessary,  no comma after the last site 
    };

    @AuraEnabled
    global static String generateChat(String prompt) {
        String responseText = getSearchResults(prompt);
        System.debug(responseText);
        return responseText;
    }

    @AuraEnabled
    global static String getSearchResults(String prompt) {
        String finalResponse = '';
        String braveResponseText = braveSearch(prompt);
        String dcRelevantContent = getContentFromStoredFiles(prompt); // Correct name
        if (dcRelevantContent != null && dcRelevantContent != '') {
            finalResponse += 'Relevant content from documents: \n' + dcRelevantContent;
        }
        if (braveResponseText != null && braveResponseText != '') {
            finalResponse += '\n\nWeb search results: \n' + braveResponseText;
        }

        System.debug(finalResponse);
        return finalResponse;
    }

    private static String braveSearch(String prompt) {
        String endpoint = 'https://api.search.brave.com/res/v1/web/search';
        String apiKey = 'BSAeH5tiOE9_sujlMF5z17Rt38zXuGS'; //Copy here your API key

        if (apiKey.length() == 0) {
            return '';
        }

        String query = prompt;

        // Build the filter for the websites
        if (!SITE_URLS.isEmpty()) {
            List<String> domains = new List<String>();
            for (String siteURL : SITE_URLS) {
                String domain = extractMainDomain(siteURL);
                if (domain != null && domain != '') {
                    domains.add('site:' + domain);
                }
            }
            if (!domains.isEmpty()) {
                // Join the domains with the OR operator
                String siteFilter = ' (' + String.join(domains, ' OR ') + ')';
                query = query + siteFilter;
            }
        }

        // Debug the final query
        System.debug('Final Query: ' + query);

        // Create an HTTP request
        HttpRequest req = new HttpRequest();

        req.setHeader('Accept', 'application/json');
        req.setHeader('X-Subscription-Token', apiKey);
        req.setEndpoint(endpoint + '?q=' + EncodingUtil.urlEncode(query, 'UTF-8') + '&text_decorations=1&extra_snippets=1&summary=1');
        req.setMethod('GET');

        // Send the request and get the response
        Http http = new Http();
        HttpResponse res = http.send(req);

        // Process the response
        if (res.getStatusCode() == 200) {
            // Deserialize the JSON response
            SearchResponse searchResponse = (SearchResponse)JSON.deserialize(res.getBody(), SearchResponse.class);

            String responseText = getCollectSearchInfo(searchResponse);

            return responseText;
        } else {
            // Handle errors based on the status code
            throw new CalloutException(res.getStatus() + ': ' + res.getBody());
        }
    }

    public static String extractMainDomain(String url) {
        // Check if the URL starts with "http://" or "https://"
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            // Prepend "https://" if the protocol is not present
            url = 'https://' + url;
        }

        Url urlObj = new Url(url);
        // Get the host from the URL object, which is the domain
        String domain = urlObj.getHost();

        System.debug('Domain: ' + domain);  // Output: subdomain.example.com

        // Split the domain into parts using '.'
        List<String> domainParts = domain.split('\\.');

        String finalResult = '';

        // Check if the domain has at least two parts (e.g., example.com)
        if (domainParts.size() > 2) {
            // Return the last two parts (second-level domain and top-level domain)
            finalResult = domainParts[domainParts.size() - 2] + '.' + domainParts[domainParts.size() - 1];
        } else if (domainParts.size() == 2) {
            // Return if the domain is already in the 'example.com' format
            finalResult = domain;
        }

        System.debug(finalResult);

        return finalResult;
    }

    public static String getCollectSearchInfo(SearchResponse searchResponse) {
        String collectSearchInfo = '';
        if (searchResponse.web != null && searchResponse.web.results != null) {
            Integer counter = 0;
            for (Result r : searchResponse.web.results) {
                if (counter++ >= 50) break; // Limit to 50 entries
                String snippetSection = '';

                collectSearchInfo += '  - url: ' + r.url 
                + '\n    title: ' + r.title 
                + '\n    description: ' + r.description
                + '\n    result_type: ' + r.type;


                // The main results to provide more content compared to the latest results
                if (r.extra_snippets != null && !r.extra_snippets.isEmpty() && counter < 20) {
                    Integer deepLinkCounter = 0;
                    for (String snippet : r.extra_snippets) {
                        if (deepLinkCounter++ >= 20) break; // Limit to 20 deep links
                        snippetSection += '      - ' + snippet + '\n';
                    }
                    if (!snippetSection.equals('')) {
                        snippetSection = '    snippets:\n' + snippetSection;
                    }
                }

                collectSearchInfo += (snippetSection.equals('') ? '' : '\n' + snippetSection);
            }
        }

        return collectSearchInfo;
    }

    private static String getContentFromStoredFiles(String query) { // Correct name
        try {
            List<String> searchTerms = getSearchTermsForQuery(query);
            if (searchTerms == null) {
                searchTerms = new List<String>();
            } 
            if (searchTerms.isEmpty()) {
                searchTerms.add(query);
            }

            List<String> hsQueries = new List<String>();
            for (String term : searchTerms) {
                // Hybrid Search Index query
                hsQueries.add('SELECT v.hybrid_score__c score__c, v.RecordId__c FROM hybrid_search(TABLE(EAC_Documents_index__dlm), \'' + term + '\', \'\', 2) v');
            }

            String semanticQuery = 'SELECT c.Chunk__c, c.RecordId__c, c.DataSource__c, c.DataSourceObject__c, c.SourceRecordId__c FROM (' +
                                    String.join(hsQueries, ' UNION ALL ') + ') v ' +
                                    'JOIN EAC_Documents_chunk__dlm c ON v.RecordId__c = c.RecordId__c ' +
                                    'WHERE c.SourceRecordId__c LIKE \'%eac/documents/Ciaparota/%\' ' +
                                    'ORDER BY score__c DESC ' + 
                                    'LIMIT 10';
            System.debug('Semantic Query: ' + semanticQuery);
            String semanticResponse = getSemanticQueryResponse(semanticQuery);
            //System.debug('Semantic Response: ' + semanticResponse);

            return semanticResponse;
        } catch (Exception e) {
            System.debug('Error in fetching search terms for query: ' + e.getMessage());
            return null;
        }
    }

    private static String getSemanticQueryResponse(String query) {
        ConnectApi.CdpQueryInput semanticInput = new ConnectApi.CdpQueryInput();
        semanticInput.sql = query;

        ConnectApi.CdpQueryOutputV2 semanticResponse = ConnectApi.CdpQuery.queryAnsiSqlV2(
            semanticInput
        );

        List<Content> context = new List<Content>();
        for (ConnectApi.CdpQueryV2Row row : semanticResponse.data) {
            List<Object> rowData = row.rowData;
            Content content = new Content();
            System.debug('Record Data ::: RecordId:' + rowData.get(1) + ' DataSource: ' + rowData.get(2) + ' DataSourceObject: ' + rowData.get(3) + ' SourceRecordId: ' + rowData.get(4));
            content.chunk = String.valueOf(rowData.get(0));
            context.add(content);
        }

        JSONGenerator gen = JSON.createGenerator(true);
        gen.writeStartObject();
        gen.writeObjectField('context', context);
        gen.writeEndObject();
        String body = gen.getAsString();

        return body;
    }

    private static List<String> getSearchTermsForQuery(String query) {
        List<String> searchTerms = new List<String>();
        try {
            String promptText = 'Given the user query, identify up to 2 specific search strings that effectively capture all relevant details for a vector similarity search. Exclude generic outcomes like summary or details. ' +
                                'Format the output as a JSON object with the following structure: searchTerms as list of strings. Do not include any backticks or extra strings. ' +
                                'user_query: ' + query;
            ConnectApi.EinsteinLLMGenerationItemOutput response = generateWithEinsteinGpt(promptText);
            String cleanedJson = response.text.replace('```json', '').replace('```', '').trim();
            Map<String, Object> cObjMap = (Map<String, Object>) JSON.deserializeUntyped(cleanedJson);
            List<Object> terms = (List<Object>)cObjMap.get('searchTerms');
            for (Object term : terms) {
                if (term != null) {
                    searchTerms.add(String.valueOf(term));
                }
            }
            System.debug('Search terms fetched for query: ' + terms);
        } catch (Exception e) {
            System.debug('Error in fetching search terms for query: ' + e.getMessage());
            return null;
        }
        return searchTerms;
    }
    
    public static ConnectApi.EinsteinLLMGenerationItemOutput generateWithEinsteinGpt(String promptText) {
        ConnectApi.EinsteinLlmGenerationsInput generationsInput = new ConnectApi.EinsteinLlmGenerationsInput();
        generationsInput.promptTextorId = promptText;
        generationsInput.additionalConfig = new ConnectApi.EinsteinLlmAdditionalConfigInput();
        generationsInput.additionalConfig.applicationName = 'ProductDescription';
        generationsInput.additionalConfig.model = 'llmgateway__OpenAIGPT4Omni';
        // Call the service
        ConnectApi.EinsteinLLMGenerationsOutput generationsOutput = ConnectApi.EinsteinLLM.generateMessages(generationsInput);
        // Consume response
        ConnectApi.EinsteinLLMGenerationItemOutput response = generationsOutput.generations[0];
        return response;
    }

    private class SearchResponse {
        public Web web;
        public Summarizer summarizer;
    }

    private class Web {
        public List<Result> results;
    }

    private class Result {
        public String title;
        public String type;
        public String url;
        public String description;
        public List<String> extra_snippets;
    }

    private class Summarizer {
        public String type;
        public String key;
    }

    private class Content {
        public String chunk;
    }

    // Invocable Action that calls the original generateChat method
    @InvocableMethod(label='HLS Brave Multisite - Answer Questions with Knowledge from Multiple Sites' description='Responds to questions about the company, products, help info, and general questions.')
    public static List<Output> generateChatAction(List<Input> inputParams) {
        List<Output> outputList = new List<Output>();

        for (Input input : inputParams) {
            Output output = new Output();

            try {
                // Calls the modified getSearchResults method
                output.knowledgeAnswer = getSearchResults(input.query);
            } catch (Exception e) {
                output.knowledgeAnswer = 'Error: ' + e.getMessage();
            }

            outputList.add(output);
        }

        return outputList;
    }

    // Input class for the invocable action
    public class Input {
        @InvocableVariable(required=true description='Required. A string created by generative AI to be used in the knowledge article search.')
        public String query;
    }

    // Output class for the invocable action
    public class Output {
        @InvocableVariable(description='A string formatted as rich text that includes a summary of the information retrieved from the knowledge articles and citations to those articles.')
        public String knowledgeAnswer;
    }

    // private static void debugLongString(String longString) {
    //     // Create a regex group for every 250 character chunk of the string
    //     Pattern chunksPattern = Pattern.compile('(.{300})');
    //     // Add a newline character to the end of every group
    //     longString = chunksPattern.matcher(longString).replaceAll('$1\n');
    //     // New lines characters will cause System.debug() to print out
    //     // over multiple lines in the Developer Console
    //     System.debug(longString);
    // }
}