import { getUtcNow } from './../utils/getUtcNow';
import { db } from './../db';
import { SYSTEM_EMAIL_SENDER, SYSTEM_EMAIL_BCC } from './../utils/constant';
import * as aws from 'aws-sdk';
import { awsConfig } from '../utils/awsConfig';
import { assert } from '../utils/assert';
import * as _ from 'lodash';
import * as nodemailer from 'nodemailer';
import { logError } from '../utils/logger';
import { EmailRequest } from '../types/EmailRequest';
import * as handlebars from 'handlebars';
import { htmlToText } from 'html-to-text';
import { EmailLog } from '../entity/EmailLog';
import errorToJson from 'error-to-json';
import { EmailTemplateType } from '../types/EmailTemplateType';
import { User } from '../entity/User';
import { getEmailRecipientName } from '../utils/getEmailRecipientName';
import { EmailSentOutTask } from '../entity/EmailSentOutTask';
import 'colors';
import { getEmailTemplate } from './mjmlService';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';
import { EntityManager } from 'typeorm';

let emailTransporter = null;

function getEmailer() {
  if (!emailTransporter) {
    awsConfig();
    emailTransporter = nodemailer.createTransport({
      SES: new aws.SES({ apiVersion: '2010-12-01' })
    });
  }
  return emailTransporter;
}

async function composeEmailOption(req: EmailRequest) {
  const { orgId } = req;
  const { subject, text, html } = await compileEmailBody(req);

  return {
    from: req.from || SYSTEM_EMAIL_SENDER,
    to: req.to,
    bcc: req.shouldBcc ? SYSTEM_EMAIL_BCC : undefined,
    subject: subject,
    text: text,
    html: html,
  };
}

async function compileEmailBody(req: EmailRequest) {
  const { orgId, template, vars } = req;
  const emailTemplate = await getEmailTemplate(template as EmailTemplateType);
  const subject = emailTemplate.subject || 'System notification';
  const body = emailTemplate.html || '';

  const allVars = {
    ...vars,
    website: process.env.ZWF_API_DOMAIN_NAME,
    random_salt: uuidv4(),
    year: moment().year(),
  };

  const compiledBody = handlebars.compile(body);
  const html = compiledBody(allVars);

  return { subject, html, text: htmlToText(html) };
}

async function sendEmailImmediately(req: EmailRequest) {
  const { to, template, vars } = req;
  assert(to, 400, 'Email recipient is not specified');
  assert(template, 400, 'Email template is not specified');

  let log: EmailLog = null;
  const emailLogRepo = db.getRepository(EmailLog);
  try {
    const option = await composeEmailOption(req);
    log = new EmailLog();
    log.email = option.to;
    log.templateKey = req.template;
    log.vars = req.vars;

    await getEmailer().sendMail(option);

    await emailLogRepo.insert(log);
    console.log('Sent out email to'.green, to);
  } catch (err) {
    console.log('Sent out email error'.red, err.message);
    if (log) {
      log.error = err;
      await emailLogRepo.insert(log);
    } else {
      logError(err, req, null, 'Sending email error', to, template, vars);
    }
    throw err;
  }
}

export async function sendEmail(req: EmailRequest) {
  const { orgId, to, template } = req;
  assert(to, 400, 'Email recipient is not specified');
  assert(template, 400, 'Email template is not specified');

  const task = new EmailSentOutTask();
  task.from = req.from || SYSTEM_EMAIL_SENDER;
  task.to = req.to;
  task.template = req.template;
  task.vars = req.vars;
  task.attachments = req.attachments;
  task.shouldBcc = req.shouldBcc;

  try {
    // Try to send immediately first
    await sendEmailImmediately(req);
    task.sentAt = getUtcNow(); // Mark this email was sent out. So the emailer will skip this task.
  } catch {
    // Do nothing;
  }

  await db.getRepository(EmailSentOutTask).insert(task);
}

export async function sendEmailForUserId(userId: string, template: EmailTemplateType, vars: object) {
  try {
    const user = await db.getRepository(User).findOne({ where: { id: userId }, relations: { profile: true } });
    if (!user) {
      return;
    }
    const toWhom = getEmailRecipientName(user);
    const { profile: { email } } = user;
    const request: EmailRequest = {
      to: email,
      template,
      vars: {
        ...vars,
        toWhom
      }
    };
    await enqueueEmailInBulk(db.manager, [request]);
  } catch (err) {
    console.log('Sent out email error'.red, errorToJson(err));
    logError(err, null, null, 'Sending email error', userId, template, vars);
  }
}

export async function enqueueEmailInBulk(m: EntityManager, emailRequests: EmailRequest[]) {
  const defaultFrom = 'noreply@zeeworkflow.com';
  const entities: EmailSentOutTask[] = [];
  for (const req of emailRequests) {
    const { to, template } = req;
    assert(to, 400, 'Email recipient is not specified');
    assert(template, 400, 'Email template is not specified');

    const emailTask = new EmailSentOutTask();
    emailTask.from = req.from || defaultFrom;
    emailTask.to = req.to;
    emailTask.template = req.template;
    emailTask.vars = req.vars;
    emailTask.attachments = req.attachments;
    emailTask.shouldBcc = req.shouldBcc;

    entities.push(emailTask);
  }

  if (entities.length) {
    await m.save(entities);
  }
}


