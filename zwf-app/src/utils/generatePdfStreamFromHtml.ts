import * as pdf from 'html-pdf';

export async function generatePdfStreamFromHtml(html, options) {
  return new Promise<any>((res, rej) => {
    pdf.create(html, options).toStream((err, stream) => {
      if (err)
        return rej(err);
      res(stream);
    });
  });
}

export async function generatePdfBufferFromHtml(html, options) {
  return new Promise<any>((res, rej) => {
    pdf.create(html, options).toBuffer((err, buffer) => {
      if (err)
        return rej(err);
      res(buffer);
    });
  });
}
