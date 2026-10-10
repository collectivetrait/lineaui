import { prefix } from '../config.js';

const ATTR = `data-${prefix}dialog`;
const CLOSE_ATTR = `data-${prefix}dialog-close`;

export function initDialog() {
  document.querySelectorAll(`[${ATTR}]`).forEach((trigger) => {
    if (trigger._lnDialog) return;
    const d = new Dialog(trigger);
    d.init();
  });
}

export class Dialog {
  constructor(trigger) {
    this.trigger = trigger;
    this.targetId = trigger.getAttribute(ATTR);
    this.dialog = null;
  }

  init() {
    this.trigger._lnDialog = true;
    this.dialog = document.getElementById(this.targetId);
    if (!this.dialog) return;

    this.trigger.addEventListener('click', () => this.open());

    this.dialog.addEventListener('click', (e) => {
      if (e.target === this.dialog) this.close();
    });

    this.dialog.querySelectorAll(`[${CLOSE_ATTR}]`).forEach((btn) => {
      btn.addEventListener('click', () => this.close());
    });

    this.dialog.addEventListener('close', () => {
      this.dialog.dispatchEvent(
        new CustomEvent(`${prefix}dialog:close`, { bubbles: true })
      );
    });
  }

  open() {
    if (!this.dialog) return;
    this.dialog.showModal();
    this.dialog.dispatchEvent(
      new CustomEvent(`${prefix}dialog:open`, { bubbles: true })
    );
  }

  close() {
    if (!this.dialog) return;
    this.dialog.close();
  }
}
