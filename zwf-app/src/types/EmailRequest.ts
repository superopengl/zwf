import { EmailTemplateType } from './EmailTemplateType';
import { Locale } from './Locale';

export class EmailRequest {
  to: string;
  from?: string;
  orgId?: string;
  template: EmailTemplateType;
  vars: object;
  attachments?: { filename: string; path: string }[];
  shouldBcc?: boolean = false;
}
