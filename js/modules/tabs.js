import { prefix } from '../config.js';

const TAB = `${prefix}tabs__tab`;
const PANEL = `${prefix}tabs__panel`;
const LIST = `${prefix}tabs__list`;

export function initTabs() {
  document.querySelectorAll(`[data-${prefix}tabs]`).forEach((root) => {
    if (root._lnTabs) return;
    root._lnTabs = true;
    const tabs = new Tabs(root);
    tabs.init();
  });
}

export class Tabs {
  constructor(root) {
    this.root = root;
    this.tablist = root.querySelector(`.${LIST}`);
    this.tabs = [...root.querySelectorAll(`.${TAB}`)];
    this.panels = [...root.querySelectorAll(`.${PANEL}`)];
    this.manual = root.dataset[`${prefix}tabs`] === 'manual' ||
                  root.getAttribute(`data-${prefix}tabs`) === 'manual';
  }

  init() {
    if (!this.tablist || this.tabs.length === 0) return;

    this.tablist.setAttribute('role', 'tablist');
    this.tabs.forEach((tab, i) => {
      tab.setAttribute('role', 'tab');
      const panelId = tab.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : this.panels[i];
      if (panel) panel.setAttribute('role', 'tabpanel');

      if (tab.getAttribute('aria-selected') !== 'true') {
        tab.setAttribute('aria-selected', 'false');
        tab.setAttribute('tabindex', '-1');
        if (panel) panel.hidden = true;
      } else {
        tab.setAttribute('tabindex', '0');
        if (panel) panel.hidden = false;
      }
    });

    if (!this.tabs.some(t => t.getAttribute('aria-selected') === 'true')) {
      this.activate(this.tabs[0]);
    }

    this.tablist.addEventListener('keydown', (e) => this.onKeydown(e));
    this.tablist.addEventListener('click', (e) => {
      const tab = e.target.closest(`.${TAB}`);
      if (tab) this.activate(tab);
    });

    const hashAttr = `data-${prefix}tabs-hash`;
    if (this.root.hasAttribute(hashAttr)) {
      this.syncFromHash();
      window.addEventListener('hashchange', () => this.syncFromHash());
    }
  }

  activate(tab) {
    this.tabs.forEach((t, i) => {
      const isActive = t === tab;
      t.setAttribute('aria-selected', isActive ? 'true' : 'false');
      t.setAttribute('tabindex', isActive ? '0' : '-1');
      const panelId = t.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : this.panels[i];
      if (panel) panel.hidden = !isActive;
    });
    tab.focus();
  }

  onKeydown(e) {
    const idx = this.tabs.indexOf(e.target);
    if (idx === -1) return;
    let next;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = this.tabs[(idx + 1) % this.tabs.length];
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = this.tabs[(idx - 1 + this.tabs.length) % this.tabs.length];
        break;
      case 'Home':
        next = this.tabs[0];
        break;
      case 'End':
        next = this.tabs[this.tabs.length - 1];
        break;
      default:
        return;
    }
    e.preventDefault();
    if (this.manual) {
      next.focus();
      next.setAttribute('tabindex', '0');
      e.target.setAttribute('tabindex', '-1');
    } else {
      this.activate(next);
    }
  }

  syncFromHash() {
    const hash = location.hash.slice(1);
    const tab = this.tabs.find(t => t.getAttribute('aria-controls') === hash);
    if (tab) this.activate(tab);
  }
}
