import * as aws from 'aws-sdk';
import { awsConfig } from '../utils/awsConfig';
import { assert } from '../utils/assert';
import * as _ from 'lodash';
import * as nodemailer from 'nodemailer';
import { logError } from '../utils/logger';
import { EmailRequest } from '../types/EmailRequest';
import { Locale } from '../types/Locale';
import { getRepository, IsNull } from 'typeorm';
import { SystemEmailTemplate } from '../entity/SystemEmailTemplate';
import * as handlebars from 'handlebars';
import { htmlToText } from 'html-to-text';
import { getConfigValue } from './configService';
import { EmailLog } from '../entity/EmailLog';
import errorToJson from 'error-to-json';
import { EmailTemplateType } from '../types/EmailTemplateType';
import { User } from '../entity/User';
import { getEmailRecipientName } from '../utils/getEmailRecipientName';
import { EmailSentOutTask } from '../entity/EmailSentOutTask';
import 'colors';
import { SystemEmailSignature } from '../entity/SystemEmailSignature';
import { OrgEmailTemplate } from '../entity/OrgEmailTemplate';
import { OrgEmailSignature } from '../entity/OrgEmailSignature';

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

async function getEmailTemplate(orgId: string, templateName: string, locale: Locale): Promise<SystemEmailTemplate> {
  if (!locale) {
    locale = Locale.Engish;
  }

  const template = orgId ? await getRepository(OrgEmailTemplate).findOne({
    orgId,
    key: templateName,
    locale
  }) : await getRepository(SystemEmailTemplate).findOne({
    key: templateName,
    locale
  });

  assert(template, 500, `Cannot find email template for key ${templateName} and locale ${locale}`);

  return template;
}

async function getEmailSignature(orgId: string, locale: Locale): Promise<string> {
  if (!locale) {
    locale = Locale.Engish;
  }

  const item = orgId ? await getRepository(OrgEmailSignature).findOne({
    orgId,
    locale
  }) : await getRepository(SystemEmailSignature).findOne({
    locale
  });

  return item?.body || '';
}

async function composeEmailOption(req: EmailRequest) {
  const { orgId } = req;
  const { subject, text, html } = await compileEmailBody(req);

  return {
    from: req.from || await getConfigValue(orgId, 'email.sender.noreply'),
    to: req.to,
    bcc: req.shouldBcc ? await getConfigValue(orgId, 'email.sender.bcc') : undefined,
    subject: subject,
    text: text,
    html: html,
  };
}

async function compileEmailBody(req: EmailRequest) {
  const { orgId, template, vars, locale } = req;
  const emailTemplate = await getEmailTemplate(orgId, template, locale);
  const subject = emailTemplate.subject || 'Un-subject';
  const body = emailTemplate.body || '';
  const signature = await getEmailSignature(orgId, locale);

  const allVars = {
    website: process.env.ZDN_API_DOMAIN_NAME,
    ...vars
  };

  const compiledBody = handlebars.compile(body);
  const html = compiledBody(allVars) + signature;

  return { subject, html, text: htmlToText(html) };
}

export async function sendEmail(req: EmailRequest) {
  const { to, template, vars } = req;
  assert(to, 400, 'Email recipient is not specified');
  assert(template, 400, 'Email template is not specified');

  let log: EmailLog = null;
  const emailLogRepo = getRepository(EmailLog);
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

export async function enqueueEmail(req: EmailRequest) {
  const { orgId, to, template } = req;
  assert(to, 400, 'Email recipient is not specified');
  assert(template, 400, 'Email template is not specified');

  const task = new EmailSentOutTask();
  task.from = req.from || await getConfigValue(orgId, 'email.sender.noreply');
  task.to = req.to;
  task.template = req.template;
  task.vars = req.vars;
  task.attachments = req.attachments;
  task.shouldBcc = req.shouldBcc;
  await getRepository(EmailSentOutTask).insert(task);
}

export async function enqueueEmailToUserId(userId: string, template: EmailTemplateType, vars: object) {
  try {
    const user = await getRepository(User).findOne(userId, { relations: ['profile'] });
    if (!user) {
      return;
    }
    const toWhom = getEmailRecipientName(user.profile);
    const { profile: { email } } = user;
    const request: EmailRequest = {
      to: email,
      template,
      vars: {
        ...vars,
        toWhom
      }
    };
    await enqueueEmail(request);
  } catch (err) {
    console.log('Sent out email error'.red, errorToJson(err));
    logError(err, null, null, 'Sending email error', userId, template, vars);
  }
}


