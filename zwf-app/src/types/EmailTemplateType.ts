
export enum EmailTemplateType {
  // On board
  WelcomeClient = 'welcome-client',
  WelcomeOrg = 'welcome-org',
  InviteOrgMember = 'invite_agent_user',
  InviteClientUser = 'invite_client_user',
  ResetPassword = 'reset_password',

  // Authorize
  RequireClientAuthorizing = 'require_client_auth',

  // Recurring
  RecurringDone = 'recurring_done',
  RecurringFailed = 'recurring_failed',

  // Task
  TaskCreated = 'task_created',
  TaskCompleted = 'task_completed',
  TaskArchived = 'task_archived',
  TaskSigned = 'task_signed',
  TaskRequireSign = 'task_require_sign',
  TaskRequireAction = 'task_require_action',
  TaskStatusChange = 'task_status_change',
  TaskMessageNotification = 'task_message_notification',
  TaskCommentNotification = 'task_comment_notification',

  // Subscription and payment
  SubscriptionCreated = 'subscription_created',
  SubscriptionExpiring = 'subscription_expiring',
  SubscriptionExpired = 'subscription_expired',
  AutoRenewPaymentSuccessful = 'auto_renew_payment_successful',
  AutoRenewPaymentFailed = 'auto_renew_payment_failed',
  PaymentSuccessfulAndReceipt = 'payment_successful_and_receipt',

  // System
  Contact = 'contact',
  SystemNotification = 'system_notification',
}



