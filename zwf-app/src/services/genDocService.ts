import { TaskField } from './../types/TaskField';
import { DocTemplate } from './../entity/DocTemplate';
import { Stream } from 'stream';
import * as _ from 'lodash';
import { generatePdfBufferFromHtml } from '../utils/generatePdfStreamFromHtml';
import { v4 as uuidv4 } from 'uuid';
import { uploadToS3 } from '../utils/uploadToS3';
import { getRepository, EntityManager } from 'typeorm';
import { File } from '../entity/File';
import { createHash } from 'crypto';

function renderDocTemplateBodyWithVarBag(docTemplate: DocTemplate, fields: TaskField[]) {
  let error: string = null;
  let renderedHtml = docTemplate.html;
  const varBag = fields.reduce((bag, f) => {
    bag[f.varName] = f.value;
    return bag;
  }, {});
  for (const varName of docTemplate.variables) {
    const value = varBag[varName];
    if (value || value === 0) {
      const regex = new RegExp(`{{${varName}}}`, 'g');
      renderedHtml = renderedHtml.replace(regex, `${value}`);
    } else {
      error = `Value of '${varName}' is not specified`;
      break;
    }
  }
  return { error, renderedHtml };
}

async function generatePdfDataFromDocTemplate(docTemplate: DocTemplate, fields: TaskField[]): Promise<{ error: string, pdfData: Buffer, fileName: string }> {
  const { error, renderedHtml } = renderDocTemplateBodyWithVarBag(docTemplate, fields);

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
  file.mime = 'application/pdf'
  file.location = location,
  file.md5 = createHash('md5').update(pdfData).digest('hex'),
  file.public = false;

  await m.save(file);

  return file;
}

