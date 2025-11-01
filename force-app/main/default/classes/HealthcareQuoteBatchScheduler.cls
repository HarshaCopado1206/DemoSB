public class HealthcareQuoteBatchScheduler implements Schedulable {
    public void execute(SchedulableContext sc) {
        Database.executeBatch(new HealthcareQuoteBatch(), 2000);
    }
}