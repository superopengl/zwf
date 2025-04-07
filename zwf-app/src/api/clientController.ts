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
      avatarFileId: true,
      avatarColorHex: true,
      givenName: true,
      surname: true,
      email: true,
    }
  });

  res.json(data);
});

export const getOrgClientDataBag = handlerWrapper(async (req, res) => {
  assertRole(req, [Role.Admin, Role.Agent]);
  const orgId = getOrgIdFromReq(req);
  const { id } = req.params;

  const client = await db.getRepository(OrgClient).findOne({
    where: {
      id,
      orgId,
    },
    relations: {
      fields: true
    }
  })

  const allFieldNamesResult = await db.getRepository(OrgAllClientFieldsInformation).find({
    where: {
      orgId,
    },
    select: {
      name: true,
    }
  })

  res.json({
    fields: client.fields,
    allNames: allFieldNamesResult.map(x => x.name),
  });
});

export const createOrgClientDataBagField = handlerWrapper(async (req, res) => {
  assertRole(req, [Role.Admin, Role.Agent]);
  const orgId = getOrgIdFromReq(req);
  const { id } = req.params;
  const { name } = req.body;

  const formattedName = name?.trim();
  assert(formattedName, 400, 'Empty field name');

  const clientField = new OrgClientField();
  clientField.orgClientId = id;
  clientField.name = formattedName;

  const client = await db.getRepository(OrgClient).findOne({
    where: {
      id,
      orgId,
    },
    relations: {
      fields: true
    }
  })

  const allFieldNamesResult = await db.getRepository(OrgAllClientFieldsInformation).find({
    where: {
      orgId,
    },
    select: {
      name: true,
    }
  })

  res.json({
    fields: client.fields,
    allNames: allFieldNamesResult.map(x => x.name),
  });
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

export const saveOrgClientDataBag = handlerWrapper(async (req, res) => {
  assertRole(req, [Role.Admin, Role.Agent]);
  const orgId = getOrgIdFromReq(req);
  const { id } = req.params;

  const client = await db.getRepository(OrgClient).findOne({
    where: {
      id,
      orgId,
    },
    relations: {
      fields: true
    }
  })

  const allFieldNamesResult = await db.getRepository(OrgAllClientFieldsInformation).find({
    where: {
      orgId,
    },
    select: {
      name: true,
    }
  })

  res.json({
    fields: client.fields,
    allNames: allFieldNamesResult.map(x => x.name),
  });
});
