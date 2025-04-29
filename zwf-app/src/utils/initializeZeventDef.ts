import { SYSTEM_EMAIL_NOREPLY, SYSTEM_EMAIL_INFO } from './constant';
import { db } from '../db';
import { SystemConfig } from '../entity/SystemConfig';
import { ZeventDef } from '../entity/ZeventDef';
import { Role } from '../types/Role';
import { ZEVENT_DEF_ENTITIES } from '../types/ZeventTypeDef';


export async function initializeZeventDef() {
  await db.manager
    .createQueryBuilder()
    .insert()
    .into(ZeventDef)
    .values(ZEVENT_DEF_ENTITIES)
    .orUpdate([
      'uiNotifyRoles',
      'emailNotifyRoles',
    ], ['name'])
    .execute();
}
