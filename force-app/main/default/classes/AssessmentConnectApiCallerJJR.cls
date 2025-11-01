public class AssessmentConnectApiCallerJJR {

    // Define the Invocable method for Flow
    @InvocableMethod(label = 'Save Assessment Via Connect API' description = 'Makes a POST request to the Salesforce Connect API to save the assessmentand returns the response.')
    public static List<ApiResponse> callApi(List<ApiRequest> inputList) {
        List<ApiResponse> responseList = new List<ApiResponse>();

        // Loop through input list (although Flow passes a list, here it is expected to have a single element)
        for (ApiRequest input : inputList) {
            String omniScriptId = input.omniscriptId;
            String bodyContent = input.body;
            System.debug('Body is ');
            System.debug(bodyContent);
            //bodyContent='{   "inputs": {"questionResponses": {"Are_you_taking_this_assessment_for_yourself_or_for_another_person": "Myself","What_is_the_name_of_the_person_you_are_taking_this_assessment_for": "Ben Morrow","Have_you_already_been_diagnosed_with_diabetes": "Not Sure","Have_you_ever_been_hospitalized_as_a_result_of_your_diabetes": "No","Do_you_have_a_mother_father_sister_or_brother_with_diabetes": "No one in my family has diabetes"}},"contextId": "0yKHr000000bqJOMAY","assessmentValues": {"Assessment.AssessmentStatus": "In Progress"}}';
            // Define the endpoint for the POST request with dynamic OmniscriptId
            bodyContent = JSON.serialize(JSON.deserializeUntyped(bodyContent));
            String endpoint = '/services/data/v61.0/connect/discovery-framework/assessment-responses/' + omniScriptId;
            System.debug('endpoint is ' + endpoint);
            // Create the full URL using the Named Credential (SF_Connect) for secure authentication
            String fullUrl = 'callout:SFAPI' + endpoint;
            System.debug('FullURL is ' + fullUrl);
            // Create the HTTP request
            HttpRequest req = new HttpRequest();
            req.setEndpoint(fullUrl);  // Uses the Named Credential for authentication
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setCompressed(false);
            req.setHeader('Authorization', 'Bearer ' + UserInfo.getSessionId()); 
            req.setHeader('Cache-Control', 'no-cache');
            req.setHeader('Accept', '*/*');
            req.setHeader('Accept-Encoding', 'gzip, deflate, br');
            req.setHeader('Connection', 'keep-alive');
            req.setBody(bodyContent);  // The body passed from Flow will be used in the POST request

            // Send the HTTP request and get the response
            Http http = new Http();
            HttpResponse res = http.send(req);

            // Prepare the response object
            ApiResponse apiResponse = new ApiResponse();
            System.debug('Status Code is ' + res.getStatusCode());
            if (res.getStatusCode() == 200 || res.getStatusCode() == 201) {
                // If the API call is successful, return the response body as a string
                apiResponse.response = res.getBody();
            } else {
                // If the request fails, return error details
                apiResponse.response = 'Error: ' + res.getStatusCode() + ' - ' + res.getBody();
            }

            // Add the response to the response list
            responseList.add(apiResponse);
        }

        return responseList;
    }

    // Input class for Flow (the parameters passed from Flow)
    public class ApiRequest {
        @InvocableVariable(label = 'Omniscript ID' description = 'The ID of the Omniscript to use in the API call')
        public String omniscriptId;  // The Omniscript ID to be included in the API URL

        @InvocableVariable(label = 'Body Content' description = 'The body of the HTTP POST request')
        public String body;  // The body content for the POST request (JSON format)
    }

    // Output class for Flow (the response to return to Flow)
    public class ApiResponse {
        @InvocableVariable(label = 'API Response' description = 'The response from the Salesforce Connect API')
        public String response;  // The response from the API call, either success or error message
    }
}