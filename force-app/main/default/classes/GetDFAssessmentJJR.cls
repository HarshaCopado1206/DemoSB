public class GetDFAssessmentJJR {

    // Define an Apex class to be invocable by Flow
    @InvocableMethod(label='Call Omniscript API to get Assessment Data' description='Call Salesforce Connect API and return response')
    public static List<OmniscriptApiResponse> callOmniscriptApi(List<OmniscriptApiRequest> requestList) {
        // Prepare a list to hold the response for the flow
        List<OmniscriptApiResponse> responseList = new List<OmniscriptApiResponse>();

        // Iterate over the request input (although it's a single input, it uses a list due to Flow's structure)
        for (OmniscriptApiRequest req : requestList) {
            String omniScriptId = req.omniscriptId;

            // Prepare the URL for the Salesforce Connect API request
            String endpoint = '/services/data/v61.0/connect/omniscript/' + omniScriptId + '?customType=Discovery%20Framework';
            String fullUrl = 'callout:SFAPI' + endpoint;

            // Make the HTTP GET request
            HttpRequest reqHttp = new HttpRequest();
            reqHttp.setEndpoint(fullUrl);
            reqHttp.setMethod('GET');
            reqHttp.setHeader('Authorization', 'Bearer ' + UserInfo.getSessionId());  // Using current user's session ID for auth
            reqHttp.setHeader('Content-Type', 'application/json');

            Http http = new Http();
            HttpResponse res = http.send(reqHttp);

            // Create the response object to return to the Flow
            OmniscriptApiResponse response = new OmniscriptApiResponse();
            if (res.getStatusCode() == 200) {
                // If the request is successful, return the response body as a string
                response.apiResponse = res.getBody();
            } else {
                // If the request fails, return an error message
                response.apiResponse = 'Error: ' + res.getStatus() + ' - ' + res.getStatusCode() + ' - ' + res.getBody();
            }

            // Add the response to the response list
            responseList.add(response);
        }

        // Return the list of responses back to the Flow
        return responseList;
    }

    // Inner class for Flow input
    public class OmniscriptApiRequest {
        @InvocableVariable(label='Omniscript ID' description='The ID of the Omniscript to query')
        public String omniscriptId;
    }

    // Inner class for Flow output
    public class OmniscriptApiResponse {
        @InvocableVariable(label='API Response' description='Response from the Salesforce Connect API')
        public String apiResponse;
    }
}