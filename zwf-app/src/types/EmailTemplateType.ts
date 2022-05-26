
export enum EmailTemplateType {
  // On board
  WelcomeClient = 'welcome-client',
  WelcomeOrg = 'welcome-org',
  InviteOrgMember = 'invite_agent_user',
  InviteClientUser = 'invite_client_user',
  ResetPassword = 'reset_password',

  // Task
  TaskCreated = 'task_created',
  TaskCompleted = 'task_completed',
  TaskRequireAction = 'task_require_action',

  // Subscription and payment
  SubscriptionCreated = 'subscription_created',
  SubscriptionExpiring = 'subscription_expiring',
  SubscriptionExpired = 'subscription_expired',
  SubscriptionPaymentSuccessful = 'subscription_payment_successful',
  SubscriptionPaymentFailed = 'subscription_payment_failed',
}



