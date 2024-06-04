
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
  SubscriptionExpired = 'subscription_expired',
  SubscriptionPaymentSuccessful = 'subscription_payment_successful',
  SubscriptionPaymentFailed = 'subscription_payment_failed',
}



