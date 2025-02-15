import { EntityManager } from 'typeorm';
import { UserInformation } from '../../src/entity/views/UserInformation';
import { Role } from '../../src/types/Role';


export async function getOrgAdminUsers(m: EntityManager, orgId: string) {
  const users = await m.getRepository(UserInformation).find({
    where: {
      orgId,
      role: Role.Admin,
    },
    select: {
      email: true,
      givenName: true,
      surname: true,
    }
  });
  return users;
}
