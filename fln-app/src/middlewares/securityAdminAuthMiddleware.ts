
import { assert } from '../utils/assert';
import * as _ from 'lodash';

// function createRoleBasedAuthCheckFunction(...roles) {
//   return (req, res, next) => {
//     // assert(_.get(req, 'user.role') === 'individual', 403, 'Access denied.');
//     passport.authenticate('local', (err, user, info) => {
//       if (err) {
//         return next(err);
//       }

//       try {
//         assert(!roles.length || roles.includes(user?.role), 403, `Invalid permission ('${user?.role}' to access '${roles.join()}')`);
//         req.user = user;
//         next();
//       } catch (err) {
//         next(err);
//       }
//     })(req, res, next);
//   };
// }

// export const authAnyRole = createRoleBasedAuthCheckFunction();
// export const authAdmin = createRoleBasedAuthCheckFunction('admin');
// export const authGuest = createRoleBasedAuthCheckFunction('guest');
// export const authLoggedInUser = createRoleBasedAuthCheckFunction('admin', 'client', 'agent');
// export const authAdminOrAgent = createRoleBasedAuthCheckFunction('admin', 'agent');
// export const authClient = createRoleBasedAuthCheckFunction('client');
