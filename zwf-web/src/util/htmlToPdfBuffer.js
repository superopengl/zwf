import { jsPDF } from "jspdf";
import { Subject } from "rxjs";
// import html2pdf from 'html2pdf';

export const htmlToPdfBuffer$ = (dom, filename) => {
  const pdfDoc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });
  pdfDoc.setFontSize(8);
  const source$ = new Subject();

  // pdfDoc.html(html, {
  //   callback: doc => {
  //     const buffer = doc.output('arraybuffer');
  //     source$.next(buffer);
  //   },
  //   filename,
  //   autoPaging: true,
  //   // margin: 30,
  //   image: {
  //     type: 'png'
  //   }
  // });

  const opt = {
    margin: 1,
    filename: 'myfile.pdf',
    image: { type: 'png', quality: 0.98 },
    // html2canvas:  { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
  // eslint-disable-next-line no-undef
  html2pdf().set(opt).from(dom).toPdf().get('pdf').then(doc => {
    const buffer = doc.output('arraybuffer');
    source$.next(buffer);
  })

  return source$;
}