import { User } from '../entity/User';
import { UserProfile } from '../entity/UserProfile';

export function getEmailRecipientName(user: User) {
  const { givenName, surname } = (user.profile ?? {}) as UserProfile;
  const name = `${givenName || ''} ${surname || ''}`.trim();
  return name || 'Client';
}
