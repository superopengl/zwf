import { db } from '../db';
import { assertRole } from '../utils/assertRole';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { handlerWrapper } from '../utils/asyncHandler';
import { assert } from '../utils/assert';
import moment = require('moment');
import { Role } from "../types/Role";
import { OrgClient } from "../entity/OrgClient";
import { In } from "typeorm";
import { Tag } from "../entity/Tag";
import { OrgClientInformation } from '../entity/views/OrgClientInformation';
import { OrgAllClientFieldsInformation } from '../entity/views/OrgAllClientFieldsInformation';
import { OrgClientField } from '../entity/OrgClientField';
import { searchOrgClients } from '../utils/searchOrgClients';
import { ensureClientOrGuestUser } from '../utils/ensureClientOrGuestUser';


export const updateOrgClient = handlerWrapper(async (req, res) => {
  assertRole(req, [Role.Admin, Role.Agent]);
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);
  const payload = req.body;

  await db.manager.transaction(async m => {
    const client = await m.findOneByOrFail(OrgClient, { id, orgId });
    Object.assign(client, payload);

    if (payload.tags) {
      const tagIds = payload.tags;
      if (tagIds?.length) {
        client.tags = await db.getRepository(Tag).find({
          where: {
            id: In(tagIds)
          }
        });
      } else {
        client.tags = [];
      }
    }

    if (payload.fields) {
      await m.delete(OrgClientField, { orgClientId: id });

      const fieldEntities = payload.fields.map((f, i) => {
        const entity = new OrgClientField();
        entity.orgClientId = id;
        entity.options = f.options;
        entity.type = f.type;
        entity.name = f.name;
        entity.ordinal = i + 1;
        entity.value = f.value;
        return entity;
      });
  
      await m.save(fieldEntities);
  
      client.fields = fieldEntities;
    }

    await m.save(client);
  })

  res.json();
});

export const getOrgClient = handlerWrapper(async (req, res) => {
  assertRole(req, [Role.Admin, Role.Agent]);
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);

  const client = await db.manager.findOneOrFail(OrgClient, {
    where: { id, orgId },
    relations: {
      user: {
        profile: true,
      },
      tasks: {
        tags: true,
      },
      tags: true,
      fields: true,
    }
  });

  res.json(client);
});

export const setOrgClientAlias = handlerWrapper(async (req, res) => {
  assertRole(req, [Role.Admin, Role.Agent]);
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);
  const { alias } = req.body;

  const formattedAlias = alias?.trim();
  assert(formattedAlias, 400, 'alias not provided');

  await db.manager.update(OrgClient, { id, orgId }, { clientAlias: formattedAlias })

  res.json();
});

export const setOrgClientTags = handlerWrapper(async (req, res) => {
  assertRole(req, [Role.Admin, Role.Agent]);
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);

  const { tags: tagIds } = req.body;
  const repo = db.getRepository(OrgClient);
  const orgClient = await repo.findOneBy({ id, orgId });
  if (tagIds?.length) {
    orgClient.tags = await db.getRepository(Tag).find({
      where: {
        id: In(tagIds)
      }
    });
  } else {
    orgClient.tags = [];
  }
  await repo.save(orgClient);
  res.json();
});

export const getBulkClientBrief = handlerWrapper(async (req, res) => {
  assertRole(req, [Role.Admin, Role.Agent]);
  const { ids } = req.body;
  const orgId = getOrgIdFromReq(req);

  assert(ids.length, 400, 'ids cannot be empty');

  const data = await db.getRepository(OrgClientInformation).find({
    where: { id: In(ids), orgId },
    select: {
      id: true,
      clientAlias: true,
      remark: true,
      avatarFileId: true,
      avatarColorHex: true,
      givenName: true,
      surname: true,
      email: true,
    }
  });

  res.json(data);
});

export const getOrgClientInfo = handlerWrapper(async (req, res) => {
  assertRole(req, [Role.Admin, Role.Agent]);
  const orgId = getOrgIdFromReq(req);
  const { id } = req.params;

  const client = await db.getRepository(OrgClientInformation).findOne({
    where: {
      id,
      orgId,
    },
    select: {
      id: true,
      clientAlias: true,
      userId: true,
      email: true,
      givenName: true,
      surname: true,
      phone: true,
    }
  })

  res.json(client);
});


export const searchOrgClientUserList = handlerWrapper(async (req, res) => {
  assertRole(req, ['system', 'admin', 'agent']);

  const orgId = getOrgIdFromReq(req);

  const page = +req.body.page;
  const size = +req.body.size;
  const orderField = req.body.orderBy || 'email';
  const orderDirection = req.body.orderDirection || 'ASC';
  const text = req.body.text?.trim();
  const tags = (req.body.tags || []);

  const list = await searchOrgClients(
    orgId,
    {
      text,
      page,
      size,
      orderField,
      orderDirection,
      tags
    });

  res.json(list);
});


export const getOrgClientDatabag = handlerWrapper(async (req, res) => {
  assertRole(req, [Role.Admin, Role.Agent]);
  const orgId = getOrgIdFromReq(req);
  const { id } = req.params;

  const orgClient = await db.manager.findOneOrFail(OrgClient, {
    where: {
      id,
      orgId
    },
    relations: {
      fields: true,
    }
  });

  res.json(orgClient);
});

export const saveOrgClientRemark = handlerWrapper(async (req, res) => {
  assertRole(req, [Role.Admin, Role.Agent]);
  const orgId = getOrgIdFromReq(req);
  const { id } = req.params;
  const { remark } = req.body;

  await db.transaction(async m => {
    const orgClient = await m.findOneOrFail(OrgClient, {
      where: { id, orgId }
    });

    orgClient.remark = remark;

    await m.save(orgClient);
  });

  res.json();
});

export const saveOrgClientEmail = handlerWrapper(async (req, res) => {
  assertRole(req, [Role.Admin, Role.Agent]);
  const orgId = getOrgIdFromReq(req);
  const { id } = req.params;
  const { email } = req.body;

  assert(email, 400, 'Invalid email address')

  await db.transaction(async m => {
    const orgClient = await m.findOneOrFail(OrgClient, {
      where: { id, orgId }
    });

    if (email && !orgClient.userId) {
      const { user, newlyCreated } = await ensureClientOrGuestUser(m, email, orgId);
      assert(newlyCreated || user.role === Role.Client, 400, 'Cannot use this email address to proceed. The email address has been associated with a non-client account in ZeeWorkflow.')
      orgClient.userId = user.id;
    }

    await m.save(orgClient);
  });

  res.json();
});

export const saveOrgClientDatabag = handlerWrapper(async (req, res) => {
  assertRole(req, [Role.Admin, Role.Agent]);
  const orgId = getOrgIdFromReq(req);
  const { id } = req.params;
  const { fields } = req.body;

  await db.transaction(async m => {
    const orgClient = await m.findOneOrFail(OrgClient, {
      where: { id, orgId }
    });

    await m.delete(OrgClientField, { orgClientId: id });

    const fieldEntities = fields.map((f, i) => {
      const entity = new OrgClientField();
      entity.orgClientId = id;
      entity.options = f.options;
      entity.type = f.type;
      entity.name = f.name;
      entity.ordinal = i + 1;
      entity.value = f.value;
      return entity;
    });

    await m.save(fieldEntities);

    orgClient.fields = fieldEntities;

    await m.save(orgClient);
  });

  res.json();
});