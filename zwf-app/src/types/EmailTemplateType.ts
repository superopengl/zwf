
export enum EmailTemplateType {
  // On board
  WelcomeOrg = 'welcome_org',
  RegisterExistingAccount = 'register_existing_account',
  InviteOrgMember = 'invite_agent_user',
  InviteClientUser = 'invite_client_user',
  InviteNewClientUser = 'invite_new_client_user',
  SetPassword = 'set_password',

  // Task
  TaskCompleted = 'task_completed',
  TaskRequireAction = 'task_require_action',

  // Subscription and payment
  SubscriptionTrialExpiring = 'subscription_trial_expiring',
  SubscriptionAutoRenewing = 'subscription_auto_renewing',
  SubscriptionSuspended = 'subscription_suspended',
  SubscriptionPaymentSuccessful = 'subscription_payment_successful',
  SubscriptionAutoRenewSuccessful = 'subscription_auto_renew_successful',
  SubscriptionAutoRenewFailed = 'subscription_auto_renew_failed',

  // Contact
  InboundContact = 'inbound_contact',
}



