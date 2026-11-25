(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const api = window.__christmas;
  if (!api) { $('status').textContent = '动画暂未载入，请刷新页面或下载 MP4 观看。'; return; }
  const defaults = {speed:1,snow:1,glow:1,greeting:'MERRY CHRISTMAS',subtitle:'愿所有美好，如雪而至'};
  const timeText = seconds => '00:' + String(Math.min(20, Math.floor(seconds))).padStart(2,'0');
  let scrubbing = false;
  const updateRange = input => input.style.setProperty('--progress', ((Number(input.value)-Number(input.min))/(Number(input.max)-Number(input.min))*100) + '%');
  function updatePlayback(time, playing) {
    if (!scrubbing) { $('timeline').value = time; updateRange($('timeline')); }
    $('current-time').textContent = timeText(time);
    $('play-label').textContent = playing ? '暂停' : '播放';
    $('play').querySelector('.play-icon').textContent = playing ? 'Ⅱ' : '▷';
    $('play').setAttribute('aria-label', playing ? '暂停动画' : '播放动画');
  }
  $('play').addEventListener('click', () => { api.isPlaying() ? api.pause() : api.play(); updatePlayback(api.getTime(),api.isPlaying()); });
  $('timeline').addEventListener('pointerdown', () => { scrubbing = true; });
  $('timeline').addEventListener('input', e => { api.setTime(Number(e.target.value)); updateRange(e.target); $('current-time').textContent=timeText(Number(e.target.value)); });
  $('timeline').addEventListener('change', () => { scrubbing = false; updatePlayback(api.getTime(),api.isPlaying()); });
  $('timeline').addEventListener('pointerup', () => { scrubbing = false; });
  for (const key of ['greeting','subtitle']) $(''+key).addEventListener('input', e => api.setOptions({[key]:e.target.value}));
  for (const key of ['speed','snow','glow']) {
    const input = $(key);
    const update = () => {
      const value=Number(input.value);
      $(key+'-value').value = key==='speed' ? value.toFixed(1)+'×' : Math.round(value*100)+'%';
      updateRange(input);
    };
    input.addEventListener('input', () => { api.setOptions({[key]:Number(input.value)}); update(); });
    update();
  }
  $('reset').addEventListener('click', () => {
    api.setOptions({...defaults}); api.resetView(); api.setTime(0);
    for (const [key,value] of Object.entries(defaults)) $(key).value=value;
    for (const key of ['speed','snow','glow']) { $(key+'-value').value=key==='speed' ? '1.0×' : '100%'; updateRange($(key)); }
    updatePlayback(api.getTime(),api.isPlaying()); $('status').textContent='已恢复初始祝福与画面。';
  });
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if ($('artwork').requestFullscreen) await $('artwork').requestFullscreen();
      else { document.body.classList.toggle('immersive'); $('status').textContent='此浏览器不支持全屏，可使用手机竖屏观看。'; }
    } catch { $('status').textContent='浏览器未允许全屏，请直接观看或下载影片。'; }
  }
  $('fullscreen').addEventListener('click',fullscreen);
  $('exit-fullscreen').addEventListener('click',fullscreen);
  document.addEventListener('fullscreenchange',() => { $('fullscreen').textContent=document.fullscreenElement?'退出全屏':'全屏'; });
  $('mobile-toggle').addEventListener('click', () => {
    const open=document.querySelector('.sidebar').classList.toggle('is-open');
    $('mobile-toggle').setAttribute('aria-expanded',String(open));
    $('mobile-toggle-label').textContent=open?'收起 −':'播放与调整 +';
  });
  document.addEventListener('keydown',e => {
    if (e.code==='Space' && !['INPUT','BUTTON','SUMMARY','TEXTAREA','A'].includes(document.activeElement.tagName)) { e.preventDefault(); $('play').click(); }
  });
  const priorFrame = api.onFrame;
  api.onFrame=(time,playing) => { if (typeof priorFrame==='function') priorFrame(time,playing); updatePlayback(time,playing); };
  updatePlayback(api.getTime(),api.isPlaying());
})();
