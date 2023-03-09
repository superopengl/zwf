import { db } from './../db';

import { v4 as uuidv4 } from 'uuid';
import { assertRole } from '../utils/assertRole';
import { handlerWrapper } from '../utils/asyncHandler';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';


export const getAccount = handlerWrapper(async (req, res) => {
  assertRole(req,[ 'system']);
  const { id } = req.params;
  const result = null //await getAccountForOrg(id);

  res.json(result);
});



