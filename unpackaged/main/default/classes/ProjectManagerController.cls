public with sharing class ProjectManagerController {
    
    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getProjectData() {
        List<Map<String, Object>> treeData = new List<Map<String, Object>>();
        List<Project__c> projects = [SELECT Id, Name, Status__c, Owner.Name, Percentage_Complete__c, Due_Date__c,
                                    (SELECT Id, Name, Status__c, Due_Date__c, Percentage_Complete__c FROM Milestones__r ORDER BY Due_Date__c) 
                                    FROM Project__c ORDER BY Due_Date__c];
        
        Set<Id> milestoneIds = new Set<Id>();
        Map<Id, List<Issue__c>> milestoneToIssuesMap = new Map<Id, List<Issue__c>>();
        
        for (Project__c project : projects) {
            for (Milestone__c milestone : project.Milestones__r) {
                milestoneIds.add(milestone.Id);
            }
        }
        
        for (Issue__c issue : [SELECT Id, Name, Description__c, Milestone__c, Status__c, Due_Date__c FROM Issue__c WHERE Milestone__c IN :milestoneIds ORDER BY Due_Date__c]) {
            if (!milestoneToIssuesMap.containsKey(issue.Milestone__c)) {
                milestoneToIssuesMap.put(issue.Milestone__c, new List<Issue__c>());
            }
            milestoneToIssuesMap.get(issue.Milestone__c).add(issue);
        }
        
        for (Project__c project : projects) {
            Map<String, Object> projectNode = new Map<String, Object>{
                'name' => project.Id,
                'label' => project.Name,
                'status' => project.Status__c,
                'typeIcon' => 'custom:custom64',
                'typeLabel' => 'Project',
                'percentageComplete' => String.valueOf(project.Percentage_Complete__c) + '%',
                'dueDate' => project.Due_Date__c,
                'owner' => project.Owner.Name,
                '_children' => new List<Map<String, Object>>()
            };

            for (Milestone__c milestone : project.Milestones__r) {
                List<Map<String, Object>> children = new List<Map<String, Object>>();
                List<Issue__c> issues = milestoneToIssuesMap.get(milestone.Id);
                if (issues != null) {
                    for (Issue__c issue : issues) {
                        Map<String, Object> issueNode = new Map<String, Object>{
                            'name' => issue.Id,
                            'label' => issue.Name,
                            'status' => issue.Status__c,
                            'dueDate' => issue.Due_Date__c,
                            'description' => issue.Description__c,
                            'owner' => project.Owner.Name,
                            'typeIcon' => 'custom:custom45',
                            'typeLabel' => 'Issue'
                        };
                        children.add(issueNode);
                    }
                }

                Map<String, Object> milestoneNode = new Map<String, Object>{
                    'name' => milestone.Id,
                    'label' => milestone.Name,
                    'status' => milestone.Status__c,
                    'dueDate' => milestone.Due_Date__c,
                    'owner' => project.Owner.Name,
                    'percentageComplete' => String.valueOf(milestone.Percentage_Complete__c) + '%',
                    'typeIcon' => 'custom:custom48',
                    'typeLabel' => 'Milestone',
                    '_children' => children
                };
                
                ((List<Map<String, Object>>)projectNode.get('_children')).add(milestoneNode);

            }

            treeData.add(projectNode);
        }
        
        return treeData;
    }

    @AuraEnabled
    public static void updateIssueStatus(String issueId, String newStatus) {
        try {
            Issue__c issue = [SELECT Id, Status__c FROM Issue__c WHERE Id = :issueId LIMIT 1];
            issue.Status__c = newStatus;
            update issue;
        } catch (Exception e) {
            throw new AuraHandledException('Error updating issue status: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static void deleteIssue(String issueId) {
        try {
            delete [SELECT Id FROM Issue__c WHERE Id = :issueId LIMIT 1];
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting issue: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static void deleteMilestone(String milestoneId) {
        try {
            delete [SELECT Id FROM Milestone__c WHERE Id = :milestoneId LIMIT 1];
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting milestone: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static void deleteProject(String projectId) {
        try {
            delete [SELECT Id FROM Project__c WHERE Id = :projectId LIMIT 1];
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting project: ' + e.getMessage());
        }
    }

}
