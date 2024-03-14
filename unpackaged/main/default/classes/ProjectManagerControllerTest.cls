@IsTest
public class ProjectManagerControllerTest {

    @IsTest
    static void testGetProjectData() {
        // Setup test data
        Project__c project = new Project__c(Name = 'Test Project');
        insert project;

        Milestone__c milestone = new Milestone__c(Name = 'Test Milestone', Project__c = project.Id);
        insert milestone;

        Issue__c issue = new Issue__c(Name = 'Test Issue', Milestone__c = milestone.Id, Status__c = 'In Progress');
        insert issue;

        // Test getProjectData method
        Test.startTest();
        List<Map<String, Object>> projectData = ProjectManagerController.getProjectData();
        Test.stopTest();

        // Asserts
        System.assertNotEquals(null, projectData, 'Project data should not be null');
        System.assertEquals(1, projectData.size(), 'There should be one project');
        Map<String, Object> projectNode = projectData[0];
        System.assertEquals('Test Project', projectNode.get('label'), 'Project label should match');
        List<Map<String, Object>> children = (List<Map<String, Object>>)projectNode.get('_children');
        System.assertNotEquals(null, children, 'Children should not be null');
        System.assertEquals(1, children.size(), 'There should be one milestone');
        Map<String, Object> milestoneNode = children.get(0);
        System.assertEquals('Test Milestone', milestoneNode.get('label'), 'Milestone label should match');
    }

    @IsTest
    static void testUpdateIssueStatus() {
        Project__c project = new Project__c(Name = 'Test Project');
        insert project;

        Milestone__c milestone = new Milestone__c(Name = 'Test Milestone', Project__c = project.Id);
        insert milestone;

        Issue__c issue = new Issue__c(Name = 'Test Issue', Milestone__c = milestone.Id, Status__c = 'In Progress');
        insert issue;

        // Test updateIssueStatus method
        Test.startTest();
        ProjectManagerController.updateIssueStatus(issue.Id, 'Complete');
        Test.stopTest();

        // Asserts
        issue = [SELECT Status__c FROM Issue__c WHERE Id = :issue.Id];
        System.assertEquals('Complete', issue.Status__c, 'Issue status should be updated to Complete');
    }

    @IsTest
    static void testDeleteIssue() {
        Project__c project = new Project__c(Name = 'Test Project');
        insert project;

        Milestone__c milestone = new Milestone__c(Name = 'Test Milestone', Project__c = project.Id);
        insert milestone;

        Issue__c issue = new Issue__c(Name = 'Test Issue', Milestone__c = milestone.Id, Status__c = 'In Progress');
        insert issue;

        // Test deleteIssue method
        Test.startTest();
        ProjectManagerController.deleteIssue(issue.Id);
        Test.stopTest();

        // Asserts
        System.assertEquals(0, [SELECT COUNT() FROM Issue__c WHERE Id = :issue.Id], 'Issue should be deleted');
    }

    @IsTest
    static void testDeleteMilestone() {
        Project__c project = new Project__c(Name = 'Test Project');
        insert project;

        Milestone__c milestone = new Milestone__c(Name = 'Test Milestone', Project__c = project.Id);
        insert milestone;

        Issue__c issue = new Issue__c(Name = 'Test Issue', Milestone__c = milestone.Id, Status__c = 'In Progress');
        insert issue;

        // Test deleteMilestone method
        Test.startTest();
        ProjectManagerController.deleteMilestone(milestone.Id);
        Test.stopTest();

        // Asserts
        System.assertEquals(0, [SELECT COUNT() FROM Milestone__c WHERE Id = :milestone.Id], 'Milestone should be deleted');
    }

    @IsTest
    static void testDeleteProject() {
        Project__c project = new Project__c(Name = 'Test Project');
        insert project;

        Milestone__c milestone = new Milestone__c(Name = 'Test Milestone', Project__c = project.Id);
        insert milestone;

        Issue__c issue = new Issue__c(Name = 'Test Issue', Milestone__c = milestone.Id, Status__c = 'In Progress');
        insert issue;

        // Test deleteProject method
        Test.startTest();
        ProjectManagerController.deleteProject(project.Id);
        Test.stopTest();

        // Asserts
        System.assertEquals(0, [SELECT COUNT() FROM Project__c WHERE Id = :project.Id], 'Project should be deleted');
    }
}
