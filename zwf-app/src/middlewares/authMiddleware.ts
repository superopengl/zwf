
import { verifyJwtFromCookie, attachJwtCookie, clearJwtCookie, nudgeJwtCookie } from '../utils/jwt';
import * as moment from 'moment';
import { getActiveUserInformation } from '../utils/getActiveUserInformation';
import { nudgeUser } from '../utils/nudgeUser';

export const authMiddleware = async (req, res, next) => {

  try {
    let user = verifyJwtFromCookie(req);

    if (user) {
      // Logged in users
      const { expires } = user;
      if (moment(expires).isBefore()) {
        // JWT token expired. Needs to refresh
        const existingUser = await getActiveUserInformation(user.email);
        if (!existingUser) {
          // User not existing anymore
          clearJwtCookie(res);
          res.sendStatus(401);
          res.send(`Session timeout`);
          return;
        } else if (existingUser.suspended) {
          clearJwtCookie(res);
          res.sendStatus(423);
          res.send(`The organization has been suspended. Please get in touch with your organization's owner to request for it to be unlocked.`);
          return;
        } else {
          user = existingUser;
          attachJwtCookie(res, user);
        }
      } else {
        // WHen cookie is still valid, slide its expiry
        nudgeJwtCookie(req, res);
      }

      nudgeUser(user.id);
      req.user = Object.freeze(user);
    } else {
      // Guest user (hasn't logged in)
      // req.user = null;
      clearJwtCookie(res);
    }
  } catch {
    clearJwtCookie(res);
  }

  // console.log('Auth done'.green, req.method, req.url, req.user);

  next();
};

