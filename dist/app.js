(() => {
  'use strict';
  const shell = document.getElementById('gift-shell');
  const fullscreenButton = document.getElementById('fullscreen');
  const status = document.getElementById('status');
  const api = () => window.__christmas;

  document.getElementById('replay').addEventListener('click', () => {
    const scene = api();
    if (!scene) return;
    if (typeof scene.replay === 'function') scene.replay();
    else { scene.setTime(0); scene.play(); }
    status.textContent = '再送你一场圣诞星光。';
  });

  const isImmersive = () => Boolean(document.fullscreenElement) || document.body.classList.contains('immersive');
  function updateFullscreenLabel() {
    const active = isImmersive();
    fullscreenButton.textContent = active ? '退出全屏' : '全屏';
    fullscreenButton.setAttribute('aria-pressed', String(active));
  }
  async function fullscreen() {
    if (document.fullscreenElement) {
      try { await document.exitFullscreen(); }
      catch { status.textContent = '可按 Esc 退出全屏。'; }
    } else if (document.body.classList.contains('immersive')) {
      document.body.classList.remove('immersive');
    } else {
      try {
        if (!shell.requestFullscreen) throw new Error('Fullscreen unavailable');
        await shell.requestFullscreen();
      } catch {
        document.body.classList.add('immersive');
      }
    }
    updateFullscreenLabel();
  }
  fullscreenButton.addEventListener('click', fullscreen);
  document.addEventListener('fullscreenchange', updateFullscreenLabel);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.body.classList.contains('immersive')) {
      document.body.classList.remove('immersive');
      updateFullscreenLabel();
    }
  });

  // A tap can add a little extra starlight; a drag stays a rotation gesture.
  const canvas = document.getElementById('scene');
  let pressed = null;
  canvas.addEventListener('pointerdown', event => {
    pressed = { x: event.clientX, y: event.clientY, id: event.pointerId };
  });
  canvas.addEventListener('pointerup', event => {
    if (!pressed || event.pointerId !== pressed.id) return;
    const moved = Math.hypot(event.clientX - pressed.x, event.clientY - pressed.y);
    pressed = null;
    const scene = api();
    if (moved > 9 || typeof scene?.celebrate !== 'function') return;
    const box = canvas.getBoundingClientRect();
    scene.celebrate((event.clientX - box.left) / box.width * canvas.width,
      (event.clientY - box.top) / box.height * canvas.height);
  });
  canvas.addEventListener('pointercancel', () => { pressed = null; });
})();
