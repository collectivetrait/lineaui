import { prefix } from '../config.js';

const ATTR = `data-${prefix}highlight`;

export function initHighlight() {
  document.querySelectorAll(`[${ATTR}]`).forEach((block) => {
    if (block._lnHighlight) return;
    const h = new Highlight(block);
    h.init();
  });
}

export class Highlight {
  constructor(block) {
    this.block = block;
    this.code = block.querySelector('code') || block;
    this.lang = block.getAttribute(ATTR) || this.detectLanguage();
  }

  init() {
    this.block._lnHighlight = true;

    // Defer to external highlighter if available
    if (typeof window.Prism !== 'undefined' && window.Prism.highlightElement) {
      if (this.lang) this.code.classList.add(`language-${this.lang}`);
      window.Prism.highlightElement(this.code);
      return;
    }

    if (typeof window.hljs !== 'undefined' && window.hljs.highlightElement) {
      if (this.lang) this.code.classList.add(this.lang);
      window.hljs.highlightElement(this.code);
      return;
    }

    // Minimal built-in tokenizer
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
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const rules = {
      html: [
        { pattern: /<!--[\s\S]*?-->/g, cls: 'comment' },
        { pattern: /(<\/?)([\w-]+)/g, replace: (_, bracket, tag) => `${esc(bracket)}<span class="hl-tag">${esc(tag)}</span>` },
        { pattern: /([\w-]+)(=)(".*?")/g, replace: (_, attr, eq, val) => `<span class="hl-attr">${esc(attr)}</span>${esc(eq)}<span class="hl-string">${esc(val)}</span>` },
      ],
      css: [
        { pattern: /\/\*[\s\S]*?\*\//g, cls: 'comment' },
        { pattern: /"[^"]*"|'[^']*'/g, cls: 'string' },
        { pattern: /[\w-]+(?=\s*:)/g, cls: 'attr' },
        { pattern: /#[0-9a-fA-F]{3,8}\b/g, cls: 'number' },
        { pattern: /\b\d+(\.\d+)?(px|em|rem|%|vh|vw|s|ms)?\b/g, cls: 'number' },
      ],
      js: [
        { pattern: /\/\/.*$/gm, cls: 'comment' },
        { pattern: /\/\*[\s\S]*?\*\//g, cls: 'comment' },
        { pattern: /"[^"]*"|'[^']*'|`[^`]*`/g, cls: 'string' },
        { pattern: /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|new|this|true|false|null|undefined|async|await)\b/g, cls: 'keyword' },
        { pattern: /\b\d+(\.\d+)?\b/g, cls: 'number' },
      ],
    };

    const langRules = rules[lang];
    if (!langRules) return esc(src);

    let result = esc(src);
    for (const rule of langRules) {
      if (rule.replace) {
        result = result.replace(rule.pattern, rule.replace);
      } else {
        result = result.replace(rule.pattern, (match) =>
          `<span class="hl-${rule.cls}">${match}</span>`
        );
      }
    }

    return result;
  }
}
