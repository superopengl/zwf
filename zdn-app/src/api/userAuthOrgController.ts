
import { getRepository, getManager } from 'typeorm';
import { assert } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { UserAuthOrg } from '../entity/UserAuthOrg';
import { UserAuthOrgInformation } from '../entity/views/UserAuthOrgInformation';

export const getUserAuthOrg = handlerWrapper(async (req, res) => {
  const { token } = req.params;
  assert(token, 404);

  const userAuthOrg = await getRepository(UserAuthOrgInformation).findOne({
    id: token,
    status: 'pending',
  });
  assert(userAuthOrg, 404, 'Auth token not found');

  res.json(userAuthOrg);
});

async function changeUserAuthOrgStatus(id, newStatus: 'ok' | 'ng') {
  const userAuthOrg = await getRepository(UserAuthOrg).findOne({
    id,
    status: 'pending'
  });
  assert(userAuthOrg, 404);

  userAuthOrg.status = newStatus;
  await getManager().save(userAuthOrg);
}

export const approveOrgAuth = handlerWrapper(async (req, res) => {
  const { token } = req.params;
  await changeUserAuthOrgStatus(token, 'ok');
  res.json();
});

export const rejectOrgAuth = handlerWrapper(async (req, res) => {
  const { token } = req.params;
  await changeUserAuthOrgStatus(token, 'ng');
  res.json();
});