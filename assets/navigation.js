// Academic Pages style priority navigation and a separate compact Follow menu.
(() => {
  const nav = document.querySelector('.site-navigation');
  const primary = nav.querySelector('.nav-primary');
  const visible = nav.querySelector('.nav-visible');
  const overflow = nav.querySelector('.nav-overflow');
  const navButton = nav.querySelector('.nav-toggle');
  const items = [...visible.children];
  const profile = document.querySelector('.author-card');
  const followWrapper = profile.querySelector('.author-links-wrapper');
  const followButton = profile.querySelector('.follow-toggle');
  const contacts = profile.querySelector('.author-links');
  const compact = window.matchMedia('(max-width: 924px)');
  nav.dataset.ready = 'true';
  profile.dataset.followReady = 'true';
  let lastWidth = -1;

  function showNav(open, focus = false) {
    open = open && !navButton.hidden;
    overflow.hidden = !open;
    navButton.setAttribute('aria-expanded', String(open));
    navButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'More navigation');
    nav.classList.toggle('is-open', open);
    if (open && focus) overflow.querySelector('a')?.focus();
  }
  function showFollow(open, focus = false) {
    open = open && compact.matches;
    contacts.classList.toggle('is-open', open);
    followButton.setAttribute('aria-expanded', String(open));
    if (open && focus) contacts.querySelector('a')?.focus();
  }
  function layoutNav() {
    const width = nav.clientWidth;
    if (width === lastWidth) return;
    lastWidth = width;
    const focused = document.activeElement;
    visible.append(...items);
    navButton.hidden = true;
    nav.classList.remove('has-overflow');
    showNav(false);
    if (primary.scrollWidth > nav.clientWidth) {
      navButton.hidden = false;
      nav.classList.add('has-overflow');
      const available = nav.clientWidth - navButton.offsetWidth - 16;
      while (visible.lastElementChild && primary.scrollWidth > available) {
        overflow.prepend(visible.lastElementChild);
      }
      navButton.hidden = overflow.children.length === 0;
      if (!navButton.hidden && overflow.contains(focused)) navButton.focus({preventScroll:true});
    }
  }
  let frame;
  function scheduleLayout() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(layoutNav);
  }
  navButton.addEventListener('click', () => {
    showFollow(false);
    showNav(navButton.getAttribute('aria-expanded') !== 'true');
  });
  followButton.addEventListener('click', () => {
    showNav(false);
    showFollow(followButton.getAttribute('aria-expanded') !== 'true');
  });
  navButton.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') { event.preventDefault(); showFollow(false); showNav(true, true); }
  });
  followButton.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') { event.preventDefault(); showNav(false); showFollow(true, true); }
  });
  document.addEventListener('click', event => {
    if (!nav.contains(event.target)) showNav(false);
    if (!followWrapper.contains(event.target)) showFollow(false);
    if (event.target.closest('a')) { showNav(false); showFollow(false); }
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (navButton.getAttribute('aria-expanded') === 'true') { showNav(false); navButton.focus(); }
    if (followButton.getAttribute('aria-expanded') === 'true') { showFollow(false); followButton.focus(); }
  });
  compact.addEventListener('change', () => showFollow(false));
  window.addEventListener('resize', () => { showFollow(false); scheduleLayout(); });
  new ResizeObserver(scheduleLayout).observe(nav);
  document.fonts.ready.then(() => { lastWidth = -1; scheduleLayout(); });
  layoutNav();
})();
