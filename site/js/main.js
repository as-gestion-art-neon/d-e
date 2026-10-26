(() => {
  // Année du footer
  document.getElementById('year').textContent = new Date().getFullYear();

  // Menu mobile
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }));

  // Carrousels (un par section)
  document.querySelectorAll('.carousel').forEach((root, n) => initCarousel(root, n));

  function initCarousel(root, n) {
  const track = root.querySelector('.carousel__track');
  const slides = [...root.querySelectorAll('.slide')];
  const caption = root.querySelector('.carousel__caption');
  const dotsBox = root.querySelector('.carousel__dots');
  const DELAY = 5000;
  let index = 0, timer = null;

  slides.forEach((s, i) => {
    s.style.setProperty('--bg', `url("${s.querySelector('img').src}")`);
    const d = document.createElement('button');
    d.setAttribute('role', 'tab');
    d.setAttribute('aria-label', `Photo ${i + 1}`);
    d.addEventListener('click', () => { go(i); restart(); });
    dotsBox.appendChild(d);
  });
  const dots = [...dotsBox.children];

  function go(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, j) => d.setAttribute('aria-selected', j === index));
    caption.textContent = slides[index].dataset.caption || '';
    // précharge la suivante
    const next = slides[(index + 1) % slides.length].querySelector('img');
    next.loading = 'eager';
  }
  const start = () => {
    if (slides.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    stop();
    timer = setInterval(() => go(index + 1), DELAY + n * 700); // décalage pour ne pas tourner en même temps
  };
  const stop = () => clearInterval(timer);
  const restart = () => { stop(); start(); };

  root.querySelector('.carousel__btn--prev').addEventListener('click', () => { go(index - 1); restart(); });
  root.querySelector('.carousel__btn--next').addEventListener('click', () => { go(index + 1); restart(); });
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  root.tabIndex = 0;
  root.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { go(index - 1); restart(); }
    if (e.key === 'ArrowRight') { go(index + 1); restart(); }
  });

  // Swipe tactile
  // la photo suit le doigt, puis bascule si le geste dépasse 15 % de la largeur
  let x0 = null, dx = 0;
  track.addEventListener('pointerdown', e => {
    if (e.button > 0) return;
    x0 = e.clientX; dx = 0; stop();
    track.style.transition = 'none';
  });
  track.addEventListener('pointermove', e => {
    if (x0 === null) return;
    dx = e.clientX - x0;
    track.style.transform = `translateX(calc(-${index * 100}% + ${dx}px))`;
  });
  const end = () => {
    if (x0 === null) return;
    x0 = null; track.style.transition = '';
    const limit = Math.min(80, root.clientWidth * 0.15);
    go(Math.abs(dx) > limit ? index + (dx < 0 ? 1 : -1) : index);
    start();
  };
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);
  track.addEventListener('click', e => { if (Math.abs(dx) > 5) e.preventDefault(); }, true);

  document.addEventListener('visibilitychange', () => document.hidden ? stop() : restart());
  if (slides.length < 2) root.querySelectorAll('.carousel__btn, .carousel__dots').forEach(el => el.hidden = true);
  go(0); start();
  }
})();
