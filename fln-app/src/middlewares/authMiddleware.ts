
import { getRepository } from 'typeorm';
import { User } from '../entity/User';
import { getNow } from '../utils/getNow';
import { verifyJwtFromCookie, attachJwtCookie, clearJwtCookie } from '../utils/jwt';

export const authMiddleware = async (req, res, next) => {
  try {
    const user = verifyJwtFromCookie(req);
    if (user) {
      // Logged in users
      const { id } = user;
      const repo = getRepository(User);
      const existing = await repo.findOne(id);
      if (!existing) {
        clearJwtCookie(res);
        res.sendStatus(401);
        return;
      }
      repo.update(id, { lastNudgedAt: getNow() }).catch(() => { });
      req.user = Object.freeze(user);
      attachJwtCookie(user, res);
    } else {
      // Guest user (hasn't logged in)
    }
  } catch {
    clearJwtCookie(res);
  }
  next();
};

