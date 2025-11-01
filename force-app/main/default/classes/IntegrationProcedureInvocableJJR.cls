global with sharing class IntegrationProcedureInvocableJJR {
 @InvocableMethod(label = 'Integration Procedure - JJR')
 global static List < IntegrationProcedureOutput > runIntegrationServiceInvocable(List < IntegrationProcedureInput > input) {
  System.debug(LoggingLevel.Error, JSON.serialize(input));
  IntegrationProcedureOutput result = new IntegrationProcedureOutput();
  result.output = JSON.serialize(
   vlocity_ins.IntegrationProcedureService.runIntegrationService(
    input[0].procedureAPIName,
    new Map < String, Object >
    {
     'fullJSON' => input[0].input,
     'messagingSessionId' => input[0].messagingSessionId
    },
    new Map < String, Object > ()));
  System.debug(LoggingLevel.Error, 'JACK____');
  System.debug(LoggingLevel.Error, 'Input is ' + input[0].input);
  System.debug(LoggingLevel.Error, 'Result is ');
  System.debug(LoggingLevel.Error, JSON.serialize(result));
  return new List < IntegrationProcedureOutput >
   {
    result
   };
 }
 global class IntegrationProcedureInput
 {
  @InvocableVariable(label = 'Procedure Name') global String procedureAPIName;
  @InvocableVariable(label = 'Input') global String input;
  @InvocableVariable(label = 'Messaging Session Id') global String messagingSessionId;
 }
 global class IntegrationProcedureOutput
 {
  @InvocableVariable(label = 'Output') global String output;
 }
}