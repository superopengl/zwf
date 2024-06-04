import { EmailTemplateType } from './../types/EmailTemplateType';
import * as fs from 'fs';
import * as path from 'path';
import * as mjml2html from 'mjml';
import * as cheerio from 'cheerio';

const mjmlDir = path.join(__dirname, `../_assets/emailTemplates`);
const cache = new Map<string, CacheItem>();
const emailTemplateKeys = Object.values(EmailTemplateType).filter(x => isNaN(Number(x)));
for(const key of emailTemplateKeys) {
  const html =  getHtmlEmailTemplate(key);
  cache.set(key, {
    subject: extractTitleFromHtml(html),
    html,
  });
}

type CacheItem  = {
  subject: string,
  html: string,
}

function extractTitleFromHtml(html: string): string {
  const htmlDom = cheerio.load(html);
  return htmlDom('html > head > title')?.text()?.trim();
}

function readMjmlFileSync(key: string): string {
  const mjmlFilePath = path.join(mjmlDir, `${key}.mjml`);
  const fileBuffer = fs.readFileSync(mjmlFilePath);
  const mjmlText = fileBuffer.toString('utf-8');
  return mjmlText;
}

function getHtmlEmailTemplate(key: string): string {
  const mjmlText = readMjmlFileSync(key);
  // See https://www.npmjs.com/package/mjml
  const options = {
    keepComments: false,
    filePath: mjmlDir
  };
  const result = mjml2html(mjmlText, options);

  if(!result || result.errors?.length) {
    throw new Error(`Failed to load mjml template for '${key}': ${JSON.stringify(result.errors)}`);
  }

  console.log(`Email template [${key}]`, 'complied'.green);

  return result.html;
}

export const getEmailTemplate = (key: EmailTemplateType): CacheItem => {
  return cache.get(key);
}
