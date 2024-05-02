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


