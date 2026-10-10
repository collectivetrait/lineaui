import { prefix } from '../config.js';

const ATTR = `data-${prefix}copy`;
const TARGET_ATTR = `data-${prefix}copy-target`;
const VALUE_ATTR = `data-${prefix}copy-value`;

export function initCopy() {
  document.querySelectorAll(`[${ATTR}]`).forEach((btn) => {
    if (btn._lnCopy) return;
    const c = new Copy(btn);
    c.init();
  });
}

export class Copy {
  constructor(trigger) {
    this.trigger = trigger;
    this.originalText = trigger.textContent;
  }

  init() {
    this.trigger._lnCopy = true;
    this.trigger.addEventListener('click', () => this.copy());
  }

  async copy() {
    const value = this.getValue();
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      this.showCopied();
      this.trigger.dispatchEvent(
        new CustomEvent(`${prefix}copy`, { bubbles: true, detail: { value } })
      );
    } catch {
      // Clipboard access denied
    }
  }

  getValue() {
    const value = this.trigger.getAttribute(VALUE_ATTR);
    if (value) return value;

    const targetSelector = this.trigger.getAttribute(TARGET_ATTR);
    if (targetSelector) {
      const target = document.querySelector(targetSelector);
      return target?.textContent ?? '';
    }

    return '';
  }

  showCopied() {
    this.trigger.setAttribute('data-copied', '');
    const copiedText = this.trigger.getAttribute(`data-${prefix}copy-text`) || 'Copied!';
    this.trigger.textContent = copiedText;

    setTimeout(() => {
      this.trigger.removeAttribute('data-copied');
      this.trigger.textContent = this.originalText;
    }, 2000);
  }
}
