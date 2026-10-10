import { prefix } from '../config.js';

const ATTR = `data-${prefix}gallery`;
const MAIN = `${prefix}gallery__main`;
const SLIDE = `${prefix}gallery__slide`;
const THUMB = `${prefix}gallery__thumb`;
const DOT = `${prefix}gallery__dot`;

export function initGallery() {
  document.querySelectorAll(`[${ATTR}]`).forEach((root) => {
    if (root._lnGallery) return;
    const g = new Gallery(root);
    g.init();
  });
}

export class Gallery {
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

    const observer = new IntersectionObserver(
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

    this.slides.forEach((slide) => observer.observe(slide));

    this.thumbs.forEach((thumb, i) => {
      thumb.addEventListener('click', () => this.goTo(i));
    });

    this.dots.forEach((dot, i) => {
      dot.addEventListener('click', () => this.goTo(i));
    });

    this.main.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.goTo(this.activeIndex + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.goTo(this.activeIndex - 1);
      }
    });

    this.setActive(0);
  }

  goTo(index) {
    index = Math.max(0, Math.min(index, this.slides.length - 1));
    this.slides[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }

  setActive(index) {
    this.activeIndex = index;

    this.thumbs.forEach((thumb, i) => {
      thumb.classList.toggle('is-active', i === index);
      thumb.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });

    this.dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
      dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
  }
}
