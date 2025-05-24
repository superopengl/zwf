import { Subject } from "rxjs";
// import html2pdf from 'html2pdf';
import domToPdf  from 'dom-to-pdf';

export const htmlToPdfBuffer$ = (htmlString, filename) => {
  // const pdfDoc = new jsPDF({
  //   orientation: 'portrait',
  //   unit: 'pt',
  //   format: 'a4',
  // });
  // pdfDoc.setFontSize(10.5);
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
    pagebreak: {
      mode: 'avoid-all'
    },
    jsPDF: { 
      unit: 'in', 
      format: 'a4', 
      orientation: 'portrait' 
    }
  };
  // const htmlString = dom.getContent();
  // eslint-disable-next-line no-undef
  // html2pdf().set(opt).from(htmlString).toPdf().get('pdf').then(doc => {
  //   const buffer = doc.output('arraybuffer');
  //   debugger;
  //   source$.next(buffer);
  // }).catch(err => {
  //   const ok = err;
  //   debugger;
  // })

  domToPdf(htmlString, opt, pdf => {
    const buffer = pdf.output('arraybuffer');
    source$.next(buffer);
  })

  return source$;
}