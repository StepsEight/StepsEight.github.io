import {getDocument, GlobalWorkerOptions} from './pdfjs/pdf.min.js';

GlobalWorkerOptions.workerSrc = new URL('./pdfjs/pdf.worker.min.js', import.meta.url).href;
const windowElement = document.querySelector('.cv-pdf');
const pagesElement = document.querySelector('#cv-pdf-pages');
const statusElement = document.querySelector('#cv-preview-status');
const zoomLabel = document.querySelector('#cv-zoom-level');
const buttons = [...document.querySelectorAll('[data-zoom]')];
let documentPdf, zoom = 1, rendering = false, pending = false;

async function render() {
  if (!documentPdf) return;
  if (rendering) { pending = true; return; }
  rendering = true;
  try {
    const fragment = document.createDocumentFragment();
    const availableWidth = Math.max(100, windowElement.clientWidth - 32);
    const availableHeight = windowElement.clientHeight - 32;
    for (let index = 1; index <= documentPdf.numPages; index++) {
      const page = await documentPdf.getPage(index);
      const original = page.getViewport({scale:1});
      const scale = Math.min(availableWidth / original.width, availableHeight / original.height) * zoom;
      const viewport = page.getViewport({scale});
      const density = Math.min(window.devicePixelRatio || 1, 2);
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width * density);
      canvas.height = Math.ceil(viewport.height * density);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      canvas.setAttribute('role','img');
      canvas.setAttribute('aria-label',`CV page ${index} of ${documentPdf.numPages}`);
      await page.render({canvasContext:canvas.getContext('2d'), viewport,
        transform:density === 1 ? null : [density,0,0,density,0,0]}).promise;
      fragment.append(canvas);
    }
    pagesElement.replaceChildren(fragment);
    statusElement.textContent = `${documentPdf.numPages} page${documentPdf.numPages === 1 ? '' : 's'}`;
    zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
    windowElement.dataset.ready = 'true';
    buttons.forEach(button => { button.disabled = false; });
    buttons.find(button=>button.dataset.zoom==='out').disabled = zoom <= 0.6;
    buttons.find(button=>button.dataset.zoom==='in').disabled = zoom >= 3;
  } catch(error) {
    statusElement.textContent = 'Preview unavailable. Please open the PDF below.';
    console.error('CV preview:', error);
  } finally {
    rendering = false;
    if (pending) { pending = false; render(); }
  }
}

buttons.forEach(button => button.addEventListener('click', () => {
  zoom = button.dataset.zoom === 'fit' ? 1 : Math.max(0.6, Math.min(3, zoom + (button.dataset.zoom === 'in' ? 0.25 : -0.25)));
  render();
}));

try {
  documentPdf = await getDocument(windowElement.dataset.pdfUrl).promise;
  await render();
  let resizeTimer;
  new ResizeObserver(() => { clearTimeout(resizeTimer); resizeTimer = setTimeout(render,150); }).observe(windowElement);
} catch(error) {
  statusElement.textContent = 'Preview unavailable. Please open the PDF below.';
  console.error('CV PDF load:', error);
}
