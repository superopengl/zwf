import { Portfolio } from '../entity/Portfolio';
import { getNow } from './getNow';

export function createProfileEntity(userId: string, payload: any): Portfolio {
  const profile = new Portfolio();
  profile.id = userId;
  profile.name = payload.name;
  profile.fields = payload.fields;

  return profile;
}
