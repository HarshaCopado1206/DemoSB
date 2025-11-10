global class HLS_AtlasRAG {
    
    @AuraEnabled
    global static String generateChat(String prompt) {
        String responseText = getSearchResults(prompt);
        return responseText;
    }
    
    @AuraEnabled
    global static String getSearchResults(String prompt) {
        String finalResponse = '';
        String braveResponseText = braveSearch(prompt);
        if (String.isNotBlank(braveResponseText)) {
            finalResponse = '\n \n Knowledge search results: \n ' + braveResponseText;
        }
        //System.debug(finalResponse);
        return finalResponse;
    }
    
    //Send Search Request to Brave
    private static String braveSearch(String prompt) {

        //Gets the customer domain from Lauren Doyle's contact record on the Department text field
        String siteURL = getCustomerDomainForSearch();

        if (String.isBlank(siteURL)) {
            return '';
        }
        String query = prompt;
        query = query + ' site:' + siteURL;
   
        // Create an HTTP request
        HttpRequest req = new HttpRequest();
        req.setHeader('Accept', 'application/json');
        req.setHeader('X-Subscription-Token', getAPIKeyForBrave());
        req.setEndpoint(getEndpointForBrave() + '?q=' + EncodingUtil.urlEncode(query, 'UTF-8') + '&text_decorations=1&extra_snippets=1&summary=1');
        req.setMethod('GET');

        // Send the request and get the response
        Http http = new Http();
        HttpResponse res = http.send(req);

        // Process the response
        if (res.getStatusCode() == 200) {
            // Parse the response body as JSON
            SearchResponse searchResponse = (SearchResponse)JSON.deserialize(res.getBody(), SearchResponse.class);
            String responseText = getCollectSearchInfo(searchResponse);
            return responseText;
        } else {
            // Handle errors based on status code
            System.debug('ERROR: ' + res.getStatus() + ': ' + res.getBody());
            return '';
        }
    }

    //Parse and return response from Brave
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

                // The top results to bring more content than the last results
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

    //Generate search terms from original query
    private static List<String> getSearchTermsForQuery(String query) {
        List<String> searchTerms = new List<String>();
        try {
            String promptText = 'Given the user query, identify up to 2 specific search strings that effectively capture all relevant details for a vector similarity search. Exclude generic outcomes like summary or details. ' +
                                'Format the output as a JSON object with the following structure: searchTerms as list of strings. Do not include any backticks or extra strings. '+
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
            System.debug('search terms fetched for query :' + terms);
        } catch (Exception e) {
            System.debug('Error in fetching search terms for query :' + e.getMessage());
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
    @InvocableMethod(label='HLS - Answer Questions with Knowledge Grounding Using Brave' description='Answers questions about company policies, procedures, and products to help customers adopt and troubleshoot issues with questions like "How do I turn on security settings" or "How do I use your API?".')
    public static List<Output> generateChatAction(List<Input> inputParams) {
        List<Output> outputList = new List<Output>();

        for (Input input : inputParams) {
            Output output = new Output();

            try {
                // Call the original generateChat method
                // output.knowledgeAnswer = generateChat(input.query);
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
        @InvocableVariable(description='Rich text of all the knowledge articles and citations to those articles that could match the question. Filter and summarize to provide the right response.')
        public String knowledgeAnswer;
    }
    
    private static String getCustomerDomainForSearch() {
        //return '';
        try {
            Contact lauren = [Select Id, Department  
                             FROM Contact WHERE External_ID__c = 'Contact.001' AND 
                             Department != NULL LIMIT 1];
            return lauren.Department;
        } catch (Exception e) {
            return '';
        }
    }
    
    private static String getAPIKeyForBrave() {
        // return 'BSAC_xI72NweBPBQjAyw2cG-7NZZGtX'; original Tech IDO API Key
        return 'BSAeH5tiOE9_sujlMF5z17Rt38zXuGS' ; //HLS RDO Brave AI API key
    }
    
    private static String getEndpointForBrave() {
        return 'https://api.search.brave.com/res/v1/web/search';
    }
}