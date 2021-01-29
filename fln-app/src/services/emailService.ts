import * as aws from 'aws-sdk';
import { awsConfig } from '../utils/awsConfig';
import { assert } from '../utils/assert';
import * as _ from 'lodash';
import * as nodemailer from 'nodemailer';
import * as Email from 'email-templates';
import * as path from 'path';
import { logError } from '../utils/logger';

let emailerInstance = null;
export const SYSTEM_EMAIL_SENDER = 'AU Accounting Office <info@filedin.io>';

function getEmailer() {
  if (!emailerInstance) {
    awsConfig();
    const transport = nodemailer.createTransport({
      SES: new aws.SES({ apiVersion: '2010-12-01' })
    });

    emailerInstance = new Email({
      preview: false,
      send: true,
      transport,
    });
  }
  return emailerInstance;
}

export function sendEmail(req: EmailRequest) {
  const { to, template, vars, bcc, attachments } = req;
  assert(to, 400, 'Email recipient is not specified');
  assert(template, 400, 'Email template is not specified');

  const locals = {
    website: process.env.FLN_DOMAIN_NAME,
    ...vars
  };

  const bccAddresses = bcc?.filter(b => !!b);

  getEmailer().send({
    template: path.join(__dirname, 'emailTemplates', template),
    locals,
    message: {
      from: SYSTEM_EMAIL_SENDER,
      bcc: bccAddresses?.length ? bccAddresses : undefined,
      to,
      attachments
    }
  }).catch(err => logError(err, req, null, 'Sending email error'));
}



export class EmailRequest {
  to: string;
  template: string;
  vars: object;
  attachments?: { filename: string, path: string }[];
  bcc?: string[];
}

// function sanitizeVars(vars) {
//   const sanitized = {};
//   Object.entries(vars).forEach(([k, v]) => sanitized[k] = _.isString(v) ? sanitizeHtml(v) : v);
//   return sanitized;
// }

// export async function sendEmail2(req: EmailRequest) {
//   assert(req.to, 400, 'Email recipient is not specified');
//   const template = templates[req.template];
//   assert(template, 404, `Email template '${req.template}' is not found`);

//   const body = template.body(sanitizeVars(req.vars));
//   awsConfig();

//   const ses = new aws.SES({ apiVersion: '2010-12-01' });

//   const params = {
//     Destination: {
//       CcAddresses: [],
//       ToAddresses: [req.to],
//       BccAddresses: req.shouldBcc ? ['info@filedin.io'] : []
//     },
//     Message: {
//       Body: {
//         Html: {
//           Charset: 'UTF-8',
//           Data: body
//         },
//         // Text: {
//         //   Charset: 'UTF-8',
//         //   Data: body
//         // }
//       },
//       Subject: {
//         Charset: 'UTF-8',
//         Data: template.subject
//       }
//     },
//     Source: 'AU Accounting Office <info@filedin.io>',
//     ReplyToAddresses: ['AU Accounting Office <info@filedin.io>'],
//   };

//   const sesRequest = ses.sendEmail(params).promise();
//   await sesRequest;
// }