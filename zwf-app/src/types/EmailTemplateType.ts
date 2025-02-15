
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
  SubscriptionSuspended = 'subscription_suspended',
  SubscriptionOkPaymentInvoice = 'subscription_ok_payment_invoice',
  SubscriptionAutoRenewFailed = 'subscription_auto_renew_failed',

  // Contact
  InboundContact = 'inbound_contact',
}



