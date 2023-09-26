import { db } from '../db';
import { TaskActivityInformation } from '../entity/views/TaskActivityInformation';
import { Task } from '../entity/Task';
import { assert } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import * as _ from 'lodash';
import { Role } from '../types/Role';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { getRoleFromReq } from '../utils/getRoleFromReq';
import { getUserIdFromReq } from '../utils/getUserIdFromReq';
import { insertTaskTalkText } from '../services/createTaskTalkText';
import { assertRole } from '../utils/assertRole';
import { ZeventName } from '../types/ZeventName';
import { addTaskWatcher } from '../utils/addWTaskWatcher';
import { TaskTalk } from '../entity/TaskTalk';
import { emitTaskTalkEvent } from '../utils/emitTaskEvent';


export const listTaskComment = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent', 'client']);
  const role = getRoleFromReq(req);
  assert(role !== Role.System, 404);
  const { id } = req.params;
  const userId = getUserIdFromReq(req);

  let list;
  await db.manager.transaction(async m => {
    list = await m.find(TaskActivityInformation, {
      where: {
        taskId: id,
        type: ZeventName.TaskComment,
        ...(role === Role.Client ? { userId } : { orgId: getOrgIdFromReq(req) }),
      },
      order: {
        createdAt: 'ASC'
      },
      select: {
        eventId: true,
        createdAt: true,
        by: true,
        type: true,
        info: true,
      }
    });
  });



  res.json(list);
});


export const createTaskTalkText = handlerWrapper(async (req, res) => {
  const role = getRoleFromReq(req);
  assert(role !== Role.System, 404);
  // assertRole(req, ['admin', 'agent', 'client']);

  const { id: taskId } = req.params;
  const { message, mentionedUserIds } = req.body;
  assert(message, 400, 'Empty message body');

  await db.transaction(async m => {
    const taskRepo = db.getRepository(Task);
    const task = await taskRepo.findOneOrFail({
      where: {
        id: taskId
      },
      relations: {
        orgClient: true
      }
    });

    if (mentionedUserIds?.length) {
      for (const userId of mentionedUserIds) {
        await addTaskWatcher(m, taskId, userId, 'mentioned');
      }
    }

    const senderId = role === Role.Guest ? task.orgClient?.userId : getUserIdFromReq(req);

    const talk = new TaskTalk()
    talk.taskId = taskId;
    talk.by = senderId;
    talk.text = message;
    talk.type = 'text';
    await m.save(talk);

    await emitTaskTalkEvent(m, taskId, talk);
  });


  res.json();
});


