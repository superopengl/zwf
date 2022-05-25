import { DocTemplate } from './../entity/DocTemplate';
import * as _ from 'lodash';
import { generatePdfBufferFromHtml } from "../utils/generatePdfBufferFromHtml";
import { v4 as uuidv4 } from 'uuid';
import { uploadToS3 } from '../utils/uploadToS3';
import { EntityManager } from 'typeorm';
import { File } from '../entity/File';
import { createHash } from 'crypto';
import { TaskField } from '../entity/TaskField';
import * as moment from 'moment';
import * as hash from 'object-hash';

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
      return value.map(x => x.name).join(', ');
    case 'autodoc':
      return value.name;
    default:
      throw new Error(`Unrecognized field type '${type}'`)
  }
}

async function renderDocTemplateBodyWithVarBag(docTemplate: DocTemplate, fields: TaskField[]) {
  let error: string = null;
  let renderedHtml = docTemplate.html;
  const fieldMap = new Map(fields.map(f => [f.name, f]));
  const usedValueBag = {};
  for (const fieldName of docTemplate.refFields) {
    const field = fieldMap.get(fieldName);
    const value = field?.value;
    if (value || value === 0) {
      const regex = new RegExp(`{{${fieldName}}}`, 'g');
      const replacementString = await stringifyFieldValue(field);
      usedValueBag[field.name] = field.value;
      renderedHtml = renderedHtml.replace(regex, replacementString);
    } else {
      error = `The value of field '${fieldName}' is not specified yet on form`;
      break;
    }
  }
  return { error, renderedHtml, usedValueBag };
}

async function generatePdfDataFromDocTemplate(docTemplate: DocTemplate, fields: TaskField[]) {
  const { error, renderedHtml, usedValueBag } = await renderDocTemplateBodyWithVarBag(docTemplate, fields);

  const options = { format: 'A4', border: '0.5in' };

  const pdfData = error ? null : await generatePdfBufferFromHtml(renderedHtml, options);
  const fileName = `${docTemplate.name}.pdf`;

  return { error, pdfData, fileName, usedValueBag };
}

export function computeObjectHash(variables) {
  return hash(variables, { unorderedObjects: true });
}


export async function generatePdfDocFile(m: EntityManager, docTemplate: DocTemplate, fields: TaskField[]): Promise<File> {
  const { error, pdfData, fileName, usedValueBag } = await generatePdfDataFromDocTemplate(docTemplate, fields);
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
  file.usedValueBag = usedValueBag;
  file.usedValueHash = computeObjectHash(usedValueBag);

  await m.save(file);

  return file;
}

