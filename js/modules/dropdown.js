import { prefix } from '../config.js';

const TOGGLE = `${prefix}dropdown__toggle`;
const MENU = `${prefix}dropdown__menu`;
const ITEM = `${prefix}dropdown__item`;

export function initDropdown() {
  document.querySelectorAll(`[data-${prefix}dropdown]`).forEach((root) => {
    if (root._lnDropdown) return;
    root._lnDropdown = true;
    const dd = new Dropdown(root);
    dd.init();
  });
}

export class Dropdown {
  constructor(root) {
    this.root = root;
    this.toggle = root.querySelector(`.${TOGGLE}`);
    this.menu = root.querySelector(`.${MENU}`);
    this.items = [];
    this.activeIndex = -1;
  }

  init() {
    if (!this.toggle || !this.menu) return;
    this.items = [...this.menu.querySelectorAll(`.${ITEM}:not([disabled])`)];

    this.toggle.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.open();
        this.focusItem(0);
      }
    });

    this.menu.addEventListener('keydown', (e) => this.onMenuKeydown(e));

    this.menu.addEventListener('toggle', (e) => {
      if (e.newState === 'closed') {
        this.activeIndex = -1;
        this.clearActive();
      }
    });
  }

  open() {
    if (this.menu.matches?.(':popover-open')) return;
    this.menu.showPopover?.();
  }

  close() {
    this.menu.hidePopover?.();
    this.toggle.focus();
  }

  focusItem(index) {
    this.activeIndex = Math.max(0, Math.min(index, this.items.length - 1));
    this.items.forEach((item, i) => {
      item.toggleAttribute('data-active', i === this.activeIndex);
    });
    this.items[this.activeIndex]?.focus();
  }

  clearActive() {
    this.items.forEach((item) => {
      item.removeAttribute('data-active');
    });
  }

  onMenuKeydown(e) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.focusItem(this.activeIndex + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.focusItem(this.activeIndex - 1);
        break;
      case 'Home':
        e.preventDefault();
        this.focusItem(0);
        break;
      case 'End':
        e.preventDefault();
        this.focusItem(this.items.length - 1);
        break;
      case 'Escape':
        e.preventDefault();
        this.close();
        break;
      default:
        if (e.key.length === 1) {
          const char = e.key.toLowerCase();
          const start = (this.activeIndex + 1) % this.items.length;
          for (let i = 0; i < this.items.length; i++) {
            const idx = (start + i) % this.items.length;
            const text = this.items[idx].textContent.trim().toLowerCase();
            if (text.startsWith(char)) {
              this.focusItem(idx);
              break;
            }
          }
        }
    }
  }
}
