import { UserInformation } from './../entity/views/UserInformation';
import { User } from '../entity/User';
import { UserProfile } from '../entity/UserProfile';

export function getEmailRecipientName(user: User | UserInformation) {
  const { givenName, surname } = ((user as any).profile ?? user) as any;
  return getEmailRecipientNameByNames(givenName, surname);
}

export function getEmailRecipientNameByNames(givenName: string, surname: string) {
  const name = `${givenName || ''} ${surname || ''}`.trim();
  return name || 'Client';
}
