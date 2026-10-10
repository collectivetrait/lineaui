import { prefix } from '../config.js';

const ATTR = `data-${prefix}dismiss`;
const DISMISSIBLE = `data-${prefix}dismissible`;

export function initDismiss() {
  document.querySelectorAll(`[${ATTR}]`).forEach((trigger) => {
    if (trigger._lnDismiss) return;
    const d = new Dismiss(trigger);
    d.init();
  });
}

export class Dismiss {
  constructor(trigger) {
    this.trigger = trigger;
  }

  init() {
    this.trigger._lnDismiss = true;
    this.trigger.addEventListener('click', () => this.dismiss());
  }

  dismiss() {
    const selector = this.trigger.getAttribute(ATTR);
    let target;

    if (selector) {
      target = document.querySelector(selector);
    } else {
      target = this.trigger.closest(`[${DISMISSIBLE}]`);
    }

    if (!target) {
      target = this.trigger.parentElement;
    }

    if (target) {
      target.hidden = true;
      target.dispatchEvent(new CustomEvent(`${prefix}dismiss`, { bubbles: true }));
    }
  }
}
