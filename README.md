# Wex-Project-Management

## Introduction
This Lightning Web Component is designed for Salesforce to help manage projects, milestones, and issues in a hierarchical, easy-to-navigate interface. It provides Salesforce users with a comprehensive overview of project progress, including status updates, owner details, and completion percentages, directly within their Salesforce environment using the Wex Project Management Application.

## Features
- Create Projects, Milestones, and Issues.
- Track completion percentage across all your projects.
- Easily manage issues in an easy-to-use interface.

## Screenshots

### Application Home
![LWC Home Page](images/Intro.png)<br><br>
 
### Data Model
![Data Model](images/erd.png)<br><br>  

### LWC Component Diagram
![UML](images/lwc-uml.png)<br><br> 

## Installation Guide
To use this app, follow these steps:
#### 1. Install unlocked package:
[Package Install Link (Sandbox Only)](https://login.salesforce.com/packaging/installPackage.apexp?p0=04tQy0000000niHIAQ)<br><br>

#### 2. Setup Permissions
- **Project Manager Permission Set**: Assign this permission set to users who need full access to create, modify, and delete projects, milestones, and issues.
- **Project Viewer Permission Set**: Assign this to users requiring view-only access to projects, milestones, and issues.<br><br>

#### 3. Navigate to the "Wex Projects" Lightning Application
![Lightning App](images/app.png)<br><br>

## Application Usage

The home tab contains the Project Manager LWC.
1. Click the blue button "Create Project" to create a new project.
   ![Create Project](images/newproject.png)<br><br>
   
2. Enter a Project Name in the Modal that appears and click Save. You can also enter an expected due date, and the LWC will alert you when your project is late!
   ![Project Modal](images/newprojectmodal.png)<br><br>
   
3. You will then be directed to the new project record. You can create milestones here, using either the quick action or the milestones related list.
   ![New Project Record](images/newprojectrecord.png)<br><br>
   
4. Navigate back to the "Home" tab, and click the action dropdown next to our newly created project.
   ![New Project Milestone LWC](images/newprojectmilestonelwc.png)<br><br>
   
5. This will launch the new Milestone modal. Enter all relevant information here and click save.
   ![New Milestone Modal](images/newmilestonemodal.png)<br><br>
   
6. You will be directed to the new milestone record. Navigate back to the home tab and expand the new project, and find the milestone we just created.<br><br>
   
7. Click on the action dropdown next to the milestone and click "Create Issue"
   ![New Project Issue LWC](images/newprojectissuelwc.png)<br><br>
   
8. This will, you guessed it, open the New Issue modal. Fill in all fields and click Save.
   ![New Issue Modal](images/newissuemodal.png)<br><br>
   
9. Navigate back to the home tab, and click on the action button next to our newly created issue. You'll be able to change the issue's progress as you wish.
   ![Update Issue](images/updateissue.png)<br><br>
   
10. Issues roll up to the parent milestone status. Milestone completion rolls up to the project status. When all issues and milestones are complete, the project will complete!
    ![Project Rollup](images/projectrollup.png)<br><br>
    
11. You're now ready to tackle some projects.<br><br>

12. Expected due date of a project is calculated from the latest due date of the project's milestones. If a milestone due date exceeds the expected due date defined on the project record, the manager will display a warning.
![DueDate](images/duedate.png)<br><br>

### Adding the Component to a New Page
1. Navigate to the Lightning App Builder.
2. Select the page you wish to add the Project Manager LWC to or create a new one.
3. Drag the Project Manager LWC from the list of available components to your desired location on the page.
4. Save and activate the page.
