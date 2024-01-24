import { TaskField } from './../types/TaskField';
import { DocTemplate } from './../entity/DocTemplate';
import { Stream } from 'stream';
import * as _ from 'lodash';
import { generatePdfBufferFromHtml } from '../utils/generatePdfStreamFromHtml';
import { v4 as uuidv4 } from 'uuid';
import { uploadToS3 } from '../utils/uploadToS3';
import { getRepository } from 'typeorm';
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

export async function tryGenDocFile(docTemplate: DocTemplate, fields: TaskField[], userId: string): Promise<File> {
  const { error, pdfData, fileName } = await generatePdfDataFromDocTemplate(docTemplate, fields);
  if (error) {
    return null;
  }
  const id = uuidv4();
  const location = await uploadToS3(id, fileName, pdfData);
  const file: File = {
    id,
    owner: userId,
    fileName,
    mime: 'application/pdf',
    location,
    md5: createHash('md5').update(pdfData).digest('hex'),
    public: false,
  };

  await getRepository(File).insert(file);

  return file;
}

