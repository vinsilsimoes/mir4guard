/** Independent image, light, mist and ember planes; no character deformation. */
import { createWorldEffects } from './world-effects.js';

export function setupAtmosphere() {
  const gsap = window.gsap;
  if (!gsap) return;
  const root = document.querySelector('.landing');
  const toggle = document.querySelector('.motion-toggle');
  const art = document.querySelector('.scene-art');
  const camera = document.querySelector('.scene-camera');
  const embers = document.querySelector('.embers');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 700px)');
  const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const animations = [];
  let pausedByUser = false;
  let pointerTween;
  let pendingPointerFrame = 0;
  let pointerPosition = { x: 0, y: 0 };

  const keep = (animation) => { animations.push(animation); return animation; };
  const shouldPause = () => pausedByUser || document.hidden || reduced.matches;
  const world = createWorldEffects({gsap, register: keep, mobile});

  function sync() {
    const paused = shouldPause();
    animations.forEach((animation) => animation.paused(paused));
    pointerTween?.paused(paused);
    root.dataset.motion = reduced.matches ? 'reduced' : paused ? 'paused' : 'playing';
    toggle.hidden = reduced.matches;
    toggle.setAttribute('aria-pressed', String(pausedByUser));
    const label = pausedByUser ? 'Retomar animações' : 'Pausar animações';
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
    if (paused) {
      cancelAnimationFrame(pendingPointerFrame);
      pendingPointerFrame = 0;
    }
  }

  function makeEmbers() {
    embers.replaceChildren();
    const count = mobile.matches ? 7 : 18;
    for (let i = 0; i < count; i++) {
      const spark = document.createElement('i');
      const depth = i % 3;
      spark.style.left = (mobile.matches ? 37 + ((i * 17) % 59) : 43 + ((i * 13) % 55)) + '%';
      spark.style.top = (61 + ((i * 19) % 44)) + '%';
      spark.style.width = (depth === 2 ? 3 : 1.5) + 'px';
      spark.style.height = (depth === 2 ? 4 : 2) + 'px';
      spark.style.filter = depth === 2 ? 'blur(.5px)' : 'none';
      embers.append(spark);
      const duration = 7 + (i % 5) * 1.1;
      const rise = mobile.matches ? 135 + depth * 40 : 180 + depth * 80;
      const wind = 25 + (i % 4) * 17;
      const cycle = keep(gsap.timeline({repeat: -1}));
      cycle.fromTo(spark,
        {x: 0, y: 0, rotation: -15},
        {x: -wind, y: -rise, rotation: 40, duration, ease: 'none'}, 0)
        .fromTo(spark, {opacity: 0}, {opacity: depth === 2 ? .75 : .5, duration: duration * .18, ease: 'sine.out'}, 0)
        .to(spark, {opacity: 0, duration: duration * .3, ease: 'sine.in'}, duration * .7);
      // Pre-distribute sparks through their cycles: no long empty start.
      cycle.progress(((i * 29 + 13) % 97) / 100);
    }
  }

  function initialize() {
    animations.splice(0).forEach((animation) => animation.kill());
    pointerTween?.kill();
    cancelAnimationFrame(pendingPointerFrame);
    pendingPointerFrame = 0;
    embers.replaceChildren();
    gsap.set([camera, art, '.brand', 'h1', '.hero-description', '.hero-action', '.mist', '.scene-light'], {clearProps: 'transform,opacity'});
    world.reset();
    if (!reduced.matches) {
      const small = mobile.matches;
      // Uniform camera motion only: armor, face and body never warp.
      const cameraCycle = keep(gsap.timeline({repeat: -1, yoyo: true}));
      cameraCycle.fromTo(art,
        {scale: small ? 1.025 : 1.04, xPercent: small ? .35 : .5, yPercent: 0},
        {scale: small ? 1.075 : 1.12, xPercent: small ? -.65 : -1.1, yPercent: small ? -.45 : -.8,
          duration: small ? 18 : 20, ease: 'sine.inOut'});
      // Start mid-curve so the camera visibly moves from the first moments.
      cameraCycle.progress(.2);
      keep(gsap.timeline()
        .from('.brand', {y: -4, duration: .6, ease: 'power2.out'})
        .from('h1', {y: 9, duration: .85, ease: 'power2.out'}, 0)
        .from(['.hero-description', '.hero-action'], {y: 7, duration: .8, stagger: .06, ease: 'power2.out'}, .08));
      keep(gsap.fromTo('.mist-far', {xPercent: -18, yPercent: 3},
        {xPercent: 13, yPercent: -3, duration: 30, repeat: -1, yoyo: true, ease: 'sine.inOut'}));
      keep(gsap.fromTo('.mist-near', {xPercent: 12, yPercent: 4},
        {xPercent: -21, yPercent: -5, duration: small ? 20 : 17, repeat: -1, yoyo: true, ease: 'sine.inOut'}));
      keep(gsap.fromTo('.mist-near', {opacity: small ? .19 : .22},
        {opacity: small ? .29 : .36, duration: 9, repeat: -1, yoyo: true, ease: 'sine.inOut'}));
      keep(gsap.fromTo('.scene-light', {opacity: .04, xPercent: -3},
        {opacity: .13, xPercent: 7, duration: 12, repeat: -1, yoyo: true, ease: 'sine.inOut'}));
      makeEmbers();
      world.play();
    }
    sync();
  }

  function updatePointer() {
    pendingPointerFrame = 0;
    if (shouldPause() || mobile.matches || !pointer.matches) return;
    pointerTween?.kill();
    pointerTween = gsap.to(camera, {
      x: pointerPosition.x * 20, y: pointerPosition.y * 12,
      duration: 1.4, ease: 'power2.out'
    });
  }
  root.addEventListener('pointermove', (event) => {
    if (shouldPause() || mobile.matches || !pointer.matches) return;
    pointerPosition = {x: event.clientX / window.innerWidth - .5, y: event.clientY / window.innerHeight - .5};
    if (!pendingPointerFrame) pendingPointerFrame = requestAnimationFrame(updatePointer);
  }, {passive: true});
  root.addEventListener('pointerleave', () => {
    if (shouldPause() || mobile.matches) return;
    pointerPosition = {x: 0, y: 0};
    cancelAnimationFrame(pendingPointerFrame);
    updatePointer();
  });
  pointer.addEventListener('change', () => {pointerTween?.kill(); gsap.set(camera, {clearProps: 'transform'});});
  toggle.addEventListener('click', () => {pausedByUser = !pausedByUser; sync();});
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', initialize);
  mobile.addEventListener('change', initialize);
  window.addEventListener('pagehide', () => {animations.forEach((animation) => animation.pause()); pointerTween?.pause();});
  window.addEventListener('pageshow', sync);
  initialize();
}

