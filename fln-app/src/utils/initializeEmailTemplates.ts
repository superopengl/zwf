import { SystemEmailTemplate } from "../entity/EmailTemplate";
import { getManager } from 'typeorm';
import { EmailTemplateType } from "../types/EmailTemplateType";
import { Locale } from '../types/Locale';

export async function initializeEmailTemplates() {
  const signUpEmailDef = new SystemEmailTemplate();
  signUpEmailDef.key = EmailTemplateType.SignUp;
  signUpEmailDef.locale = Locale.Engish;
  signUpEmailDef.vars = ['website', 'email', 'url'];

  const resetPasswordEmailDef = new SystemEmailTemplate();
  resetPasswordEmailDef.key = EmailTemplateType.ResetPassword;
  resetPasswordEmailDef.locale = Locale.Engish;
  resetPasswordEmailDef.vars = ['website', 'toWhom', 'url'];

  const inviteUserEmailDef = new SystemEmailTemplate();
  inviteUserEmailDef.key = EmailTemplateType.InviteUser;
  inviteUserEmailDef.locale = Locale.Engish;
  inviteUserEmailDef.vars = ['website', 'toWhom', 'email', 'url'];

  const googleSsoWelcomeEmailDef = new SystemEmailTemplate();
  googleSsoWelcomeEmailDef.key = EmailTemplateType.GoogleSsoWelcome;
  googleSsoWelcomeEmailDef.locale = Locale.Engish;
  googleSsoWelcomeEmailDef.vars = ['website', 'toWhom'];

  const deleteUserEmailDef = new SystemEmailTemplate();
  deleteUserEmailDef.key = EmailTemplateType.DeleteUser;
  deleteUserEmailDef.locale = Locale.Engish;
  deleteUserEmailDef.vars = ['website', 'toWhom', 'email'];

  const contactEmailDef = new SystemEmailTemplate();
  contactEmailDef.key = EmailTemplateType.Contact;
  contactEmailDef.locale = Locale.Engish;
  contactEmailDef.vars = ['website', 'name', 'contact', 'message'];

  const commissionWithdrawalSubmittedEmailDef = new SystemEmailTemplate();
  commissionWithdrawalSubmittedEmailDef.key = EmailTemplateType.CommissionWithdrawalSubmitted;
  commissionWithdrawalSubmittedEmailDef.locale = Locale.Engish;
  commissionWithdrawalSubmittedEmailDef.vars = ['website', 'toWhom', 'referenceId'];

  const commissionWithdrawalCompletedEmailDef = new SystemEmailTemplate();
  commissionWithdrawalCompletedEmailDef.key = EmailTemplateType.CommissionWithdrawalCompleted;
  commissionWithdrawalCompletedEmailDef.locale = Locale.Engish;
  commissionWithdrawalCompletedEmailDef.vars = ['website', 'toWhom', 'referenceId', 'comment'];

  const commissionWithdrawalRejectedEmailDef = new SystemEmailTemplate();
  commissionWithdrawalRejectedEmailDef.key = EmailTemplateType.CommissionWithdrawalRejected;
  commissionWithdrawalRejectedEmailDef.locale = Locale.Engish;
  commissionWithdrawalRejectedEmailDef.vars = ['website', 'toWhom', 'referenceId', 'comment'];

  const WatchlistCoreDataChangedEmailDef = new SystemEmailTemplate();
  WatchlistCoreDataChangedEmailDef.key = EmailTemplateType.WatchlistCoreDataChangedEmail;
  WatchlistCoreDataChangedEmailDef.locale = Locale.Engish;
  WatchlistCoreDataChangedEmailDef.vars = ['website', 'toWhom', 'symbol'];

  const SubscriptionExpiredDef = new SystemEmailTemplate();
  SubscriptionExpiredDef.key = EmailTemplateType.SubscriptionExpired;
  SubscriptionExpiredDef.locale = Locale.Engish;
  SubscriptionExpiredDef.vars = ['website', 'toWhom', 'subscriptionId', 'subscriptionType', 'start', 'end'];

  const SubscriptionExpiringDef = new SystemEmailTemplate();
  SubscriptionExpiringDef.key = EmailTemplateType.SubscriptionExpiring;
  SubscriptionExpiringDef.locale = Locale.Engish;
  SubscriptionExpiringDef.vars = ['website', 'toWhom', 'subscriptionId', 'subscriptionType', 'start', 'end'];

  const SubscriptionRecurringAutoPaySucceededDef = new SystemEmailTemplate();
  SubscriptionRecurringAutoPaySucceededDef.key = EmailTemplateType.SubscriptionRecurringAutoPaySucceeded;
  SubscriptionRecurringAutoPaySucceededDef.locale = Locale.Engish;
  SubscriptionRecurringAutoPaySucceededDef.vars = ['website', 'toWhom', 'subscriptionId', 'subscriptionType', 'start', 'end', 'paidAmount', 'creditDeduction'];

  const SubscriptionRecurringAutoPayFailedDef = new SystemEmailTemplate();
  SubscriptionRecurringAutoPayFailedDef.key = EmailTemplateType.SubscriptionRecurringAutoPayFailed;
  SubscriptionRecurringAutoPayFailedDef.locale = Locale.Engish;
  SubscriptionRecurringAutoPayFailedDef.vars = ['website', 'toWhom', 'subscriptionId', 'subscriptionType', 'start', 'end', 'paidAmount', 'creditDeduction'];

  const entities = [
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
    .into(SystemEmailTemplate)
    .values(entities)
    .onConflict(`(key, locale) DO NOTHING`)
    .execute();
}
