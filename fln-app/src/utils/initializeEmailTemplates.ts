import { EmailTemplate } from "../entity/EmailTemplate";
import { getManager } from 'typeorm';
import { EmailTemplateType } from "../types/EmailTemplateType";
import { Locale } from '../types/Locale';

export async function initializeEmailTemplates() {
  const signatureDef = new EmailTemplate();
  signatureDef.key = EmailTemplateType.Signature;
  signatureDef.locale = Locale.Engish;

  const signUpEmailDef = new EmailTemplate();
  signUpEmailDef.key = EmailTemplateType.SignUp;
  signUpEmailDef.locale = Locale.Engish;
  signUpEmailDef.vars = ['website', 'email', 'url'];

  const resetPasswordEmailDef = new EmailTemplate();
  resetPasswordEmailDef.key = EmailTemplateType.ResetPassword;
  resetPasswordEmailDef.locale = Locale.Engish;
  resetPasswordEmailDef.vars = ['website', 'toWhom', 'url'];

  const inviteUserEmailDef = new EmailTemplate();
  inviteUserEmailDef.key = EmailTemplateType.InviteUser;
  inviteUserEmailDef.locale = Locale.Engish;
  inviteUserEmailDef.vars = ['website', 'toWhom', 'email', 'url'];

  const googleSsoWelcomeEmailDef = new EmailTemplate();
  googleSsoWelcomeEmailDef.key = EmailTemplateType.GoogleSsoWelcome;
  googleSsoWelcomeEmailDef.locale = Locale.Engish;
  googleSsoWelcomeEmailDef.vars = ['website', 'toWhom'];

  const deleteUserEmailDef = new EmailTemplate();
  deleteUserEmailDef.key = EmailTemplateType.DeleteUser;
  deleteUserEmailDef.locale = Locale.Engish;
  deleteUserEmailDef.vars = ['website', 'toWhom', 'email'];

  const contactEmailDef = new EmailTemplate();
  contactEmailDef.key = EmailTemplateType.Contact;
  contactEmailDef.locale = Locale.Engish;
  contactEmailDef.vars = ['website', 'name', 'contact', 'message'];

  const commissionWithdrawalSubmittedEmailDef = new EmailTemplate();
  commissionWithdrawalSubmittedEmailDef.key = EmailTemplateType.CommissionWithdrawalSubmitted;
  commissionWithdrawalSubmittedEmailDef.locale = Locale.Engish;
  commissionWithdrawalSubmittedEmailDef.vars = ['website', 'toWhom', 'referenceId'];

  const commissionWithdrawalCompletedEmailDef = new EmailTemplate();
  commissionWithdrawalCompletedEmailDef.key = EmailTemplateType.CommissionWithdrawalCompleted;
  commissionWithdrawalCompletedEmailDef.locale = Locale.Engish;
  commissionWithdrawalCompletedEmailDef.vars = ['website', 'toWhom', 'referenceId', 'comment'];

  const commissionWithdrawalRejectedEmailDef = new EmailTemplate();
  commissionWithdrawalRejectedEmailDef.key = EmailTemplateType.CommissionWithdrawalRejected;
  commissionWithdrawalRejectedEmailDef.locale = Locale.Engish;
  commissionWithdrawalRejectedEmailDef.vars = ['website', 'toWhom', 'referenceId', 'comment'];

  const WatchlistCoreDataChangedEmailDef = new EmailTemplate();
  WatchlistCoreDataChangedEmailDef.key = EmailTemplateType.WatchlistCoreDataChangedEmail;
  WatchlistCoreDataChangedEmailDef.locale = Locale.Engish;
  WatchlistCoreDataChangedEmailDef.vars = ['website', 'toWhom', 'symbol'];

  const SubscriptionExpiredDef = new EmailTemplate();
  SubscriptionExpiredDef.key = EmailTemplateType.SubscriptionExpired;
  SubscriptionExpiredDef.locale = Locale.Engish;
  SubscriptionExpiredDef.vars = ['website', 'toWhom', 'subscriptionId', 'subscriptionType', 'start', 'end'];

  const SubscriptionExpiringDef = new EmailTemplate();
  SubscriptionExpiringDef.key = EmailTemplateType.SubscriptionExpiring;
  SubscriptionExpiringDef.locale = Locale.Engish;
  SubscriptionExpiringDef.vars = ['website', 'toWhom', 'subscriptionId', 'subscriptionType', 'start', 'end'];

  const SubscriptionRecurringAutoPaySucceededDef = new EmailTemplate();
  SubscriptionRecurringAutoPaySucceededDef.key = EmailTemplateType.SubscriptionRecurringAutoPaySucceeded;
  SubscriptionRecurringAutoPaySucceededDef.locale = Locale.Engish;
  SubscriptionRecurringAutoPaySucceededDef.vars = ['website', 'toWhom', 'subscriptionId', 'subscriptionType', 'start', 'end', 'paidAmount', 'creditDeduction'];

  const SubscriptionRecurringAutoPayFailedDef = new EmailTemplate();
  SubscriptionRecurringAutoPayFailedDef.key = EmailTemplateType.SubscriptionRecurringAutoPayFailed;
  SubscriptionRecurringAutoPayFailedDef.locale = Locale.Engish;
  SubscriptionRecurringAutoPayFailedDef.vars = ['website', 'toWhom', 'subscriptionId', 'subscriptionType', 'start', 'end', 'paidAmount', 'creditDeduction'];

  const entities = [
    signatureDef,
    signUpEmailDef,
    resetPasswordEmailDef,
    inviteUserEmailDef,
    googleSsoWelcomeEmailDef,
    deleteUserEmailDef,
    contactEmailDef,
    commissionWithdrawalSubmittedEmailDef,
    commissionWithdrawalCompletedEmailDef,
    commissionWithdrawalRejectedEmailDef,
    WatchlistCoreDataChangedEmailDef,
    SubscriptionExpiredDef,
    SubscriptionExpiringDef,
    SubscriptionRecurringAutoPaySucceededDef,
    SubscriptionRecurringAutoPayFailedDef,
  ];

  await getManager()
    .createQueryBuilder()
    .insert()
    .into(EmailTemplate)
    .values(entities)
    .onConflict(`(key, locale) DO NOTHING`)
    .execute();
}
