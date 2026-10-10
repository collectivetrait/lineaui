import { prefix } from '../config.js';

const ATTR = `data-${prefix}tooltip`;
const BLOCK = `${prefix}tooltip`;
let idCounter = 0;

export function initTooltip() {
  document.querySelectorAll(`[${ATTR}]`).forEach((trigger) => {
    if (trigger._lnTooltip) return;
    const t = new Tooltip(trigger);
    t.init();
  });
}

export class Tooltip {
  constructor(trigger) {
    this.trigger = trigger;
    this.tooltip = null;
    this.showTimeout = null;
    this.id = `${BLOCK}-${++idCounter}`;
  }

  init() {
    this.trigger._lnTooltip = true;
    this.trigger.addEventListener('mouseenter', () => this.scheduleShow());
    this.trigger.addEventListener('focusin', () => this.scheduleShow());
    this.trigger.addEventListener('mouseleave', () => this.hide());
    this.trigger.addEventListener('focusout', () => this.hide());
    this.trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.hide();
    });
  }

  scheduleShow() {
    if (this.showTimeout) return;
    this.showTimeout = setTimeout(() => this.show(), 200);
  }

  show() {
    if (this.tooltip) return;

    const text = this.trigger.getAttribute(ATTR);
    if (!text) return;

    const position = this.trigger.getAttribute(`${ATTR}-position`) || 'top';

    this.tooltip = document.createElement('div');
    this.tooltip.className = `${BLOCK} ${BLOCK}--${position}`;
    this.tooltip.id = this.id;
    this.tooltip.setAttribute('role', 'tooltip');
    this.tooltip.textContent = text;

    const arrow = document.createElement('div');
    arrow.className = `${BLOCK}__arrow`;
    this.tooltip.appendChild(arrow);

    document.body.appendChild(this.tooltip);
    this.trigger.setAttribute('aria-describedby', this.id);

    this.position(position);
  }

  hide() {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }

    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
      this.trigger.removeAttribute('aria-describedby');
    }
  }

  position(placement) {
    if (!this.tooltip) return;

    const triggerRect = this.trigger.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();
    const gap = 8;

    let top, left;

    switch (placement) {
      case 'bottom':
        top = triggerRect.bottom + gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'start':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - gap;
        break;
      case 'end':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + gap;
        break;
      default: // top
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
    }

    this.tooltip.style.top = `${top + window.scrollY}px`;
    this.tooltip.style.left = `${left + window.scrollX}px`;
  }
}
