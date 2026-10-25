/* The preview images are generated from the public PDF during the site build. */
(() => {
  const viewer = document.querySelector('.cv-pdf');
  const pages = [...document.querySelectorAll('.cv-page')];
  const status = document.querySelector('#cv-preview-status');
  const label = document.querySelector('#cv-zoom-level');
  const buttons = [...document.querySelectorAll('[data-zoom]')];
  let zoom = 1;
  function fit() {
    for (const page of pages) {
      const width = Number(page.getAttribute('width'));
      const height = Number(page.getAttribute('height'));
      const scale = Math.min(Math.max(100,viewer.clientWidth-32)/width,(viewer.clientHeight-32)/height)*zoom;
      page.style.width = `${width*scale}px`;
      page.style.height = `${height*scale}px`;
    }
    label.textContent = `${Math.round(zoom*100)}%`;
    buttons.forEach(button => {
      button.disabled = (button.dataset.zoom==='out' && zoom<=0.6) || (button.dataset.zoom==='in' && zoom>=3);
    });
  }
  const slow = setTimeout(() => {
    if(viewer.dataset.ready!=='true')status.textContent = 'Preview loading slowly. You can open the PDF below.';
  },12000);
  function update() {
    if (pages.some(page=>page.complete && !page.naturalWidth)) {
      clearTimeout(slow);
      status.textContent = 'Preview unavailable. Please open the PDF below.';
      return;
    }
    if (pages.length && pages.every(page=>page.complete && page.naturalWidth>0)) {
      clearTimeout(slow);
      status.textContent = `${pages.length} page${pages.length===1?'':'s'}`;
      viewer.dataset.ready = 'true';
    }
  }
  for (const page of pages) {
    page.addEventListener('load',update);
    page.addEventListener('error',()=>{
      clearTimeout(slow);
      status.textContent = 'Preview unavailable. Please open the PDF below.';
    });
  }
  buttons.forEach(button=>button.addEventListener('click',()=>{
    zoom = button.dataset.zoom==='fit' ? 1 : Math.max(0.6,Math.min(3,zoom+(button.dataset.zoom==='in'?0.25:-0.25)));
    fit();
  }));
  fit(); update();
  new ResizeObserver(fit).observe(viewer);
})();
