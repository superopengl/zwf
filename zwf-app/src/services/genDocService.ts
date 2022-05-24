import { AppDataSource } from './../db';
import { TaskTemplateField } from '../types/TaskTemplateField';
import { DocTemplate } from './../entity/DocTemplate';
import { Stream } from 'stream';
import * as _ from 'lodash';
import { generatePdfBufferFromHtml } from '../utils/generatePdfStreamFromHtml';
import { v4 as uuidv4 } from 'uuid';
import { uploadToS3 } from '../utils/uploadToS3';
import { getRepository, EntityManager, In } from 'typeorm';
import { File } from '../entity/File';
import { createHash } from 'crypto';
import { TaskField } from '../entity/TaskField';
import * as moment from 'moment';
import { TaskDoc } from '../entity/TaskDoc';

async function stringifyFieldValue(f) {
  const { value, type } = f;
  if (value === undefined || value === null) {
    return '';
  }

  switch (type) {
    case 'input':
    case 'number':
    case 'textarea':
    case 'radio':
    case 'checkbox':
    case 'select':
      return value;
    case 'date':
      return moment(value).format('YYYY-MM-DD');
    case 'month':
      return moment(value).format('YYYY-MM');
    case 'quarter':
      return moment(value).format('YYYY [Q]Q');
    case 'year':
      return moment(value).format('YYYY');
    case 'upload':
      {
        const taskDocIds = value;
        if (taskDocIds?.length) {
          const taskDocs = await AppDataSource.getRepository(TaskDoc).find({
            where: {
              id: In(taskDocIds)
            },
            select: {
              name: true
            }
          });

          return taskDocs.map(x => x.name).join(', ');
        }
      }
    case 'autodoc':
      return '$autodoc$'
    default:
      throw new Error(`Unrecognized field type '${type}'`)
  }
}

async function renderDocTemplateBodyWithVarBag(docTemplate: DocTemplate, fields: TaskField[]) {
  let error: string = null;
  let renderedHtml = docTemplate.html;
  const fieldMap = new Map(fields.map(f => [f.name, f]));
  for (const fieldName of docTemplate.refFields) {
    const field = fieldMap.get(fieldName);
    const value = field?.value;
    if (value || value === 0) {
      const regex = new RegExp(`{{${fieldName}}}`, 'g');
      const replacementString = await stringifyFieldValue(field);
      renderedHtml = renderedHtml.replace(regex, replacementString);
    } else {
      error = `The value of field '${fieldName}' is not specified yet on form`;
      break;
    }
  }
  return { error, renderedHtml };
}

async function generatePdfDataFromDocTemplate(docTemplate: DocTemplate, fields: TaskField[]): Promise<{ error: string, pdfData: Buffer, fileName: string }> {
  const { error, renderedHtml } = await renderDocTemplateBodyWithVarBag(docTemplate, fields);

  const options = { format: 'A4' };

  const pdfData = error ? null : await generatePdfBufferFromHtml(renderedHtml, options);
  const fileName = `${docTemplate.name}.pdf`;

  return { error, pdfData, fileName };
}

export async function tryGenDocFile(m: EntityManager, docTemplate: DocTemplate, fields: TaskField[]): Promise<File> {
  const { error, pdfData, fileName } = await generatePdfDataFromDocTemplate(docTemplate, fields);
  if (error) {
    throw new Error(error);
  }
  const id = uuidv4();
  const location = await uploadToS3(id, fileName, pdfData);
  const file = new File();
  file.id = id;
  file.fileName = fileName;
  file.mime = 'application/pdf';
  file.location = location;
  file.md5 = createHash('md5').update(pdfData).digest('hex');
  file.public = false;

  await m.save(file);

  return file;
}

