import { EmailTemplateType } from "../types/EmailTemplateType";

export const defaultEmailTemplateDef = {
  [EmailTemplateType.WelcomeClient]: {
    vars: ['website', 'toWhom', 'email', 'url'],
    subject: '[Ziledin] Welcome to join Ziledin',
    body: `Dear {{toWhom}}
    <br/>
Thank you very much for joining Ziledin.
<br/>
Your user name is <strong>{{email}}</strong>
`,
  },
  [EmailTemplateType.WelcomeOrg]: {
    vars: ['website', 'toWhom', 'email', 'url'],
    subject: '[Ziledin] Welcome to join Ziledin',
    body: `Dear {{toWhom}}
    <br/>
Thank you very much for joining Ziledin.
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
    subject: '[Ziledin] Invitation to Join Organisation',
    body: `Dear {{toWhom}}
<br/>
You are invited to join <strong>{{org}}</strong> as a member in Ziledin. Your user name is {{email}}.
<br/>
Please click below link to accept the invite.
{{url}}
`,
  },
  [EmailTemplateType.InviteClientUser]: {
    vars: ['website', 'toWhom', 'email', 'url', 'org'],
    subject: '[Ziledin] Invitation',
    body: `Dear {{toWhom}}
    <br/>
You are invited to join in Ziledin. Your user name is {{email}}.
<br/>
Please click below link to accept the invite.
{{url}}
`,
  },
  [EmailTemplateType.ResetPassword]: {
    vars: ['website', 'toWhom', 'email', 'url',],
    subject: '[Ziledin] Reset Password',
    body: `Dear {{toWhom}}
    <br/>
Please click below link to reset your password.
<br/>
{{url}}
`,
  },
  [EmailTemplateType.CreatedPortfolio]: {
    vars: ['website', 'toWhom', 'email', 'url', 'portfolioName'],
    subject: '[Ziledin] Created Portfolio',
    body: `Dear {{toWhom}}
    <br/>
Congratulations! Your portfolio {{portfolioName}} was created.
`,
  },
  [EmailTemplateType.RequireClientAuthorizing]: {
    vars: ['website', 'toWhom', 'email', 'okUrl', 'ngUrl', 'orgName'],
    subject: '[Ziledin] Authorize Organization',
    body: `Dear {{toWhom}}
    <br/>
Organization <strong>{{orgName}}</strong> is asking to access your portfolios.
<br/>
Clicking to {{url}} to approve or reject.
`,
  },
  [EmailTemplateType.TaskCreated]: {
    vars: ['website', 'toWhom', 'taskName', 'directUrl', 'orgName'],
    subject: '[Ziledin] Task Created',
    body: `Dear {{toWhom}}
<p>
    Organization <strong>{{orgName}}</strong> created a task {{taskName}} for you. Please use below link to access the task.
</p>
    <br/>
{{directUrl}}

`,
  },
}
