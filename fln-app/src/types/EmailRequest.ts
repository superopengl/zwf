import { Locale } from './Locale';

export class EmailRequest {
  to: string;
  from?: string;
  locale?: Locale;
  template: string;
  vars: object;
  attachments?: { filename: string; path: string }[];
  shouldBcc?: boolean = false;
}
