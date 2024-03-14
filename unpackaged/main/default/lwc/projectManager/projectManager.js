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
        { type: 'date', fieldName: 'dueDate', label: 'Due Date'},
        { type: 'text', fieldName: 'owner', label: 'Owner', initialWidth: 300},
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

    connectedCallback() {
        this.refreshData();
    }

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

    processTreeData(data) {
        return data.map(project => {
            project.recordUrl = this.constructRecordUrl(project.name, 'Project__c');
            if (project._children && project._children.length > 0) {
                project._children = project._children.map(milestone => {
                    milestone.recordUrl = this.constructRecordUrl(milestone.name, 'Milestone__c');
                    if (!milestone._children || milestone._children.length === 0) {
                        delete milestone._children;
                    } else {
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
                delete project._children;
            }
            return project;
        });
    }

    constructRecordUrl(recordId, objectApiName) {
        return `/lightning/r/${objectApiName}/${recordId}/view`;
    }

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
    
    async handleRowAction(event) {
        const { action: { name: actionName }, row } = event.detail;
        this.isLoading = true;
    
        try {
            switch (actionName) {
                case 'create_issue':
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

    navigateToNewProject() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Project__c',
                actionName: 'new'
            }
        });
    }

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
