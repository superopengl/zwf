import { User } from '../entity/User';
import * as _ from 'lodash';
import { UserInformation } from '../entity/views/UserInformation';


export function sanitizeUser(user: UserInformation) {
  return _.pick(user, [
    'id',
    'role',
    'orgId',
    'email',
    'givenName',
    'loginType',
    'surname',
    'avatarFileId',
    'avatarColorHex',
    'subscriptionAlive',
    'suspended',
  ]);
}
