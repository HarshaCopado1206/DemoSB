/* This custom Apex class retrieves UserSessionId for use in a REST call back to the same SF Org
 * @author Dean Fischesser (dfischesser@salesforce.com)
 * @version 1.0
 * History
 * =======
 * 1.0 - December 04, 2021 - Initial Version
 */

Global with sharing class sfiArch_getUserSessionId implements Callable {

    public Object call(String action, Map < String, Object > args) {
        
        Map < String, Object > input = (Map < String, Object >)args.get('input');
        Map < String, Object > output = (Map < String, Object >)args.get('output');
        Map < String, Object > options = (Map < String, Object >)args.get('options');

//        if (action == 'getSessionId') {
            return getSessionId(action, input, output, options);
//        }
    }
    
    private Object getSessionId(String methodName, Map<String, Object> inputMap, Map<String, Object> outMap, Map<String, Object> options){
            outMap.put('userSessionId',UserInfo.getSessionId());
            outMap.put('orgURL',URL.getOrgDomainURL().toExternalForm());
            return true;
        }
    
}