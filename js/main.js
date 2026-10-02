(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Parallax starfield ──
     Three depth layers. Far stars are small, dim and barely move with the
     scroll; near stars are larger, brighter and move faster. The nearest
     layer swaps a few of its stars for tiny outlined triangles. */

  const LAYERS = [
    { density: 0.00028, size: [0.4, 0.9], alpha: [0.25, 0.55], scroll: 0.04, pointer: 4, triangles: 0 },
    { density: 0.00011, size: [0.7, 1.3], alpha: [0.4, 0.8], scroll: 0.12, pointer: 10, triangles: 0 },
    { density: 0.00004, size: [1.1, 1.8], alpha: [0.6, 1], scroll: 0.28, pointer: 20, triangles: 0.14 },
  ];
  const DRIFT = 2.2; // px per second, scaled by each layer's scroll factor

  const canvas = document.getElementById('stars');
  const ctx = canvas.getContext('2d');
  const heroTri = document.querySelector('.hero__tri');

  let width = 0;
  let height = 0;
  let stars = [];
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

  const rand = (min, max) => min + Math.random() * (max - min);
  const wrap = (value, size) => ((value % size) + size) % size;

  function build() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    stars = LAYERS.map((layer) => {
      const count = Math.round(width * height * layer.density);
      return Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: rand(layer.size[0], layer.size[1]),
        a: rand(layer.alpha[0], layer.alpha[1]),
        twinkle: rand(0.3, 1.1),
        phase: rand(0, Math.PI * 2),
        triangle: Math.random() < layer.triangles,
      }));
    });
  }

  function draw(time) {
    const t = time / 1000;
    const scrollY = window.scrollY;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 0.8;

    LAYERS.forEach((layer, i) => {
      const dy = scrollY * layer.scroll + (reduceMotion ? 0 : t * DRIFT * layer.scroll * 10);
      const ox = pointer.x * layer.pointer;
      const oy = pointer.y * layer.pointer;

      for (const s of stars[i]) {
        const x = wrap(s.x - ox, width);
        const y = wrap(s.y - dy - oy, height);
        const flicker = reduceMotion ? 1 : 0.75 + 0.25 * Math.sin(t * s.twinkle + s.phase);
        ctx.globalAlpha = s.a * flicker;

        if (s.triangle) {
          const h = s.r * 3.2;
          ctx.beginPath();
          ctx.moveTo(x, y - h);
          ctx.lineTo(x + h * 0.9, y + h * 0.6);
          ctx.lineTo(x - h * 0.9, y + h * 0.6);
          ctx.closePath();
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(x, y, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
    ctx.globalAlpha = 1;

    if (heroTri && !reduceMotion) {
      heroTri.style.transform = `translate3d(0, ${scrollY * 0.18}px, 0)`;
      heroTri.style.opacity = Math.max(0, 1 - scrollY / (height * 0.7));
    }
  }

  function frame(time) {
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;
    draw(time);
    requestAnimationFrame(frame);
  }

  build();
  window.addEventListener('resize', () => {
    // Mobile browsers fire resize as the URL bar hides; only rebuild on width changes.
    if (window.innerWidth !== width) build();
    else if (reduceMotion) draw(0);
  });

  if (reduceMotion) {
    // No drift, twinkle or pointer movement: redraw only as the page scrolls.
    draw(0);
    window.addEventListener('scroll', () => draw(0), { passive: true });
  } else {
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      pointer.tx = e.clientX / width - 0.5;
      pointer.ty = e.clientY / height - 0.5;
    }, { passive: true });
    requestAnimationFrame(frame);
  }

  /* ── Mobile menu ── */

  const toggle = document.querySelector('.nav__toggle');
  const links = document.getElementById('nav-links');
  const setMenu = (open) => {
    links.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Close' : 'Menu';
  };
  toggle.addEventListener('click', () => setMenu(!links.classList.contains('is-open')));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });

  /* ── Photo lightbox ── */

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox.querySelector('img');
  const lightboxCaption = lightbox.querySelector('p');

  document.querySelector('.photos').addEventListener('click', (e) => {
    const img = e.target.closest('.photo img');
    if (!img) return;
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = img.closest('.photo').querySelector('figcaption')?.textContent ?? '';
    lightbox.showModal();
  });
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.closest('.lightbox__close')) lightbox.close();
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
