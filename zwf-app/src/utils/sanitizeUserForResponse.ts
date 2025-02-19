import * as _ from 'lodash';
import { UserInformation } from '../entity/views/UserInformation';


export function sanitizeUserForResponse(user: UserInformation) {
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
    'currentPlanType',
    'currentPeriodTo',
    'impersonatedBy',
  ]);
}


