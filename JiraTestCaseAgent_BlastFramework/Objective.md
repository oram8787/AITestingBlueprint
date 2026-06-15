# Objective

Given a JIRA issue ID (e.g., KAN-1), automatically generate 8–12 structured, detailed test cases in a React UI using the Groq AI API.

Each test case includes: ID, Module, Title, Description, Type, Priority, Preconditions, Test Data, Steps, Expected Result, Actual Result (blank), and Status (Not Run).

Credentials are shared from the sibling `JiraTestPlanAgent_BlastFramework/.env` file.
