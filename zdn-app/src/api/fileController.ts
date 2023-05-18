
import { getRepository } from 'typeorm';
import { File } from '../entity/File';
import { assert } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { assertRole } from "../utils/assertRole";
import { getNow } from '../utils/getNow';
import { Task } from '../entity/Task';
import { getS3ObjectStream, uploadToS3 } from '../utils/uploadToS3';
import { v4 as uuidv4 } from 'uuid';

export const downloadFile = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client', 'agent');
  const { taskId, fileId } = req.params;
  const { user: { id: userId, role } } = req as any;

  const taskRepo = getRepository(Task);
  const task = await taskRepo.findOne(taskId);
  assert(task, 404);

  const fileRepo = getRepository(File);
  const file = await fileRepo.findOne(fileId);
  assert(file, 404);

  const taskDoc = task.docs.find(d => d.fileId === fileId);
  assert(taskDoc, 404);

  if (role === 'client') {
    assert(task.userId === userId, 404);
    // // Only record the read by client
    const now = getNow();
    taskDoc.lastReadAt = now;
    await taskRepo.save(task);

    file.lastReadAt = now;
    await fileRepo.save(file);
  }

  const { fileName, mime } = file;

  const stream = getS3ObjectStream(fileId, fileName);
  res.setHeader('Content-type', mime);
  res.setHeader('Content-disposition', 'attachment; filename=' + fileName);

  stream.pipe(res);
});

export const getFile = handlerWrapper(async (req, res) => {
  const { id } = req.params;
  const repo = getRepository(File);
  const file = await repo.findOne(id);
  assert(file, 404);
  res.json(file);
});

export const searchFileList = handlerWrapper(async (req, res) => {
  const { ids } = req.body;
  const files = await getRepository(File)
    .createQueryBuilder()
    .where('id IN (:...ids)', { ids })
    .getMany();
  res.json(files);
});


export const uploadFile = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client', 'agent');
  const { file } = (req as any).files;
  assert(file, 404, 'No file to upload');
  const { name, data, mimetype, md5 } = file;

  const id = uuidv4();
  const location = await uploadToS3(id, name, data);

  const entity: File = {
    id,
    fileName: name,
    mime: mimetype,
    location,
    md5,
  };

  const repo = getRepository(File);
  await repo.insert(entity);

  res.json(entity);
});