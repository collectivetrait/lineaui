import { prefix } from '../config.js';

const ATTR = `data-${prefix}quantity`;
const DEC = `${prefix}quantity__decrement`;
const INC = `${prefix}quantity__increment`;
const INPUT = `${prefix}quantity__input`;

export function initQuantity() {
  document.querySelectorAll(`[${ATTR}]`).forEach((root) => {
    if (root._lnQuantity) return;
    const q = new Quantity(root);
    q.init();
  });
}

export class Quantity {
  constructor(root) {
    this.root = root;
    this.input = root.querySelector(`.${INPUT}`);
    this.decBtn = root.querySelector(`.${DEC}`);
    this.incBtn = root.querySelector(`.${INC}`);
  }

  init() {
    if (!this.input) return;
    this.root._lnQuantity = true;

    this.decBtn?.addEventListener('click', () => this.step(-1));
    this.incBtn?.addEventListener('click', () => this.step(1));
    this.input.addEventListener('change', () => this.clamp());

    this.updateButtons();
  }

  get min() { return Number(this.input.min) || 0; }
  get max() { return Number(this.input.max) || Infinity; }
  get stepVal() { return Number(this.input.step) || 1; }
  get value() { return Number(this.input.value) || 0; }

  step(direction) {
    const next = this.value + (this.stepVal * direction);
    this.setValue(next);
  }

  clamp() {
    let val = this.value;
    if (val < this.min) val = this.min;
    if (val > this.max) val = this.max;
    this.setValue(val);
  }

  setValue(val) {
    val = Math.max(this.min, Math.min(val, this.max));
    this.input.value = val;
    this.input.dispatchEvent(new Event('change', { bubbles: true }));
    this.updateButtons();
  }

  updateButtons() {
    if (this.decBtn) this.decBtn.disabled = this.value <= this.min;
    if (this.incBtn) this.incBtn.disabled = this.value >= this.max;
  }
}
