
export enum EmailTemplateType {
  // On board
  WelcomeOrg = 'welcome_org',
  WelcomeOrgSso = 'welcome_org_sso',
  RegisterExistingAccount = 'register_existing_account',
  InviteOrgMember = 'invite_agent_user',
  InviteClientUser = 'invite_client_user',
  InviteNewClientUser = 'invite_new_client_user',
  SetPassword = 'set_password',

  // Task
  TaskCompleted = 'task_completed',
  TaskLongUnackEventsForOrg = 'task_long_unack_events_for_org',
  TaskLongUnackEventsForClient = 'task_long_unack_events_for_client',

  // Subscription and payment
  SubscriptionSuspended = 'subscription_suspended',
  SubscriptionOkPaymentInvoice = 'subscription_ok_payment_invoice',
  SubscriptionAutoRenewFailed = 'subscription_auto_renew_failed',
  SubscriptionTerminatedMonthly = 'subscription_terminated_monthly',
  SubscriptionTerminatedTrial = 'subscription_terminated_trial',

  // Contact
  InboundContact = 'inbound_contact',
}



