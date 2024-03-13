import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getProjectData from '@salesforce/apex/ProjectManagerController.getProjectData';

export default class ProjectManager extends NavigationMixin(LightningElement) {
    @track columns = [
        { 
            type: 'text', 
            fieldName: 'label', 
            label: 'Name'
        },
        { 
            type: 'text', 
            fieldName: 'status', 
            label: 'Status', 
            cellAttributes: { 
                iconName: { fieldName: 'statusIconName' }, 
                iconPosition: 'right' 
            } 
        }
    ];
    

    @track treeData;

    @wire(getProjectData)
wiredProjects({ error, data }) {
    if (data) {
        console.log(JSON.stringify(data));
        this.treeData = data;
    } else if (error) {
        console.error('Error:', error);
        this.showToast('Error loading projects', error.body.message, 'error');
    }
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

    //MixIn to the created project record page
    handleProjectCreated(event) {
        const projectId = event.detail.id;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: projectId,
                objectApiName: 'Project__c',
                actionName: 'view'
            }
        });
    }
}
