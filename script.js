// Instructions dialog. <dialog>.showModal() brings focus trapping, Esc-to-close
// and inert background for free, so the only thing left to wire up is opening,
// the close button, and a click on the backdrop.
(() => {
  const dlg = document.getElementById('howto');
  if (!dlg) return;

  for (const btn of document.querySelectorAll('[data-open-howto]')) {
    btn.addEventListener('click', () => dlg.showModal());
  }
  for (const btn of dlg.querySelectorAll('[data-close-howto]')) {
    btn.addEventListener('click', () => dlg.close());
  }

  // The dialog has no padding of its own, so a click that lands on the element
  // itself rather than on its contents came from the backdrop.
  dlg.addEventListener('click', e => {
    if (e.target === dlg) dlg.close();
  });

  // Esc-to-close is meant to be the UA's job, but not every embedded browser
  // actions it — measured: the keydown arrives, `cancel` never fires. Closing
  // explicitly is a no-op wherever the built-in behaviour already worked.
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && dlg.open) dlg.close();
  });
})();
