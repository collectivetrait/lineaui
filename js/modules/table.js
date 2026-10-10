import { prefix } from '../config.js';

const ATTR = `data-${prefix}table`;
const SORT = `${prefix}table__sort`;
const SELECT = `${prefix}table__select`;

export function initTable() {
  document.querySelectorAll(`[${ATTR}]`).forEach((root) => {
    if (root._lnTable) return;
    const t = new Table(root);
    t.init();
  });
}

export class Table {
  constructor(root) {
    this.root = root;
    this.table = root.querySelector('table') || root;
    this.tbody = this.table.querySelector('tbody');
  }

  init() {
    this.root._lnTable = true;
    this.initSort();
    this.initSelectAll();
  }

  initSort() {
    this.root.querySelectorAll(`.${SORT}`).forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-sort-key');
        if (!key || !this.tbody) return;

        const current = btn.getAttribute('aria-sort');
        const direction = current === 'ascending' ? 'descending' : 'ascending';

        this.root.querySelectorAll(`.${SORT}`).forEach((b) => {
          b.removeAttribute('aria-sort');
        });

        btn.setAttribute('aria-sort', direction);

        const colIndex = this.getColumnIndex(btn);
        if (colIndex === -1) return;

        const rows = [...this.tbody.querySelectorAll('tr')];
        rows.sort((a, b) => {
          const aVal = a.cells[colIndex]?.textContent.trim() ?? '';
          const bVal = b.cells[colIndex]?.textContent.trim() ?? '';
          const aNum = parseFloat(aVal);
          const bNum = parseFloat(bVal);

          let cmp;
          if (!isNaN(aNum) && !isNaN(bNum)) {
            cmp = aNum - bNum;
          } else {
            cmp = aVal.localeCompare(bVal);
          }

          return direction === 'ascending' ? cmp : -cmp;
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
    const th = btn.closest('th');
    if (!th) return -1;
    return [...th.parentElement.children].indexOf(th);
  }

  initSelectAll() {
    const selectAll = this.root.querySelector(`th .${SELECT}`);
    if (!selectAll || !this.tbody) return;

    const rowCheckboxes = () => this.tbody.querySelectorAll(`.${SELECT}`);

    selectAll.addEventListener('change', () => {
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

    this.tbody.addEventListener('change', (e) => {
      if (!e.target.classList.contains(SELECT)) return;
      const boxes = [...rowCheckboxes()];
      const allChecked = boxes.every((cb) => cb.checked);
      const someChecked = boxes.some((cb) => cb.checked);
      selectAll.checked = allChecked;
      selectAll.indeterminate = someChecked && !allChecked;
    });
  }
}
