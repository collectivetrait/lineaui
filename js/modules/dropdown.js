import { prefix } from '../config.js';

const TOGGLE = `${prefix}dropdown__toggle`;
const MENU = `${prefix}dropdown__menu`;
const ITEM = `${prefix}dropdown__item`;

let outsideClickBound = false;
const openNonPopoverDropdowns = new Set();

export function initDropdown() {
  document.querySelectorAll(`[data-${prefix}dropdown]`).forEach((root) => {
    if (root._lnDropdown) return;
    root._lnDropdown = true;
    const dd = new Dropdown(root);
    dd.init();
  });

  if (!outsideClickBound) {
    outsideClickBound = true;
    document.addEventListener('click', (e) => {
      openNonPopoverDropdowns.forEach((dd) => {
        if (!dd.root.contains(e.target)) {
          dd.close();
        }
      });
    });
  }
}

export class Dropdown {
  constructor(root) {
    this.root = root;
    this.toggle = root.querySelector(`.${TOGGLE}`);
    this.menu = root.querySelector(`.${MENU}`);
    this.items = [];
    this.activeIndex = -1;
    this.isPopover = false;
  }

  init() {
    if (!this.toggle || !this.menu) return;
    this.items = [...this.menu.querySelectorAll(`.${ITEM}:not([disabled])`)];
    this.isPopover = this.menu.hasAttribute('popover');

    this.toggle.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.open();
        this.focusItem(0);
      }
    });

    this.menu.addEventListener('keydown', (e) => this.onMenuKeydown(e));

    if (this.isPopover) {
      this.menu.addEventListener('toggle', (e) => {
        if (e.newState === 'closed') {
          this.activeIndex = -1;
          this.clearActive();
        }
      });
    } else {
      this.toggle.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.toggle.getAttribute('aria-expanded') === 'true') {
          this.close();
        } else {
          this.open();
        }
      });
    }
  }

  open() {
    if (this.isPopover) {
      if (this.menu.matches?.(':popover-open')) return;
      this.menu.showPopover?.();
    } else {
      this.toggle.setAttribute('aria-expanded', 'true');
      openNonPopoverDropdowns.add(this);
    }
  }

  close() {
    if (this.isPopover) {
      this.menu.hidePopover?.();
    } else {
      this.toggle.setAttribute('aria-expanded', 'false');
      openNonPopoverDropdowns.delete(this);
    }
    this.activeIndex = -1;
    this.clearActive();
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
