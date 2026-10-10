import { prefix } from '../config.js';

const BLOCK = `${prefix}toast`;
const REGION = `${prefix}toast-region`;
let region = null;

export function initToast() {
  if (!region) {
    region = document.createElement('div');
    region.className = `${REGION} ${REGION}--bottom-end`;
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-relevant', 'additions');
    document.body.appendChild(region);
  }
}

export class Toast {
  static show({ title, body, role, duration = 5000, solid = false, position } = {}) {
    if (!region) initToast();

    if (position) {
      region.className = `${REGION} ${REGION}--${position}`;
    }

    const toast = document.createElement('div');
    const classes = [BLOCK];
    if (role) classes.push(`${BLOCK}--${role}`);
    if (solid) classes.push(`${BLOCK}--solid`);
    toast.className = classes.join(' ');
    toast.setAttribute('role', 'alert');
    toast.setAttribute(`data-${prefix}dismissible`, '');

    let html = '';

    html += `<div class="${BLOCK}__content">`;
    if (title) html += `<div class="${BLOCK}__title">${escapeHtml(title)}</div>`;
    if (body) html += `<div class="${BLOCK}__body">${escapeHtml(body)}</div>`;
    html += '</div>';

    html += `<button class="${BLOCK}__close" data-${prefix}dismiss aria-label="Close">&times;</button>`;

    if (duration > 0) {
      html += `<div class="${BLOCK}__timer" style="width: 100%"></div>`;
    }

    toast.innerHTML = html;
    region.appendChild(toast);

    const closeBtn = toast.querySelector(`.${BLOCK}__close`);
    closeBtn.addEventListener('click', () => remove(toast));

    if (duration > 0) {
      const timer = toast.querySelector(`.${BLOCK}__timer`);
      let remaining = duration;
      let startTime = Date.now();
      let paused = false;

      const updateTimer = () => {
        if (paused) return;
        const elapsed = Date.now() - startTime;
        const pct = Math.max(0, 1 - elapsed / duration);
        if (timer) timer.style.width = `${pct * 100}%`;

        if (pct <= 0) {
          remove(toast);
        } else {
          requestAnimationFrame(updateTimer);
        }
      };

      requestAnimationFrame(updateTimer);

      toast.addEventListener('mouseenter', () => {
        paused = true;
        remaining = Math.max(0, duration - (Date.now() - startTime));
      });

      toast.addEventListener('mouseleave', () => {
        paused = false;
        startTime = Date.now() - (duration - remaining);
        requestAnimationFrame(updateTimer);
      });
    }

    return toast;
  }
}

function remove(toast) {
  toast.remove();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
