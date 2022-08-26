import { UserAudit } from '../entity/UserAudit';
import { db } from '../db';

export function emitUserAuditLog(userId: string, action: string, info: any = null) {
  const entity = new UserAudit();

  entity.userId = userId;
  entity.action = action;
  entity.info = info;

  db.getRepository(UserAudit).insert(entity).catch(() => { });
}