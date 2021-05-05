import { Locale } from './Locale';

export class EmailRequest {
  to: string;
  from?: string;
  locale?: Locale;
  orgId?: string;
  template: string;
  vars: object;
  attachments?: { filename: string; path: string }[];
  shouldBcc?: boolean = false;
}
