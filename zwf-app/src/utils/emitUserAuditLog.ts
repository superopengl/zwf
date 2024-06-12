import { UserAudit } from '../entity/UserAudit';
import { AppDataSource } from '../db';

export function emitUserAuditLog(userId: string, action: string, info: any = null) {
  const entity = new UserAudit();

  entity.userId = userId;
  entity.action = action;
  entity.info = info;

  AppDataSource.getRepository(UserAudit).insert(entity).catch(() => { });
}