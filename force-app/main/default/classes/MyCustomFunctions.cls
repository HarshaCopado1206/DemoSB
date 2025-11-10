global class MyCustomFunctions implements Callable
{
    /*
        inputs - arguments - List<Object> of passed in arguments
        output - result - The result of the Function being called. Supports single Object values, List<Object> or Map<String, Object>
    */
    public Object call(String action, Map<String, Object> args) {

        Map<String, Object> input = (Map<String, Object>)args.get('input');
        Map<String, Object> output = (Map<String, Object>)args.get('output');
        Map<String, Object> options = (Map<String, Object>)args.get('options');

        return invokeMethod(action, input, output, options);
    }

    global Boolean invokeMethod(String methodName, Map<String, Object> inputs, Map<String, Object> output, Map<String, Object> options)
    {
        if (methodName == 'toObjArray')
        {
            List<Object> arguments = (List<Object>)inputs.get('arguments');
            output.put('result', convert(arguments));
        }else if (methodName == 'replace')
        {
            List<Object> arguments = (List<Object>)inputs.get('arguments');
            output.put('result', replace(arguments));
        }else if ( methodName == 'phoneNumberFormatting'){
            List<Object> arguments = (List<Object>)inputs.get('arguments');
            output.put('result', phoneNumberFormatting(arguments));
        }
        return true;
    }
    
    private LIST<Map<String, Object>> convert(List<Object> arguments)
    {
        try{
            LIST<Map<String, Object>> result = new LIST<Map<String, Object>>();
            Map<String,Object> inputlist = (Map<String,Object>)arguments[0];
            String key = (String)arguments[1];
            List<Object> listofElements = (List<Object>)inputlist.get('VLOCITY-FORMULA-LIST');
            for(Object str : listofElements){
                result.add(new Map<String,Object>{key => str});
            }
            return result;
        }catch(Exception e){
            return new LIST<Map<String, Object>>(); 
        }
    }

    private String replace(List<Object> arguments)
    {
        String result ='';
        try{
            
            String inputlist = (String)arguments[0];
            String toreplace = (String)arguments[1];
            String replaceby = (String)arguments[2];
            result = inputlist.replaceAll(toreplace, replaceby);
        }catch(Exception e){
        }
        return result;
    }
    public string phoneNumberFormatting(List<Object> arguments)
    {
        string Phoneno = arguments[0]+'';
        String formattedPhone = Phoneno.replaceAll('[^0-9+]','');
        String NewFormat;
        if(String.isNotBlank(formattedPhone) && formattedPhone.length()>=9 ){
            String first = formattedPhone.subString(0,3);
            String second = formattedPhone.subString(3,6);
            String third = formattedPhone.subString(6);
            NewFormat = '('+first+')'+' '+second+'-'+third;
             
        }
        return NewFormat;
    }
}