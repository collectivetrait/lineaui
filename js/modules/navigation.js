import { prefix } from '../config.js';

const STORAGE_KEY = `${prefix}sidebar`;
let documentListenersAdded = false;

export function initNavigation() {
  const shellClass = `${prefix}shell`;
  const navbarPrefix = `${prefix}navbar`;

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

  // Navbar mobile panel toggle
  function closeNavbarPanel(navbar) {
    const toggle = navbar.querySelector(`[data-${prefix}navbar-toggle]`);
    const panel = navbar.querySelector(`.${navbarPrefix}__panel`);
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    if (panel) panel.setAttribute('aria-hidden', 'true');
  }

  function openNavbarPanel(navbar) {
    const toggle = navbar.querySelector(`[data-${prefix}navbar-toggle]`);
    const panel = navbar.querySelector(`.${navbarPrefix}__panel`);
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
    if (panel) panel.setAttribute('aria-hidden', 'false');
  }

  document.querySelectorAll(`[data-${prefix}navbar-toggle]`).forEach((btn) => {
    if (btn._lnNav) return;
    btn._lnNav = true;
    btn.addEventListener('click', () => {
      const navbar = btn.closest(`.${navbarPrefix}`);
      if (!navbar) return;
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeNavbarPanel(navbar);
      } else {
        openNavbarPanel(navbar);
      }
    });
  });

  if (documentListenersAdded) return;
  documentListenersAdded = true;

  // Close navbar panel on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll(`.${navbarPrefix}__panel[aria-hidden="false"]`).forEach((panel) => {
      const navbar = panel.closest(`.${navbarPrefix}`);
      if (navbar) closeNavbarPanel(navbar);
    });
  });
}
