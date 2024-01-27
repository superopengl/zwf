import { EmailTemplateType } from "../types/EmailTemplateType";

export const defaultEmailTemplateDef = {
  [EmailTemplateType.WelcomeClient]: {
    vars: ['website', 'toWhom', 'email', 'url'],
    subject: '[ZeeWorkflow] Welcome to join ZeeWorkflow',
    body: `Dear {{toWhom}}
    <br/>
Thank you very much for joining ZeeWorkflow.
<br/>
Your user name is <strong>{{email}}</strong>
`,
  },
  [EmailTemplateType.WelcomeOrg]: {
    vars: ['website', 'toWhom', 'email', 'url'],
    subject: '[ZeeWorkflow] Welcome to join ZeeWorkflow',
    body: `Dear {{toWhom}}
    <br/>
Thank you very much for joining ZeeWorkflow.
<br/>
Your user name is <strong>{{email}}</strong> and you are the administrator user.
<br/>
Please use below link to complete creating your organisation.
<br/>
{{url}}
`,
  },
  [EmailTemplateType.InviteOrgMember]: {
    vars: ['website', 'toWhom', 'email', 'url', 'org'],
    subject: '[ZeeWorkflow] Invitation to Join Organization',
    body: `Dear {{toWhom}}
<br/>
You are invited to join <strong>{{org}}</strong> as a member in ZeeWorkflow. Your user name is {{email}}.
<br/>
Please click below link to accept the invite.
{{url}}
`,
  },
  [EmailTemplateType.InviteClientUser]: {
    vars: ['website', 'toWhom', 'email', 'url', 'org'],
    subject: '[ZeeWorkflow] Invitation',
    body: `Dear {{toWhom}}
    <br/>
You are invited to join in ZeeWorkflow. Your user name is {{email}}.
<br/>
Please click below link to accept the invite.
{{url}}
`,
  },
  [EmailTemplateType.ResetPassword]: {
    vars: ['website', 'toWhom', 'email', 'url',],
    subject: '[ZeeWorkflow] Set Password',
    body: `Dear {{toWhom}}
    <br/>
Please click below link to reset your password.
<br/>
{{url}}
`,
  },
  [EmailTemplateType.RequireClientAuthorizing]: {
    vars: ['website', 'toWhom', 'email', 'okUrl', 'ngUrl', 'orgName'],
    subject: '[ZeeWorkflow] Authorize Organization',
    body: `Dear {{toWhom}}
    <br/>
Organization <strong>{{orgName}}</strong> is asking to access your portfolios.
<br/>
Clicking to {{url}} to approve or reject.
`,
  },
  [EmailTemplateType.TaskCreated]: {
    vars: ['website', 'toWhom', 'taskName', 'directUrl', 'orgName'],
    subject: '[ZeeWorkflow] Task Created',
    body: `Dear {{toWhom}}
<p>
    Organization <strong>{{orgName}}</strong> created a task {{taskName}} for you. Please use below link to access the task.
</p>
    <br/>
{{directUrl}}

`,
  },
}
