import * as pdf from 'html-pdf';


export async function generatePdfBufferFromHtml(html, options) {
  return new Promise<any>((res, rej) => {
    pdf.create(html, options).toBuffer((err, buffer) => {
      if (err)
        return rej(err);
      res(buffer);
    });
  });
}
