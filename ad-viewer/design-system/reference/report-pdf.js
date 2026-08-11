(function () {
  'use strict';

  const MAX_REPORT_BYTES = 850 * 1024;
  const RENDER_PROFILES = [
    { width: 1200, quality: 0.72 },
    { width: 1000, quality: 0.62 },
    { width: 820, quality: 0.52 },
    { width: 680, quality: 0.44 }
  ];

  function requirePdfTools() {
    if (typeof window.html2canvas !== 'function' || !window.jspdf || !window.jspdf.jsPDF) {
      const error = new Error('PDF tools did not load.');
      error.code = 'PDF_TOOLS_MISSING';
      throw error;
    }
  }

  function buildPdf(canvas, profile, aliasPrefix) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 8;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2;
    const sourcePageHeight = canvas.width * contentHeight / contentWidth;
    const pageCount = Math.max(1, Math.ceil(canvas.height / sourcePageHeight));
    const outputWidth = Math.min(profile.width, canvas.width);
    const outputHeight = Math.round(outputWidth * contentHeight / contentWidth);
    const pageCanvas = document.createElement('canvas');
    const context = pageCanvas.getContext('2d', { alpha: false });
    pageCanvas.width = outputWidth;
    pageCanvas.height = outputHeight;

    for (let page = 0; page < pageCount; page += 1) {
      if (page > 0) pdf.addPage();
      context.fillStyle = '#0b0e25';
      context.fillRect(0, 0, outputWidth, outputHeight);
      const sourceY = page * sourcePageHeight;
      const sourceHeight = Math.min(sourcePageHeight, canvas.height - sourceY);
      const drawnHeight = Math.round(outputHeight * sourceHeight / sourcePageHeight);
      context.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, outputWidth, drawnHeight);
      const imageData = pageCanvas.toDataURL('image/jpeg', profile.quality);
      pdf.setFillColor(11, 14, 37);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      pdf.addImage(imageData, 'JPEG', margin, margin, contentWidth, contentHeight, `${aliasPrefix}-${page}`, 'FAST');
    }

    return pdf.output('blob');
  }

  async function create(options) {
    requirePdfTools();
    const captureEl = typeof options.element === 'string'
      ? document.querySelector(options.element)
      : options.element;
    if (!captureEl) throw new Error('The report section was not found.');
    if (document.fonts && document.fonts.ready) await document.fonts.ready;

    const canvas = await window.html2canvas(captureEl, {
      backgroundColor: '#0b0e25',
      scale: 1,
      useCORS: true,
      allowTaint: false,
      imageTimeout: 8000,
      ignoreElements: options.ignoreElements,
      onclone: clonedDocument => {
        const clonedCapture = clonedDocument.querySelector(options.cloneSelector);
        if (clonedCapture) {
          clonedCapture.style.padding = '32px';
          clonedCapture.style.boxSizing = 'border-box';
        }
      }
    });

    let report = null;
    for (const profile of RENDER_PROFILES) {
      report = buildPdf(canvas, profile, options.aliasPrefix || 'results');
      if (report.size <= MAX_REPORT_BYTES) break;
    }
    if (report.size > MAX_REPORT_BYTES) {
      const error = new Error('The report is too large to email.');
      error.code = 'PDF_TOO_LARGE';
      throw error;
    }
    return report;
  }

  window.BlackbeltReport = { create, maxBytes: MAX_REPORT_BYTES };
})();
