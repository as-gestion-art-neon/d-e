/*
 * Nid de frelons dans l'en-tête : il frétille pour attirer l'œil.
 * Chaque clic le secoue et le fissure ; au 20e clic il tombe, se brise et disparaît.
 */
(() => {
  const HITS_TO_DROP = 20;
  const btn = document.getElementById('nest');
  if (!btn) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = btn.querySelector('.nest__body');
  const cracks = [...btn.querySelectorAll('.nest__crack')];
  let hits = 0, done = false;

  const isSmall = () => innerWidth < 760;
  const rand = (a, b) => a + Math.random() * (b - a);

  function flakes(rect, n, spread) {
    for (let i = 0; i < n; i++) {
      const f = document.createElement('span');
      f.className = 'nest-flake';
      const s = rand(3, 7);
      f.style.cssText = `width:${s}px;height:${s * rand(.5, 1)}px;left:${rect.left + rect.width / 2 + rand(-8, 8)}px;top:${rect.top + rect.height * rand(.4, .8)}px;background:${Math.random() < .5 ? '#c9ab7c' : '#9c7a4f'}`;
      document.body.appendChild(f);
      const vx = rand(-spread, spread), up = rand(10, 40), down = rand(60, 140);
      f.animate([
        { transform: 'translate(0,0) rotate(0)', opacity: 1 },
        { transform: `translate(${vx * .5}px,${-up}px) rotate(${rand(-180, 180)}deg)`, opacity: 1, offset: .3 },
        { transform: `translate(${vx}px,${down}px) rotate(${rand(-360, 360)}deg)`, opacity: 0 }
      ], { duration: rand(600, 1000), easing: 'cubic-bezier(.3,.6,.6,1)' }).finished.then(() => f.remove());
    }
  }

  btn.addEventListener('click', () => {
    if (done) return;
    hits++;
    // secousse
    body.classList.remove('is-hit'); void body.offsetWidth; body.classList.add('is-hit');
    if (!reduced) flakes(body.getBoundingClientRect(), 3, 26);
    // fissures progressives
    cracks.forEach((c, i) => c.classList.toggle('is-on', hits >= (i + 1) * Math.floor(HITS_TO_DROP / (cracks.length + 1))));
    btn.style.setProperty('--damage', (hits / HITS_TO_DROP).toFixed(2));
    if (hits >= HITS_TO_DROP) drop();
  });

  async function drop() {
    done = true;
    btn.disabled = true;
    const r = body.getBoundingClientRect();

    if (reduced) {
      btn.classList.add('is-gone');
      return finish();
    }

    // copie volante (le nid quitte l'en-tête)
    const make = (clip) => {
      const el = document.createElement('div');
      el.className = 'nest-fall';
      el.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;${clip ? 'clip-path:' + clip : ''}`;
      el.innerHTML = body.innerHTML;
      document.body.appendChild(el);
      return el;
    };
    const whole = make();
    btn.classList.add('is-gone');

    // chute
    const floor = innerHeight - (isSmall() ? 84 : 18) - r.height;
    const dy = floor - r.top, dx = rand(-40, 40);
    await whole.animate([
      { transform: 'translate(0,0) rotate(0)' },
      { transform: `translate(${dx * .3}px,-14px) rotate(-12deg)`, offset: .12 },
      { transform: `translate(${dx}px,${dy}px) rotate(${rand(150, 220)}deg)` }
    ], { duration: 900, easing: 'cubic-bezier(.45,0,.9,.55)', fill: 'forwards' }).finished;

    // impact : il se brise en deux + éclats
    const land = whole.getBoundingClientRect();
    const finalT = getComputedStyle(whole).transform;
    whole.remove();
    const halves = ['inset(0 50% 0 0)', 'inset(0 0 0 50%)'].map(make);
    halves.forEach((h, i) => {
      const dir = i ? 1 : -1;
      h.style.transform = finalT;
      h.animate([
        { transform: `${finalT}`, opacity: 1 },
        { transform: `${finalT} translate(${dir * 18}px,-22px) rotate(${dir * 25}deg)`, opacity: 1, offset: .35 },
        { transform: `${finalT} translate(${dir * 34}px,6px) rotate(${dir * 55}deg)`, opacity: 0 }
      ], { duration: 900, easing: 'ease-out', fill: 'forwards' }).finished.then(() => h.remove());
    });
    flakes(land, 14, 70);
    finish();
  }

  function finish() {
    // la place se referme dans l'en-tête
    setTimeout(() => btn.classList.add('is-collapsed'), reduced ? 0 : 400);
    const t = document.getElementById('nest-toast');
    if (t) {
      setTimeout(() => t.classList.add('is-on'), reduced ? 0 : 700);
      setTimeout(() => t.classList.remove('is-on'), 8000);
      t.querySelector('.nest-toast__close').addEventListener('click', () => t.classList.remove('is-on'));
    }
  }
})();
