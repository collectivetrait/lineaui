import { initRhythm } from './modules/rhythm.js';
import { initNavigation } from './modules/navigation.js';
import { initDialog } from './modules/dialog.js';
import { initDropdown } from './modules/dropdown.js';
import { initTooltip } from './modules/tooltip.js';
import { initTabs } from './modules/tabs.js';
import { initToast } from './modules/toast.js';
import { initDismiss } from './modules/dismiss.js';
import { initQuantity } from './modules/quantity.js';
import { initGallery } from './modules/gallery.js';
import { initCopy } from './modules/copy.js';
import { initTable } from './modules/table.js';
import { initHighlight } from './modules/highlight.js';

function init() {
  initRhythm();
  initNavigation();
  initDialog();
  initDropdown();
  initTooltip();
  initTabs();
  initToast();
  initDismiss();
  initQuantity();
  initGallery();
  initCopy();
  initTable();
  initHighlight();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Auto-init for dynamically injected markup
let pending = false;
const observer = new MutationObserver(() => {
  if (pending) return;
  pending = true;
  queueMicrotask(() => { pending = false; init(); });
});

observer.observe(document.body, { childList: true, subtree: true });
