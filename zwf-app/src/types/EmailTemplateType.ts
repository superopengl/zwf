
export enum EmailTemplateType {
  // On board
  WelcomeClient = 'welcome_client',
  WelcomeOrg = 'welcome_org',
  InviteOrgMember = 'invite_agent_user',
  InviteClientUser = 'invite_client_user',
  SetPassword = 'set_password',

  // Task
  TaskCompleted = 'task_completed',
  TaskRequireAction = 'task_require_action',

  // Subscription and payment
  SubscriptionTrialExpiring = 'subscription_trial_expiring',
  SubscriptionAutoRenewing = 'subscription_auto_renewing',
  SubscriptionExpired = 'subscription_expired',
  SubscriptionPaymentSuccessful = 'subscription_payment_successful',
  SubscriptionAutoRenewSuccessful = 'subscription_auto_renew_successful',
  SubscriptionAutoRenewFailed = 'subscription_auto_renew_failed',
}



