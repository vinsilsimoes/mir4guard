/** Map localized effects to the painted image, including object-fit and crop. */
export function createWorldEffects({ gsap, register, mobile }) {
  const image = document.querySelector('.scene-picture img');
  const overlay = document.querySelector('.world-effects');
  const current = document.querySelector('#water-current');
  const clouds = document.querySelectorAll('.dragon-cloud');
  let layoutFrame = 0;

  function align() {
    layoutFrame = 0;
    const imageStyle = getComputedStyle(image);
    // Keep subpixel sizes: rounding clientWidth can offset a narrow waterfall.
    const width = parseFloat(imageStyle.width);
    const height = parseFloat(imageStyle.height);
    if (!width || !height || !image.naturalWidth || !image.naturalHeight) return;
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const paintedWidth = image.naturalWidth * scale;
    const paintedHeight = image.naturalHeight * scale;
    const [positionX, positionY] = imageStyle.objectPosition.split(' ').map(parseFloat);
    overlay.style.width = paintedWidth + 'px';
    overlay.style.height = paintedHeight + 'px';
    overlay.style.left = (width - paintedWidth) * positionX / 100 + 'px';
    overlay.style.top = (height - paintedHeight) * positionY / 100 + 'px';
    overlay.dataset.aligned = 'true';
  }

  function queueAlignment() {
    if (!layoutFrame) layoutFrame = requestAnimationFrame(align);
  }

  const resize = new ResizeObserver(queueAlignment);
  resize.observe(image);
  image.addEventListener('load', queueAlignment);
  window.addEventListener('resize', queueAlignment, {passive: true});

  function reset() {
    gsap.set(clouds, {clearProps: 'transform,opacity'});
    current.setAttribute('patternTransform', 'translate(0 0)');
    align();
  }

  function play() {
    // The noise tile stitches vertically; wrap exactly one tile, never reverse water.
    register(gsap.fromTo(current,
      {attr: {patternTransform: 'translate(0 0)'}},
      {attr: {patternTransform: 'translate(0 72)'}, duration: 2.1, repeat: -1, ease: 'none'}));

    register(gsap.fromTo('.dragon-cloud-high', {x: -100, y: -5},
      {x: 64, y: 7, duration: 25, repeat: -1, yoyo: true, ease: 'sine.inOut'})).progress(.25);
    register(gsap.fromTo('.dragon-cloud-low', {x: 65, y: 2},
      {x: -80, y: -9, duration: 19, repeat: -1, yoyo: true, ease: 'sine.inOut'})).progress(.35);
    register(gsap.fromTo('.dragon-cloud-high', {opacity: mobile.matches ? .22 : .3},
      {opacity: mobile.matches ? .5 : .64, duration: 12, repeat: -1, yoyo: true, ease: 'sine.inOut'}));
    register(gsap.fromTo('.dragon-cloud-low', {opacity: .18},
      {opacity: mobile.matches ? .35 : .45, duration: 9, repeat: -1, yoyo: true, ease: 'sine.inOut'}));
  }

  return {reset, play};
}
