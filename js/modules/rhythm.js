import { prefix } from '../config.js';

const ATTR = `data-${prefix}grid-toggle`;

export function initRhythm() {
  document.querySelectorAll(`[${ATTR}]`).forEach((trigger) => {
    if (trigger._lnGridToggle) return;
    trigger._lnGridToggle = true;
    trigger.addEventListener('click', () => {
      const selector = trigger.getAttribute(ATTR);
      const target = selector
        ? document.querySelector(selector)
        : trigger.parentElement;

      if (!target) return;

      const active = target.classList.toggle('show-grid');
      trigger.setAttribute('aria-pressed', String(active));
    });
  });
}
