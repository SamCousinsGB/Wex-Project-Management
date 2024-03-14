import { LightningElement, wire, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getProjectData from '@salesforce/apex/ProjectManagerController.getProjectData';
import deleteIssue from '@salesforce/apex/ProjectManagerController.deleteIssue';
import deleteMilestone from '@salesforce/apex/ProjectManagerController.deleteMilestone';
import deleteProject from '@salesforce/apex/ProjectManagerController.deleteProject';
import updateIssueStatus from '@salesforce/apex/ProjectManagerController.updateIssueStatus';

export default class ProjectManager extends NavigationMixin(LightningElement) {
    // Define the data structure for displaying lightning-tree-grid columns
    @track columns = [
        {
            type: 'text',
            fieldName: 'typeLabel',
            label: 'Type',
            initialWidth: 300,
            cellAttributes: {
                iconName: { fieldName: 'typeIcon' },
                iconPosition: 'left'
            }
        },
        {
            type: 'url',
            fieldName: 'recordUrl',
            label: 'Name',
            typeAttributes: {
                label: { fieldName: 'label' },
                target: '_blank'
            }
        },
        { type: 'text', fieldName: 'status', label: 'Status'},
        { type: 'text', fieldName: 'percentageComplete', label: '% Complete', cellAttributes: { alignment: 'left' } },
        { type: 'date', fieldName: 'expectedDueDate', label: 'Expected Due Date', initialWidth: 300},
        {
            type: 'date',
            fieldName: 'dueDate',
            label: 'Due Date',
            cellAttributes: {
                iconName: { fieldName: 'dueDateStyle' },
                iconPosition: 'left'
            }
        },
        {
            type: 'action',
            typeAttributes: {
                rowActions: this.getRowActions.bind(this),
            },
            label: '',
            initialWidth: 300
        }
    ];
    
    @track isLoading = true;
    @track treeData;
    wiredProjectsResponse;

    // Lifecycle hook to initiate data loading on component load
    connectedCallback() {
        this.refreshData();
    }

    // Wire service to call Apex method and fetch project data
    @wire(getProjectData)
    wiredProjects(result) {
        this.wiredProjectsResponse = result; // Store the entire response
        const { data, error } = result;
        if (data) {
            this.treeData = this.processTreeData(JSON.parse(JSON.stringify(data)));
            this.isLoading = false;
        } else if (error) {
            this.showToast('Error loading projects', error.body.message, 'error');
            this.isLoading = false;
        }
    }   

    // Processes response data from the apex controller into a format suitable lightning-tree-grid
    processTreeData(data) {
        // Iterates over each project to modify its structure for compatibility with lightning-tree-grid.
        // The structure needs modification to include a record URL for navigation and potentially remove
        // unnecessary child arrays if they are empty.
        return data.map(project => {
            // Constructs a URL for each project record. This URL enables navigation to the project's detail page
            // directly from the lightning-tree-grid component.
            project.recordUrl = this.constructRecordUrl(project.name, 'Project__c');

            // Checks if the project has associated milestones (_children). If it does, each milestone is processed similarly.
            if (project._children && project._children.length > 0) {
                project._children = project._children.map(milestone => {
                    // Constructs a URL for each milestone, enabling direct navigation from the name column.
                    milestone.recordUrl = this.constructRecordUrl(milestone.name, 'Milestone__c');

                    // If a milestone does not have associated issues (_children), the empty _children array is deleted
                    // to ensures the tree grid does not display expandable icons for
                    // milestones without issues.
                    if (!milestone._children || milestone._children.length === 0) {
                        delete milestone._children;
                    } else {
                        // For milestones with issues, each issue is processed to include a navigation URL.
                        milestone._children = milestone._children.map(issue => {
                            return {
                                ...issue,
                                recordUrl: this.constructRecordUrl(issue.name, 'Issue__c')
                            };
                        });
                    }
                    return milestone;
                });
            } else {
                // If a project does not have any milestones, the empty _children array is removed. This prevents the
                // tree grid from showing an expandable icon next to projects that do not have any milestones.
                delete project._children;
            }
            return project;
        });
    }


    // Helper function to construct a URL for navigating to a specific record
    constructRecordUrl(recordId, objectApiName) {
        return `/lightning/r/${objectApiName}/${recordId}/view`;
    }

    // Determines the row actions based on the type of record (Project, Milestone, Issue)
    getRowActions(row, doneCallback) {
        let actions = [];
        if (row.typeLabel === 'Project') {
            actions = [
                { label: 'Edit', name: 'edit_project' },
                { label: 'Delete', name: 'delete_project' },
                { label: 'Create Milestone', name: 'create_milestone' }
            ];
        } else if (row.typeLabel === 'Milestone') {
            actions = [
                { label: 'Edit', name: 'edit_milestone' },
                { label: 'Delete', name: 'delete_milestone' },
                { label: 'Create Issue', name: 'create_issue' }
            ];
        } else if (row.typeLabel === 'Issue') {
            actions = [
                { label: 'Edit', name: 'edit_issue' },
                { label: 'Delete', name: 'delete_issue' },
                { label: 'Mark as Complete', name: 'mark_complete' },
                { label: 'Mark as In Progress', name: 'mark_in_progress' },
                { label: 'Mark as Not Started', name: 'mark_not_started' }
            ];
        }
        doneCallback(actions);
    }
    
    // Handles actions triggered from the row action
    async handleRowAction(event) {
        const { action: { name: actionName }, row } = event.detail;
        this.isLoading = true;
    
        try {
            switch (actionName) {
                case 'create_issue':
                    console.log(row.name);
                this[NavigationMixin.Navigate]({
                    type: 'standard__objectPage',
                    attributes: {
                        objectApiName: 'Issue__c',
                        actionName: 'new'
                    },
                    state: {
                        defaultFieldValues: `Milestone__c=${row.name}`
                    }
                });
                break;
                case 'create_milestone':
                    console.log(row.name);
                this[NavigationMixin.Navigate]({
                    type: 'standard__objectPage',
                    attributes: {
                        objectApiName: 'Milestone__c',
                        actionName: 'new'
                    },
                    state: {
                        defaultFieldValues: `Project__c=${row.name}`
                    }
                });
                case 'edit_project':
                case 'edit_milestone':
                case 'edit_issue':
                    // Redirect to the record's page for editing
                    this[NavigationMixin.Navigate]({
                        type: 'standard__recordPage',
                        attributes: {
                            recordId: row.name,
                            actionName: 'edit'
                        }
                    });
                    break;
                case 'delete_project':
                    await deleteProject({ projectId: row.name });
                    this.showToast('Deleted', 'Project Deleted', 'success');
                    break;
                case 'delete_milestone':
                    await deleteMilestone({ milestoneId: row.name });
                    this.showToast('Deleted', 'Milestone Deleted', 'success');
                    break;
                case 'delete_issue':
                    await deleteIssue({ issueId: row.name });
                    this.showToast('Deleted', 'Issue Deleted', 'success');
                    break;
                case 'mark_complete':
                    await updateIssueStatus({ issueId: row.name, newStatus: 'Complete' });
                    break;
                case 'mark_in_progress':
                    await updateIssueStatus({ issueId: row.name, newStatus: 'In Progress' });
                    break;
                case 'mark_not_started':
                    await updateIssueStatus({ issueId: row.name, newStatus: 'Not Started' });
                    break;
                default:
                    console.log(`Unhandled action: ${actionName}`);
            }
        } catch (error) {
            this.showToast('Error', `Failed to execute action: ${error.body.message}`, 'error');
        } finally {
            // Refreshes data after action completion
            this.refreshData();
            this.isLoading = false;
        }
    }
    
    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }

    // Navigation logic for create project button
    navigateToNewProject() {
        console.log('called new project');
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Project__c',
                actionName: 'new'
            }
        });
    }

    // Refreshes the data by re-calling the Apex method
    refreshData() {
        this.isLoading = true;
        refreshApex(this.wiredProjectsResponse).then(() => {
            this.isLoading = false;
        }).catch(error => {
            this.showToast('Error', `Error refreshing data: ${error.body.message}`, 'error');
            this.isLoading = false;
        });
    }
    
}
