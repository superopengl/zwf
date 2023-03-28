import { getUtcNow } from './../utils/getUtcNow';
import { TaskDoc } from './../entity/TaskDoc';
import { DocTemplate } from './../entity/DocTemplate';
import * as _ from 'lodash';
import { generatePdfBufferFromHtml } from '../utils/generatePdfBufferFromHtml';
import { v4 as uuidv4 } from 'uuid';
import { uploadToS3 } from '../utils/uploadToS3';
import { EntityManager } from 'typeorm';
import { File } from '../entity/File';
import { createHash } from 'crypto';
import { TaskField } from '../entity/TaskField';
import * as moment from 'moment';
import * as hash from 'object-hash';
import { assert } from '../utils/assert';

async function stringifyFieldValue(f) {
  const { value, type } = f;
  if (value === undefined || value === null) {
    return '';
  }

  switch (type) {
    case 'text':
    case 'textarea':
    case 'digit':
    case 'checkbox':
    case 'select':
    case 'radio':
      return value;
    case 'date':
      return moment(value).format('YYYY-MM-DD');
    case 'dateMonth':
      return moment(value).format('YYYY-MM');
    case 'dateQuarter':
      return moment(value).format('YYYY [Q]Q');
    case 'dateYear':
      return moment(value).format('YYYY');
    default:
      throw new Error(`Unrecognized field type '${type}'`);
  }
}

function formatHtmlForRendering(html) {
  return `<body style="font-size: 14px;font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;">${html}</body>`;
}

async function renderDocTemplateBodyWithVarBag(docTemplate: DocTemplate, fields: TaskField[]) {
  let error: string = null;
  let renderedHtml = formatHtmlForRendering(docTemplate.html);
  const fieldMap = new Map(fields.map(f => [f.name, f]));
  const usedFieldBag = {};

  for (const fieldName of docTemplate.refFieldNames) {
    const field = fieldMap.get(fieldName);
    const value = field?.value;
    if (value || value === 0) {
      const regex = new RegExp(`{{${fieldName}}}`, 'g');
      const replacementString = await stringifyFieldValue(field);
      usedFieldBag[field.name] = field.value;
      renderedHtml = renderedHtml.replace(regex, replacementString);
    } else {
      error = `The value of field '${fieldName}' is not specified yet on form`;
      break;
    }
  }
  return { error, renderedHtml, usedFieldBag };
}

async function generatePdfDataFromDocTemplate(docTemplate: DocTemplate, fields: TaskField[]) {
  const { error, renderedHtml, usedFieldBag } = await renderDocTemplateBodyWithVarBag(docTemplate, fields);

  const pdfData = error ? null : await generatePdfBufferFromHtml(renderedHtml);
  const fileName = `${docTemplate.name}.pdf`;

  return { error, pdfData, fileName, usedFieldBag };
}

export function computeObjectHash(variables) {
  return hash(variables, { unorderedObjects: true });
}

export async function generatePdfTaskDocFile(m: EntityManager, docId: string, generatorId: string): Promise<File> {
  const doc = await m.findOne(TaskDoc, {
    where: { id: docId },
    relations: {
      task: {
        fields: true,
      },
    }
  });

  assert(doc, 500, 'No doc found');
  assert(doc.docTemplateId, 500, 'No docTemplateId on this doc');
  assert(!doc.signedAt, 500, 'Cannot generate PDF as the doc has been signed');

  const docTemplate = await m.findOneBy(DocTemplate, { id: doc.docTemplateId });
  assert(docTemplate, 500, 'docTemplate not found');

  const { error, pdfData, fileName, usedFieldBag } = await generatePdfDataFromDocTemplate(docTemplate, doc.task.fields);
  if (error) {
    return null;
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
  // file.usedFieldBag = usedFieldBag;
  // file.usedValueHash = computeObjectHash(usedFieldBag);

  doc.file = file;
  doc.generatedAt = getUtcNow();
  doc.generatedBy = generatorId;
  doc.fieldBag = usedFieldBag;


  await m.save([file, doc]);

  return file;
}

