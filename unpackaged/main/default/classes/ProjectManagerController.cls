public with sharing class ProjectManagerController {
    
    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getProjectData() {
        List<Map<String, Object>> treeData = new List<Map<String, Object>>();
        List<Project__c> projects = [SELECT Id, Name, Status__c, 
                                    (SELECT Id, Name, Status__c, Due_Date__c, Percentage_Complete__c FROM Milestones__r) 
                                    FROM Project__c];
        
        Set<Id> milestoneIds = new Set<Id>();
        for (Project__c project : projects) {
            for (Milestone__c milestone : project.Milestones__r) {
                milestoneIds.add(milestone.Id);
            }
        }
        
        Map<Id, List<Issue__c>> milestoneToIssuesMap = new Map<Id, List<Issue__c>>();
        for (Issue__c issue : [SELECT Id, Name, Description__c, Milestone__c, Status__c, Due_Date__c FROM Issue__c WHERE Milestone__c IN :milestoneIds]) {
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
                '_children' => new List<Map<String, Object>>()
            };
            for (Milestone__c milestone : project.Milestones__r) {
                Map<String, Object> milestoneNode = new Map<String, Object>{
                    'name' => milestone.Id,
                    'label' => milestone.Name,
                    'status' => milestone.Status__c,
                    'duedate' => milestone.Due_Date__c,
                    'percentage' => milestone.Percentage_Complete__c,
                    '_children' => new List<Map<String, Object>>()
                };
                // Attach Issues to Milestone
                List<Issue__c> issues = milestoneToIssuesMap.get(milestone.Id);
                if (issues != null) {
                    for (Issue__c issue : issues) {
                        Map<String, Object> issueNode = new Map<String, Object>{
                            'name' => issue.Id,
                            'label' => issue.Name,
                            'description' => issue.Description__c
                        };
                        ((List<Map<String, Object>>)milestoneNode.get('_children')).add(issueNode);
                    }
                }
                ((List<Map<String, Object>>)projectNode.get('_children')).add(milestoneNode);
            }
            treeData.add(projectNode);
        }
        system.debug(treeData);
        return treeData;
        
    }
}
