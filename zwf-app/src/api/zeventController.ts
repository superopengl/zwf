
import { assert } from '../utils/assert';
import * as _ from 'lodash';
import { handlerWrapper } from '../utils/asyncHandler';
import { getZeventSource$ } from '../services/zeventSubPubService';
import { Role } from '../types/Role';
import { getRoleFromReq } from '../utils/getRoleFromReq';
import { getUserIdFromReq } from '../utils/getUserIdFromReq';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { Zevent } from '../types/Zevent';
import { filter } from 'rxjs';


export const establishZeventStream = handlerWrapper(async (req, res) => {
  const userId = getUserIdFromReq(req);
  assert(userId, 404)

  const role = getRoleFromReq(req);
  const orgId = getOrgIdFromReq(req);
  const taskId = req.query.taskId as string;
  const filterFunc = getSourcePipelines(role, userId, orgId, taskId);

  // const { user: { id: userId } } = req as any;
  const isProd = process.env.NODE_ENV === 'prod';
  if (!isProd) {
    res.setHeader('Access-Control-Allow-Origin', process.env.ZWF_WEB_DOMAIN_NAME);
  }
  res.sse();

  const source$ = getZeventSource$()
    .pipe(
      filter(filterFunc),
    ).subscribe((zevent) => {
      res.write(`data: ${JSON.stringify(zevent)}\n\n`);
      (res as any).flush();
    });

  res.on('close', () => {
    source$.unsubscribe();
    res.end();
  });
});


function getSourcePipelines(role: string, userId: string, orgId: string, taskId: string) {
  switch (role) {
    case Role.System:
      return (zevent: Zevent) => {
        return zevent.type === 'support';
      }
    case Role.Client:
      return (zevent: Zevent) => {
        return zevent.userId === userId;
      }
    case Role.Agent:
    case Role.Admin:
      return (zevent: any) => {
        return zevent.userId === userId;
        //  && (zevent.type === 'support' ||
        //   (
        //     zevent.type === 'taskEvent' &&
        //     zevent.taskEvent.orgId === orgId
        //   )
        // )
      };
    default:
      assert(false, 403, `Does not support SSE`);
  }
}




