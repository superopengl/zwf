import { EmailTemplateType } from "../types/EmailTemplateType";

const defaultEmailTemplateDef = {
  [EmailTemplateType.WelcomeClient]: {
    vars: ['website', 'toWhom', 'email', 'url'],
    subject: '[Filedin] Welcome to join Filedin',
    body: `Dear {{toWhom}}
    <br/>
Thank you very much for joining Filedin.
<br/>
Your user name is <strong>{{email}}</strong>
`,
  },
  [EmailTemplateType.WelcomeOrg]: {
    vars: ['website', 'toWhom', 'email', 'url', 'org'],
    subject: '[Filedin] Welcome to join Filedin',
    body: `Dear {{toWhom}}
    <br/>
Thank you very much for joining Filedin.
<br/>
Your user name is <strong>{{email}}</strong> and you are the administrator user of your organisation <strong>{{org}}</strong>.
`,
  },
  [EmailTemplateType.InviteOrgMember]: {
    vars: ['website', 'toWhom', 'email', 'url', 'org'],
    subject: '[Filedin] Invitation to Join Organisation',
    body: `Dear {{toWhom}}
<br/>
You are invited to join <strong>{{org}}</strong> as a member in Filedin. Your user name is {{email}}.
<br/>
Please click below link to accept the invite.
{{url}}
`,
  },
  [EmailTemplateType.InviteClientUser]: {
    vars: ['website', 'toWhom', 'email', 'url', 'org'],
    subject: '[Filedin] Invitation',
    body: `Dear {{toWhom}}
    <br/>
You are invited to join in Filedin. Your user name is {{email}}.
<br/>
Please click below link to accept the invite.
{{url}}
`,
  },
  [EmailTemplateType.ResetPassword]: {
    vars: ['website', 'toWhom', 'email', 'url',],
    subject: '[Filedin] Reset Password',
    body: `Dear {{toWhom}}
    <br/>
Please click below link to reset your password.
<br/>
{{url}}
`,
  },
  [EmailTemplateType.CreatedPortfolio]: {
    vars: ['website', 'toWhom', 'email', 'url', 'portfolioName'],
    subject: '[Filedin] Created Portfolio',
    body: `Dear {{toWhom}}
    <br/>
Congratulations! Your portfolio {{portfolioName}} was created.
`,
  },
}

export default defaultEmailTemplateDef;