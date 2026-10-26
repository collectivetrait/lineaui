import { prefix } from '../config.js';

const STORAGE_KEY = `${prefix}sidebar`;
const navbarPrefix = `${prefix}navbar`;
const panelClass = `${navbarPrefix}__panel`;
const collapseClass = `${navbarPrefix}--collapse`;
let documentListenersAdded = false;

export function initNavigation() {
  const shellClass = `${prefix}shell`;

  // Restore sidebar state from localStorage
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'open') {
    document.querySelectorAll(`.${shellClass}`).forEach((shell) => {
      shell.dataset.sidebar = 'open';
    });
  }

  // Wire up sidebar toggle buttons
  document.querySelectorAll(`[data-${prefix}sidebar-toggle]`).forEach((btn) => {
    if (btn._lnNav) return;
    btn._lnNav = true;
    btn.addEventListener('click', () => {
      const shell = btn.closest(`.${shellClass}`);
      if (!shell) return;
      const isOpen = shell.dataset.sidebar === 'open';
      if (isOpen) {
        delete shell.dataset.sidebar;
        localStorage.setItem(STORAGE_KEY, 'closed');
      } else {
        shell.dataset.sidebar = 'open';
        localStorage.setItem(STORAGE_KEY, 'open');
      }
    });
  });

  // Navbar sticky detection for transparent bars
  document.querySelectorAll(`.${navbarPrefix}--sticky.${navbarPrefix}--transparent`).forEach((navbar) => {
    if (navbar._lnNav) return;
    navbar._lnNav = true;
    const sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px;pointer-events:none;';
    navbar.parentElement.insertBefore(sentinel, navbar);

    const observer = new IntersectionObserver(([entry]) => {
      navbar.classList.toggle('is-stuck', !entry.isIntersecting);
    }, { threshold: 0 });

    observer.observe(sentinel);
  });

  // --- Helpers ---

  function closeTarget(target, trigger) {
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (target) target.setAttribute('aria-hidden', 'true');
  }

  function openTarget(target, trigger) {
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    if (target) target.setAttribute('aria-hidden', 'false');
  }

  function getToggleTarget(navbar) {
    const explicitPanel = navbar.querySelector(`.${panelClass}:not([id])`);
    if (explicitPanel) return explicitPanel;
    if (navbar.classList.contains(collapseClass)) {
      return navbar.querySelector(`.${navbarPrefix}__nav`);
    }
    return null;
  }

  function closeNamedPanels(navbar, except) {
    const selector = `.${panelClass}[id][aria-hidden="false"], .${navbarPrefix}__megamenu[aria-hidden="false"]`;
    navbar.querySelectorAll(selector).forEach((el) => {
      if (el === except) return;
      const id = el.getAttribute('id');
      const trigger = id ? navbar.querySelector(`[data-${prefix}navbar-panel="${id}"]`) : null;
      closeTarget(el, trigger);
    });
  }

  // --- Global toggle (data-ln-navbar-toggle) ---

  document.querySelectorAll(`[data-${prefix}navbar-toggle]`).forEach((btn) => {
    if (btn._lnNav) return;
    btn._lnNav = true;
    btn.addEventListener('click', () => {
      const navbar = btn.closest(`.${navbarPrefix}`);
      if (!navbar) return;
      const target = getToggleTarget(navbar);
      if (!target) return;
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeTarget(target, btn);
      } else {
        openTarget(target, btn);
      }
    });
  });

  // --- Named panel toggle (data-ln-navbar-panel) ---

  document.querySelectorAll(`[data-${prefix}navbar-panel]`).forEach((btn) => {
    if (btn._lnNav) return;
    btn._lnNav = true;
    btn.addEventListener('click', () => {
      const navbar = btn.closest(`.${navbarPrefix}`);
      if (!navbar) return;
      const targetId = btn.getAttribute(`data-${prefix}navbar-panel`);
      const target = navbar.querySelector(`#${targetId}`);
      if (!target) return;
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeTarget(target, btn);
      } else {
        closeNamedPanels(navbar, target);
        openTarget(target, btn);
      }
    });
  });

  // --- Collapse mode: add/remove __panel class on __nav ---

  document.querySelectorAll(`.${collapseClass}`).forEach((navbar) => {
    if (navbar._lnCollapse) return;
    navbar._lnCollapse = true;

    const hasExplicitPanel = !!navbar.querySelector(`.${panelClass}:not([id])`);
    if (hasExplicitPanel) return;

    const nav = navbar.querySelector(`.${navbarPrefix}__nav`);
    if (!nav) return;

    const bp = getComputedStyle(document.documentElement).getPropertyValue('--ln-collapse-bp') || '768px';
    const mq = window.matchMedia(`(max-width: ${parseFloat(bp) - 0.02}px)`);

    function apply(mobile) {
      if (mobile) {
        nav.classList.add(panelClass);
        if (!nav.hasAttribute('aria-hidden')) {
          nav.setAttribute('aria-hidden', 'true');
        }
      } else {
        nav.classList.remove(panelClass);
        nav.removeAttribute('aria-hidden');
      }
    }

    apply(mq.matches);
    mq.addEventListener('change', (e) => apply(e.matches));
  });

  // --- Document-level listeners (once) ---

  if (documentListenersAdded) return;
  documentListenersAdded = true;

  // Escape: close named panels/megamenus, then collapse nav
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;

    // Named panels and megamenus
    const namedSelector = `.${panelClass}[id][aria-hidden="false"], .${navbarPrefix}__megamenu[aria-hidden="false"]`;
    document.querySelectorAll(namedSelector).forEach((el) => {
      const navbar = el.closest(`.${navbarPrefix}`);
      if (!navbar) return;
      const id = el.getAttribute('id');
      const trigger = id ? navbar.querySelector(`[data-${prefix}navbar-panel="${id}"]`) : null;
      closeTarget(el, trigger);
      if (trigger) trigger.focus();
    });

    // Collapse nav and explicit panels
    document.querySelectorAll(`.${panelClass}:not([id])[aria-hidden="false"]`).forEach((panel) => {
      const navbar = panel.closest(`.${navbarPrefix}`);
      if (!navbar) return;
      const toggle = navbar.querySelector(`[data-${prefix}navbar-toggle]`);
      closeTarget(panel, toggle);
      if (toggle) toggle.focus();
    });
  });

  // Outside click: close named panels and megamenus
  document.addEventListener('click', (e) => {
    const namedSelector = `.${panelClass}[id][aria-hidden="false"], .${navbarPrefix}__megamenu[aria-hidden="false"]`;
    document.querySelectorAll(namedSelector).forEach((el) => {
      const navbar = el.closest(`.${navbarPrefix}`);
      if (!navbar) return;
      const id = el.getAttribute('id');
      const trigger = id ? navbar.querySelector(`[data-${prefix}navbar-panel="${id}"]`) : null;
      if (el.contains(e.target)) return;
      if (trigger && trigger.contains(e.target)) return;
      closeTarget(el, trigger);
    });
  });
}
