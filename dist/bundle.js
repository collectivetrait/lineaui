// config.json
var config_default = {
  prefix: "ln-"
};

// js/config.js
var prefix = config_default.prefix;

// js/modules/rhythm.js
var ATTR = `data-${prefix}grid-toggle`;
function initRhythm() {
  document.querySelectorAll(`[${ATTR}]`).forEach((trigger) => {
    if (trigger._lnGridToggle) return;
    trigger._lnGridToggle = true;
    trigger.addEventListener("click", () => {
      const selector = trigger.getAttribute(ATTR);
      const target = selector ? document.querySelector(selector) : trigger.parentElement;
      if (!target) return;
      const active = target.classList.toggle("show-grid");
      trigger.setAttribute("aria-pressed", String(active));
    });
  });
}

// js/modules/navigation.js
var STORAGE_KEY = `${prefix}sidebar`;
var documentListenersAdded = false;
function initNavigation() {
  const shellClass = `${prefix}shell`;
  const navbarPrefix = `${prefix}navbar`;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "open") {
    document.querySelectorAll(`.${shellClass}`).forEach((shell) => {
      shell.dataset.sidebar = "open";
    });
  }
  document.querySelectorAll(`[data-${prefix}sidebar-toggle]`).forEach((btn) => {
    if (btn._lnNav) return;
    btn._lnNav = true;
    btn.addEventListener("click", () => {
      const shell = btn.closest(`.${shellClass}`);
      if (!shell) return;
      const isOpen = shell.dataset.sidebar === "open";
      if (isOpen) {
        delete shell.dataset.sidebar;
        localStorage.setItem(STORAGE_KEY, "closed");
      } else {
        shell.dataset.sidebar = "open";
        localStorage.setItem(STORAGE_KEY, "open");
      }
    });
  });
  document.querySelectorAll(`.${navbarPrefix}--sticky.${navbarPrefix}--transparent`).forEach((navbar) => {
    if (navbar._lnNav) return;
    navbar._lnNav = true;
    const sentinel = document.createElement("div");
    sentinel.style.cssText = "position:absolute;top:0;height:1px;width:1px;pointer-events:none;";
    navbar.parentElement.insertBefore(sentinel, navbar);
    const observer2 = new IntersectionObserver(([entry]) => {
      navbar.classList.toggle("is-stuck", !entry.isIntersecting);
    }, { threshold: 0 });
    observer2.observe(sentinel);
  });
  function closeNavbarPanel(navbar) {
    const toggle = navbar.querySelector(`[data-${prefix}navbar-toggle]`);
    const panel = navbar.querySelector(`.${navbarPrefix}__panel`);
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    if (panel) panel.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove(`${prefix}navbar-open`);
  }
  function openNavbarPanel(navbar) {
    const toggle = navbar.querySelector(`[data-${prefix}navbar-toggle]`);
    const panel = navbar.querySelector(`.${navbarPrefix}__panel`);
    if (toggle) toggle.setAttribute("aria-expanded", "true");
    if (panel) panel.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add(`${prefix}navbar-open`);
  }
  document.querySelectorAll(`[data-${prefix}navbar-toggle]`).forEach((btn) => {
    if (btn._lnNav) return;
    btn._lnNav = true;
    btn.addEventListener("click", () => {
      const navbar = btn.closest(`.${navbarPrefix}`);
      if (!navbar) return;
      const expanded = btn.getAttribute("aria-expanded") === "true";
      if (expanded) {
        closeNavbarPanel(navbar);
      } else {
        openNavbarPanel(navbar);
      }
    });
  });
  if (documentListenersAdded) return;
  documentListenersAdded = true;
  document.addEventListener("click", (e) => {
    document.querySelectorAll(`.${navbarPrefix}__panel[aria-hidden="false"]`).forEach((panel) => {
      const navbar = panel.closest(`.${navbarPrefix}`);
      if (navbar && !navbar.contains(e.target)) {
        closeNavbarPanel(navbar);
      }
    });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    document.querySelectorAll(`.${navbarPrefix}__panel[aria-hidden="false"]`).forEach((panel) => {
      const navbar = panel.closest(`.${navbarPrefix}`);
      if (navbar) closeNavbarPanel(navbar);
    });
  });
}

// js/modules/dialog.js
var ATTR2 = `data-${prefix}dialog`;
var CLOSE_ATTR = `data-${prefix}dialog-close`;
function initDialog() {
  document.querySelectorAll(`[${ATTR2}]`).forEach((trigger) => {
    if (trigger._lnDialog) return;
    const d = new Dialog(trigger);
    d.init();
  });
}
var Dialog = class {
  constructor(trigger) {
    this.trigger = trigger;
    this.targetId = trigger.getAttribute(ATTR2);
    this.dialog = null;
  }
  init() {
    this.trigger._lnDialog = true;
    this.dialog = document.getElementById(this.targetId);
    if (!this.dialog) return;
    this.trigger.addEventListener("click", () => this.open());
    this.dialog.addEventListener("click", (e) => {
      if (e.target === this.dialog) this.close();
    });
    this.dialog.querySelectorAll(`[${CLOSE_ATTR}]`).forEach((btn) => {
      btn.addEventListener("click", () => this.close());
    });
    this.dialog.addEventListener("close", () => {
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
};

// js/modules/dropdown.js
var TOGGLE = `${prefix}dropdown__toggle`;
var MENU = `${prefix}dropdown__menu`;
var ITEM = `${prefix}dropdown__item`;
function initDropdown() {
  document.querySelectorAll(`[data-${prefix}dropdown]`).forEach((root) => {
    if (root._lnDropdown) return;
    root._lnDropdown = true;
    const dd = new Dropdown(root);
    dd.init();
  });
}
var Dropdown = class {
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
    this.toggle.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.open();
        this.focusItem(0);
      }
    });
    this.menu.addEventListener("keydown", (e) => this.onMenuKeydown(e));
    this.menu.addEventListener("toggle", (e) => {
      if (e.newState === "closed") {
        this.activeIndex = -1;
        this.clearActive();
      }
    });
  }
  open() {
    if (this.menu.matches?.(":popover-open")) return;
    this.menu.showPopover?.();
  }
  close() {
    this.menu.hidePopover?.();
    this.toggle.focus();
  }
  focusItem(index) {
    this.activeIndex = Math.max(0, Math.min(index, this.items.length - 1));
    this.items.forEach((item, i) => {
      item.toggleAttribute("data-active", i === this.activeIndex);
    });
    this.items[this.activeIndex]?.focus();
  }
  clearActive() {
    this.items.forEach((item) => {
      item.removeAttribute("data-active");
    });
  }
  onMenuKeydown(e) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.focusItem(this.activeIndex + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        this.focusItem(this.activeIndex - 1);
        break;
      case "Home":
        e.preventDefault();
        this.focusItem(0);
        break;
      case "End":
        e.preventDefault();
        this.focusItem(this.items.length - 1);
        break;
      case "Escape":
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
};

// js/modules/tooltip.js
var ATTR3 = `data-${prefix}tooltip`;
var BLOCK = `${prefix}tooltip`;
var idCounter = 0;
function initTooltip() {
  document.querySelectorAll(`[${ATTR3}]`).forEach((trigger) => {
    if (trigger._lnTooltip) return;
    const t = new Tooltip(trigger);
    t.init();
  });
}
var Tooltip = class {
  constructor(trigger) {
    this.trigger = trigger;
    this.tooltip = null;
    this.showTimeout = null;
    this.id = `${BLOCK}-${++idCounter}`;
  }
  init() {
    this.trigger._lnTooltip = true;
    this.trigger.addEventListener("mouseenter", () => this.scheduleShow());
    this.trigger.addEventListener("focusin", () => this.scheduleShow());
    this.trigger.addEventListener("mouseleave", () => this.hide());
    this.trigger.addEventListener("focusout", () => this.hide());
    this.trigger.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.hide();
    });
  }
  scheduleShow() {
    if (this.showTimeout) return;
    this.showTimeout = setTimeout(() => this.show(), 200);
  }
  show() {
    if (this.tooltip) return;
    const text = this.trigger.getAttribute(ATTR3);
    if (!text) return;
    const position = this.trigger.getAttribute(`${ATTR3}-position`) || "top";
    this.tooltip = document.createElement("div");
    this.tooltip.className = `${BLOCK} ${BLOCK}--${position}`;
    this.tooltip.id = this.id;
    this.tooltip.setAttribute("role", "tooltip");
    this.tooltip.textContent = text;
    const arrow = document.createElement("div");
    arrow.className = `${BLOCK}__arrow`;
    this.tooltip.appendChild(arrow);
    document.body.appendChild(this.tooltip);
    this.trigger.setAttribute("aria-describedby", this.id);
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
      this.trigger.removeAttribute("aria-describedby");
    }
  }
  position(placement) {
    if (!this.tooltip) return;
    const triggerRect = this.trigger.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();
    const gap = 8;
    let top, left;
    switch (placement) {
      case "bottom":
        top = triggerRect.bottom + gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case "start":
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - gap;
        break;
      case "end":
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + gap;
        break;
      default:
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
    }
    this.tooltip.style.top = `${top + window.scrollY}px`;
    this.tooltip.style.left = `${left + window.scrollX}px`;
  }
};

// js/modules/tabs.js
var TAB = `${prefix}tabs__tab`;
var PANEL = `${prefix}tabs__panel`;
var LIST = `${prefix}tabs__list`;
function initTabs() {
  document.querySelectorAll(`[data-${prefix}tabs]`).forEach((root) => {
    if (root._lnTabs) return;
    root._lnTabs = true;
    const tabs = new Tabs(root);
    tabs.init();
  });
}
var Tabs = class {
  constructor(root) {
    this.root = root;
    this.tablist = root.querySelector(`.${LIST}`);
    this.tabs = [...root.querySelectorAll(`.${TAB}`)];
    this.panels = [...root.querySelectorAll(`.${PANEL}`)];
    this.manual = root.dataset[`${prefix}tabs`] === "manual" || root.getAttribute(`data-${prefix}tabs`) === "manual";
  }
  init() {
    if (!this.tablist || this.tabs.length === 0) return;
    this.tablist.setAttribute("role", "tablist");
    this.tabs.forEach((tab, i) => {
      tab.setAttribute("role", "tab");
      const panelId = tab.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : this.panels[i];
      if (panel) panel.setAttribute("role", "tabpanel");
      if (tab.getAttribute("aria-selected") !== "true") {
        tab.setAttribute("aria-selected", "false");
        tab.setAttribute("tabindex", "-1");
        if (panel) panel.hidden = true;
      } else {
        tab.setAttribute("tabindex", "0");
        if (panel) panel.hidden = false;
      }
    });
    if (!this.tabs.some((t) => t.getAttribute("aria-selected") === "true")) {
      this.activate(this.tabs[0]);
    }
    this.tablist.addEventListener("keydown", (e) => this.onKeydown(e));
    this.tablist.addEventListener("click", (e) => {
      const tab = e.target.closest(`.${TAB}`);
      if (tab) this.activate(tab);
    });
    const hashAttr = `data-${prefix}tabs-hash`;
    if (this.root.hasAttribute(hashAttr)) {
      this.syncFromHash();
      window.addEventListener("hashchange", () => this.syncFromHash());
    }
  }
  activate(tab) {
    this.tabs.forEach((t, i) => {
      const isActive = t === tab;
      t.setAttribute("aria-selected", isActive ? "true" : "false");
      t.setAttribute("tabindex", isActive ? "0" : "-1");
      const panelId = t.getAttribute("aria-controls");
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
      case "ArrowRight":
      case "ArrowDown":
        next = this.tabs[(idx + 1) % this.tabs.length];
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = this.tabs[(idx - 1 + this.tabs.length) % this.tabs.length];
        break;
      case "Home":
        next = this.tabs[0];
        break;
      case "End":
        next = this.tabs[this.tabs.length - 1];
        break;
      default:
        return;
    }
    e.preventDefault();
    if (this.manual) {
      next.focus();
      next.setAttribute("tabindex", "0");
      e.target.setAttribute("tabindex", "-1");
    } else {
      this.activate(next);
    }
  }
  syncFromHash() {
    const hash = location.hash.slice(1);
    const tab = this.tabs.find((t) => t.getAttribute("aria-controls") === hash);
    if (tab) this.activate(tab);
  }
};

// js/modules/toast.js
var BLOCK2 = `${prefix}toast`;
var REGION = `${prefix}toast-region`;
var region = null;
function initToast() {
  if (!region) {
    region = document.createElement("div");
    region.className = `${REGION} ${REGION}--bottom-end`;
    region.setAttribute("aria-live", "polite");
    region.setAttribute("aria-relevant", "additions");
    document.body.appendChild(region);
  }
}

// js/modules/dismiss.js
var ATTR4 = `data-${prefix}dismiss`;
var DISMISSIBLE = `data-${prefix}dismissible`;
function initDismiss() {
  document.querySelectorAll(`[${ATTR4}]`).forEach((trigger) => {
    if (trigger._lnDismiss) return;
    const d = new Dismiss(trigger);
    d.init();
  });
}
var Dismiss = class {
  constructor(trigger) {
    this.trigger = trigger;
  }
  init() {
    this.trigger._lnDismiss = true;
    this.trigger.addEventListener("click", () => this.dismiss());
  }
  dismiss() {
    const selector = this.trigger.getAttribute(ATTR4);
    let target;
    if (selector) {
      target = document.querySelector(selector);
    } else {
      target = this.trigger.closest(`[${DISMISSIBLE}]`);
    }
    if (!target) {
      target = this.trigger.parentElement;
    }
    if (target) {
      target.hidden = true;
      target.dispatchEvent(new CustomEvent(`${prefix}dismiss`, { bubbles: true }));
    }
  }
};

// js/modules/quantity.js
var ATTR5 = `data-${prefix}quantity`;
var DEC = `${prefix}quantity__decrement`;
var INC = `${prefix}quantity__increment`;
var INPUT = `${prefix}quantity__input`;
function initQuantity() {
  document.querySelectorAll(`[${ATTR5}]`).forEach((root) => {
    if (root._lnQuantity) return;
    const q = new Quantity(root);
    q.init();
  });
}
var Quantity = class {
  constructor(root) {
    this.root = root;
    this.input = root.querySelector(`.${INPUT}`);
    this.decBtn = root.querySelector(`.${DEC}`);
    this.incBtn = root.querySelector(`.${INC}`);
  }
  init() {
    if (!this.input) return;
    this.root._lnQuantity = true;
    this.decBtn?.addEventListener("click", () => this.step(-1));
    this.incBtn?.addEventListener("click", () => this.step(1));
    this.input.addEventListener("change", () => this.clamp());
    this.updateButtons();
  }
  get min() {
    return Number(this.input.min) || 0;
  }
  get max() {
    return Number(this.input.max) || Infinity;
  }
  get stepVal() {
    return Number(this.input.step) || 1;
  }
  get value() {
    return Number(this.input.value) || 0;
  }
  step(direction) {
    const next = this.value + this.stepVal * direction;
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
    this.input.dispatchEvent(new Event("change", { bubbles: true }));
    this.updateButtons();
  }
  updateButtons() {
    if (this.decBtn) this.decBtn.disabled = this.value <= this.min;
    if (this.incBtn) this.incBtn.disabled = this.value >= this.max;
  }
};

// js/modules/gallery.js
var ATTR6 = `data-${prefix}gallery`;
var MAIN = `${prefix}gallery__main`;
var SLIDE = `${prefix}gallery__slide`;
var THUMB = `${prefix}gallery__thumb`;
var DOT = `${prefix}gallery__dot`;
function initGallery() {
  document.querySelectorAll(`[${ATTR6}]`).forEach((root) => {
    if (root._lnGallery) return;
    const g = new Gallery(root);
    g.init();
  });
}
var Gallery = class {
  constructor(root) {
    this.root = root;
    this.main = root.querySelector(`.${MAIN}`);
    this.slides = [...root.querySelectorAll(`.${SLIDE}`)];
    this.thumbs = [...root.querySelectorAll(`.${THUMB}`)];
    this.dots = [...root.querySelectorAll(`.${DOT}`)];
    this.activeIndex = 0;
  }
  init() {
    if (!this.main || this.slides.length === 0) return;
    this.root._lnGallery = true;
    const observer2 = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = this.slides.indexOf(entry.target);
            if (index !== -1) this.setActive(index);
          }
        }
      },
      { root: this.main, threshold: 0.5 }
    );
    this.slides.forEach((slide) => observer2.observe(slide));
    this.thumbs.forEach((thumb, i) => {
      thumb.addEventListener("click", () => this.goTo(i));
    });
    this.dots.forEach((dot, i) => {
      dot.addEventListener("click", () => this.goTo(i));
    });
    this.main.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        this.goTo(this.activeIndex + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        this.goTo(this.activeIndex - 1);
      }
    });
    this.setActive(0);
  }
  goTo(index) {
    index = Math.max(0, Math.min(index, this.slides.length - 1));
    this.slides[index]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  }
  setActive(index) {
    this.activeIndex = index;
    this.thumbs.forEach((thumb, i) => {
      thumb.classList.toggle("is-active", i === index);
      thumb.setAttribute("aria-selected", i === index ? "true" : "false");
    });
    this.dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === index);
      dot.setAttribute("aria-selected", i === index ? "true" : "false");
    });
  }
};

// js/modules/copy.js
var ATTR7 = `data-${prefix}copy`;
var TARGET_ATTR = `data-${prefix}copy-target`;
var VALUE_ATTR = `data-${prefix}copy-value`;
function initCopy() {
  document.querySelectorAll(`[${ATTR7}]`).forEach((btn) => {
    if (btn._lnCopy) return;
    const c = new Copy(btn);
    c.init();
  });
}
var Copy = class {
  constructor(trigger) {
    this.trigger = trigger;
    this.originalText = trigger.textContent;
  }
  init() {
    this.trigger._lnCopy = true;
    this.trigger.addEventListener("click", () => this.copy());
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
    }
  }
  getValue() {
    const value = this.trigger.getAttribute(VALUE_ATTR);
    if (value) return value;
    const targetSelector = this.trigger.getAttribute(TARGET_ATTR);
    if (targetSelector) {
      const target = document.querySelector(targetSelector);
      return target?.textContent ?? "";
    }
    return "";
  }
  showCopied() {
    this.trigger.setAttribute("data-copied", "");
    const copiedText = this.trigger.getAttribute(`data-${prefix}copy-text`) || "Copied!";
    this.trigger.textContent = copiedText;
    setTimeout(() => {
      this.trigger.removeAttribute("data-copied");
      this.trigger.textContent = this.originalText;
    }, 2e3);
  }
};

// js/modules/table.js
var ATTR8 = `data-${prefix}table`;
var SORT = `${prefix}table__sort`;
var SELECT = `${prefix}table__select`;
function initTable() {
  document.querySelectorAll(`[${ATTR8}]`).forEach((root) => {
    if (root._lnTable) return;
    const t = new Table(root);
    t.init();
  });
}
var Table = class {
  constructor(root) {
    this.root = root;
    this.table = root.querySelector("table") || root;
    this.tbody = this.table.querySelector("tbody");
  }
  init() {
    this.root._lnTable = true;
    this.initSort();
    this.initSelectAll();
  }
  initSort() {
    this.root.querySelectorAll(`.${SORT}`).forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-sort-key");
        if (!key || !this.tbody) return;
        const current = btn.getAttribute("aria-sort");
        const direction = current === "ascending" ? "descending" : "ascending";
        this.root.querySelectorAll(`.${SORT}`).forEach((b) => {
          b.removeAttribute("aria-sort");
        });
        btn.setAttribute("aria-sort", direction);
        const colIndex = this.getColumnIndex(btn);
        if (colIndex === -1) return;
        const rows = [...this.tbody.querySelectorAll("tr")];
        rows.sort((a, b) => {
          const aVal = a.cells[colIndex]?.textContent.trim() ?? "";
          const bVal = b.cells[colIndex]?.textContent.trim() ?? "";
          const aNum = parseFloat(aVal);
          const bNum = parseFloat(bVal);
          let cmp;
          if (!isNaN(aNum) && !isNaN(bNum)) {
            cmp = aNum - bNum;
          } else {
            cmp = aVal.localeCompare(bVal);
          }
          return direction === "ascending" ? cmp : -cmp;
        });
        rows.forEach((row) => this.tbody.appendChild(row));
        this.root.dispatchEvent(
          new CustomEvent(`${prefix}table:sort`, {
            bubbles: true,
            detail: { key, direction }
          })
        );
      });
    });
  }
  getColumnIndex(btn) {
    const th = btn.closest("th");
    if (!th) return -1;
    return [...th.parentElement.children].indexOf(th);
  }
  initSelectAll() {
    const selectAll = this.root.querySelector(`th .${SELECT}`);
    if (!selectAll || !this.tbody) return;
    const rowCheckboxes = () => this.tbody.querySelectorAll(`.${SELECT}`);
    selectAll.addEventListener("change", () => {
      rowCheckboxes().forEach((cb) => {
        cb.checked = selectAll.checked;
      });
      this.root.dispatchEvent(
        new CustomEvent(`${prefix}table:select`, {
          bubbles: true,
          detail: { all: selectAll.checked }
        })
      );
    });
    this.tbody.addEventListener("change", (e) => {
      if (!e.target.classList.contains(SELECT)) return;
      const boxes = [...rowCheckboxes()];
      const allChecked = boxes.every((cb) => cb.checked);
      const someChecked = boxes.some((cb) => cb.checked);
      selectAll.checked = allChecked;
      selectAll.indeterminate = someChecked && !allChecked;
    });
  }
};

// js/modules/highlight.js
var ATTR9 = `data-${prefix}highlight`;
function initHighlight() {
  document.querySelectorAll(`[${ATTR9}]`).forEach((block) => {
    if (block._lnHighlight) return;
    const h = new Highlight(block);
    h.init();
  });
}
var Highlight = class {
  constructor(block) {
    this.block = block;
    this.code = block.querySelector("code") || block;
    this.lang = block.getAttribute(ATTR9) || this.detectLanguage();
  }
  init() {
    this.block._lnHighlight = true;
    if (typeof window.Prism !== "undefined" && window.Prism.highlightElement) {
      if (this.lang) this.code.classList.add(`language-${this.lang}`);
      window.Prism.highlightElement(this.code);
      return;
    }
    if (typeof window.hljs !== "undefined" && window.hljs.highlightElement) {
      if (this.lang) this.code.classList.add(this.lang);
      window.hljs.highlightElement(this.code);
      return;
    }
    const raw = this.code.textContent;
    const highlighted = this.tokenize(raw, this.lang);
    this.code.innerHTML = highlighted;
  }
  detectLanguage() {
    const cls = this.code.className;
    const match = cls.match(/language-(\w+)/);
    return match ? match[1] : null;
  }
  tokenize(src, lang) {
    const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const rules = {
      html: [
        { pattern: /<!--[\s\S]*?-->/g, cls: "comment" },
        { pattern: /(<\/?)([\w-]+)/g, replace: (_, bracket, tag) => `${esc(bracket)}<span class="hl-tag">${esc(tag)}</span>` },
        { pattern: /([\w-]+)(=)(".*?")/g, replace: (_, attr, eq, val) => `<span class="hl-attr">${esc(attr)}</span>${esc(eq)}<span class="hl-string">${esc(val)}</span>` }
      ],
      css: [
        { pattern: /\/\*[\s\S]*?\*\//g, cls: "comment" },
        { pattern: /"[^"]*"|'[^']*'/g, cls: "string" },
        { pattern: /[\w-]+(?=\s*:)/g, cls: "attr" },
        { pattern: /#[0-9a-fA-F]{3,8}\b/g, cls: "number" },
        { pattern: /\b\d+(\.\d+)?(px|em|rem|%|vh|vw|s|ms)?\b/g, cls: "number" }
      ],
      js: [
        { pattern: /\/\/.*$/gm, cls: "comment" },
        { pattern: /\/\*[\s\S]*?\*\//g, cls: "comment" },
        { pattern: /"[^"]*"|'[^']*'|`[^`]*`/g, cls: "string" },
        { pattern: /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|new|this|true|false|null|undefined|async|await)\b/g, cls: "keyword" },
        { pattern: /\b\d+(\.\d+)?\b/g, cls: "number" }
      ]
    };
    const langRules = rules[lang];
    if (!langRules) return esc(src);
    let result = esc(src);
    for (const rule of langRules) {
      if (rule.replace) {
        result = result.replace(rule.pattern, rule.replace);
      } else {
        result = result.replace(
          rule.pattern,
          (match) => `<span class="hl-${rule.cls}">${match}</span>`
        );
      }
    }
    return result;
  }
};

// js/index.js
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
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
var pending = false;
var observer = new MutationObserver(() => {
  if (pending) return;
  pending = true;
  queueMicrotask(() => {
    pending = false;
    init();
  });
});
observer.observe(document.body, { childList: true, subtree: true });
