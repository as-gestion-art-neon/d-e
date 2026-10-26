/*
 * Petit frelon qui se balade sur la page, capturé par un filet au bout de 30 s,
 * puis remplacé par 3 petites abeilles.
 * Couche décorative : aucune interaction (pointer-events: none), désactivée si
 * l'utilisateur a demandé à réduire les animations.
 */
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const CATCH_AFTER = 30;           // secondes avant la capture
  const BEES = 3;

  const isSmall = () => innerWidth < 600;
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const bounds = () => ({
    x0: 20, y0: isSmall() ? 74 : 84,                       // sous l'en-tête
    x1: innerWidth - 20, y1: innerHeight - (isSmall() ? 100 : 30) // au-dessus de la barre mobile
  });

  /* ---------- Dessins ---------- */
  const HORNET = `
  <svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="hAbd"><ellipse cx="18" cy="23" rx="14" ry="9"/></clipPath></defs>
    <g stroke="#2a1a0a" stroke-width="1.6" stroke-linecap="round" fill="none">
      <path d="M30 26 L26 34 L23 35"/><path d="M34 26 L34 35 L31 37"/><path d="M38 25 L42 33 L45 34"/>
      <path d="M48 13 Q51 5 57 3"/><path d="M46 13 Q47 6 51 1"/>
    </g>
    <path d="M5 21 L0 23.5 L5 26 Z" fill="#2a1a0a"/>
    <ellipse cx="18" cy="23" rx="14" ry="9" fill="#f5c518"/>
    <g clip-path="url(#hAbd)" fill="#2a1a0a">
      <rect x="9" y="10" width="4" height="26"/><rect x="17" y="10" width="4.5" height="26"/><rect x="25.5" y="10" width="4" height="26"/>
    </g>
    <ellipse cx="18" cy="23" rx="14" ry="9" fill="none" stroke="#2a1a0a" stroke-width="1.6"/>
    <ellipse cx="34" cy="21" rx="8" ry="7" fill="#3b2412" stroke="#2a1a0a" stroke-width="1.4"/>
    <circle cx="46" cy="20" r="7.5" fill="#f2a516" stroke="#2a1a0a" stroke-width="1.6"/>
    <ellipse cx="48.5" cy="18" rx="3.2" ry="3.8" fill="#1d1712"/>
    <circle cx="49.5" cy="16.6" r="1" fill="#fff"/>
    <path d="M51 24 Q54 25 53 27" stroke="#2a1a0a" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <g class="wing"><ellipse cx="27" cy="9" rx="13" ry="6.5" transform="rotate(-18 27 9)" fill="rgba(215,232,255,.75)" stroke="#6f7f96" stroke-width="1.2"/></g>
    <g class="wing wing--b"><ellipse cx="33" cy="10" rx="10" ry="5" transform="rotate(-32 33 10)" fill="rgba(215,232,255,.65)" stroke="#6f7f96" stroke-width="1.1"/></g>
  </svg>`;

  const BEE = `
  <svg viewBox="0 0 48 36" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="bAbd"><ellipse cx="19" cy="21" rx="12" ry="10"/></clipPath></defs>
    <path d="M7.5 19.5 L3 21 L7.5 23 Z" fill="#2b2b2b"/>
    <ellipse cx="19" cy="21" rx="12" ry="10" fill="#ffd23f"/>
    <g clip-path="url(#bAbd)" fill="#2b2b2b"><rect x="12" y="8" width="4" height="26"/><rect x="20" y="8" width="4" height="26"/></g>
    <ellipse cx="19" cy="21" rx="12" ry="10" fill="none" stroke="#2b2b2b" stroke-width="1.6"/>
    <circle cx="34" cy="20" r="7.5" fill="#2b2b2b"/>
    <circle cx="36.5" cy="18.5" r="2.3" fill="#fff"/><circle cx="37" cy="18.8" r="1.2" fill="#2b2b2b"/>
    <path d="M36 12.5 Q38 7 42 6" stroke="#2b2b2b" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <g class="wing"><ellipse cx="18" cy="9" rx="8" ry="6" fill="rgba(255,255,255,.85)" stroke="#9aa6b5" stroke-width="1.1"/></g>
    <g class="wing wing--b"><ellipse cx="25" cy="10" rx="6.5" ry="5" fill="rgba(255,255,255,.8)" stroke="#9aa6b5" stroke-width="1.1"/></g>
  </svg>`;

  // Filet : le centre du cerceau est en (40, 40) dans le viewBox
  let mesh = '';
  for (let i = -80; i <= 80; i += 8) {
    mesh += `<line x1="${i}" y1="0" x2="${i + 80}" y2="80"/><line x1="${i + 80}" y1="0" x2="${i}" y2="80"/>`;
  }
  const NET = `
  <svg viewBox="0 0 130 170" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="nHoop"><circle cx="40" cy="40" r="33"/></clipPath></defs>
    <line x1="64" y1="64" x2="124" y2="164" stroke="#8b5a2b" stroke-width="6" stroke-linecap="round"/>
    <line x1="106" y1="134" x2="124" y2="164" stroke="#4a3424" stroke-width="7" stroke-linecap="round"/>
    <circle cx="40" cy="40" r="33" fill="rgba(255,255,255,.18)"/>
    <g class="net-catch" opacity="0"><svg x="20" y="27" width="40" height="25" viewBox="0 0 64 40">${HORNET.replace(/^[\s\S]*?<svg[^>]*>|<\/svg>\s*$/g, '').replace(/id="hAbd"/, 'id="hAbd2"').replace(/url\(#hAbd\)/, 'url(#hAbd2)')}</svg></g>
    <g clip-path="url(#nHoop)" stroke="rgba(70,70,70,.55)" stroke-width="1">${mesh}</g>
    <circle cx="40" cy="40" r="33" fill="none" stroke="#5c5c5c" stroke-width="4"/>
  </svg>`;

  /* ---------- Couche ---------- */
  const layer = document.createElement('div');
  layer.className = 'critters';
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);

  class Flyer {
    constructor(svg, kind, size, speed, x, y, vx = 0, vy = 0) {
      this.el = document.createElement('div');
      this.el.className = `critter critter--${kind}`;
      this.el.innerHTML = svg;
      this.size = size; this.speed = speed;
      this.ratio = kind === 'hornet' ? 40 / 64 : 36 / 48;
      this.el.style.width = size + 'px';
      this.el.style.height = size * this.ratio + 'px';
      this.x = x; this.y = y; this.vx = vx; this.vy = vy;
      this.a = 0; this.t = rand(0, 10); this.frozen = false;
      this.pickTarget();
      layer.appendChild(this.el);
    }
    pickTarget() {
      const b = bounds();
      this.tx = rand(b.x0, b.x1); this.ty = rand(b.y0, b.y1);
      this.retarget = rand(2, 5);
    }
    step(dt) {
      this.t += dt;
      if (this.frozen) {           // pris au piège : il s'agite sur place
        this.render(Math.sin(this.t * 60) * 1.5, Math.cos(this.t * 47) * 1.5);
        return;
      }
      this.retarget -= dt;
      const dx = this.tx - this.x, dy = this.ty - this.y, d = Math.hypot(dx, dy) || 1;
      if (d < 30 || this.retarget < 0) this.pickTarget();
      // pilotage vers la cible + vol un peu erratique
      const k = 2.4;
      this.vx += ((dx / d) * this.speed - this.vx) * k * dt;
      this.vy += ((dy / d) * this.speed - this.vy) * k * dt;
      this.vx += Math.sin(this.t * 3.1) * this.speed * 0.9 * dt;
      this.vy += Math.cos(this.t * 2.3) * this.speed * 0.9 * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt + Math.sin(this.t * 9) * 0.35;
      const b = bounds();
      this.x = clamp(this.x, b.x0, b.x1); this.y = clamp(this.y, b.y0, b.y1);
      this.render(0, 0);
    }
    render(ox, oy) {
      const flip = this.vx < 0;
      const target = clamp(Math.atan2(this.vy, flip ? -this.vx : this.vx), -0.6, 0.6);
      this.a += (target - this.a) * 0.15;
      this.el.style.transform =
        `translate3d(${this.x - this.size / 2 + ox}px, ${this.y - this.size * this.ratio / 2 + oy}px, 0)` +
        `${flip ? ' scaleX(-1)' : ''} rotate(${this.a}rad)`;
    }
    remove() { this.el.remove(); }
  }

  /* ---------- Scénario ---------- */
  const b0 = bounds();
  const hornet = new Flyer(HORNET, 'hornet', isSmall() ? 32 : 40, isSmall() ? 70 : 95,
    rand(b0.x0 + 40, b0.x1 - 40), rand(b0.y0 + 40, b0.y1 - 40));
  let flyers = [hornet];
  let elapsed = 0, catching = false, last = performance.now();

  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);   // pas de saut après un onglet en arrière-plan
    last = now;
    elapsed += dt;
    flyers.forEach(f => f.step(dt));
    if (!catching && elapsed >= CATCH_AFTER) { catching = true; catchHornet(); }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  async function catchHornet() {
    hornet.frozen = true;
    const { x, y } = hornet;
    const k = isSmall() ? 0.75 : 0.9;               // taille du filet
    const net = document.createElement('div');
    net.className = 'critter critter--net';
    net.innerHTML = NET;
    net.style.width = 130 * k + 'px';
    net.style.height = 170 * k + 'px';
    net.style.transformOrigin = `${40 * k}px ${40 * k}px`;
    layer.appendChild(net);

    const at = (dx, dy, r) => `translate3d(${x - 40 * k + dx}px, ${y - 40 * k + dy}px, 0) rotate(${r}deg)`;
    const offX = innerWidth - x + 120, offY = innerHeight - y + 160;

    // 1. le filet arrive depuis le coin
    await net.animate([{ transform: at(offX, offY, 30) }, { transform: at(0, 0, 0) }],
      { duration: 650, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards' }).finished;

    // 2. coup de filet : le frelon est capturé
    const swing = net.animate([{ transform: at(0, 0, 0) }, { transform: at(-6, 4, -22) }, { transform: at(0, 0, 0) }],
      { duration: 260, easing: 'ease-in-out', fill: 'forwards' });
    hornet.el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' });
    net.querySelector('.net-catch').setAttribute('opacity', '1');
    await swing.finished;
    hornet.remove();
    flyers = flyers.filter(f => f !== hornet);

    // 3. le filet repart avec sa prise
    net.animate([{ transform: at(0, 0, 0), opacity: 1 }, { transform: at(offX * .6, offY * .6, 25), opacity: 0 }],
      { duration: 700, easing: 'cubic-bezier(.5,0,.8,.4)', fill: 'forwards' }).finished.then(() => net.remove());

    // 4. trois petites abeilles prennent la place
    await new Promise(r => setTimeout(r, 250));
    for (let i = 0; i < BEES; i++) {
      const ang = (i / BEES) * Math.PI * 2 - Math.PI / 2;
      const bee = new Flyer(BEE, 'bee', isSmall() ? 22 : 26, isSmall() ? 50 : 60,
        x, y, Math.cos(ang) * 110, Math.sin(ang) * 110);
      bee.el.classList.add('critter--pop');
      flyers.push(bee);
    }
  }
})();
