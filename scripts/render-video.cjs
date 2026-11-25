/* Deterministic export of the editable canvas animation. */
const { chromium } = require('playwright-core');
const fs = require('node:fs');
const path = require('node:path');
const { spawn, execFileSync } = require('node:child_process');
const { once } = require('node:events');

async function main() {
  const url = process.argv[2] || 'http://127.0.0.1:8000/';
  const output = path.resolve(process.argv[3] || 'dist/christmas-ascii-20s.mp4');
  const ffmpeg = process.env.FFMPEG_PATH || execFileSync('python', ['-c',
    `import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())`
  ], {encoding: 'utf8', windowsHide: true}).trim();
  const chrome = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const fps = 30, duration = 20, frames = fps * duration;
  fs.mkdirSync(path.dirname(output), {recursive:true});
  const browser = await chromium.launch({executablePath:chrome, headless:true, args:['--autoplay-policy=no-user-gesture-required']});
  const page = await browser.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror', e => errors.push(e.message));
  try {
    await page.goto(url, {waitUntil:'networkidle'});
    await page.waitForFunction(() => window.__christmas && window.__christmas.ready, null, {timeout:30000});
    const encoder = spawn(ffmpeg, ['-y','-f','image2pipe','-vcodec','png','-framerate',String(fps),'-i','pipe:0',
      '-an','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart','-t',String(duration),output],
      {windowsHide:true,stdio:['pipe','ignore','pipe']});
    const done = once(encoder, 'close');
    let log=''; encoder.stderr.on('data', d => {log=(log+d.toString()).slice(-16000)});
    encoder.stdin.on('error',()=>{});
    for (let frame=0; frame<frames; frame++) {
      const data = await page.evaluate(t => {
        window.__christmas.renderAt(t);
        return document.querySelector('#scene').toDataURL('image/png').split(',')[1];
      },frame/fps);
      if (!encoder.stdin.write(Buffer.from(data,'base64'))) await once(encoder.stdin,'drain');
      if (frame % 60 === 0) process.stdout.write(JSON.stringify({frame,total:frames,seconds:frame/fps})+'\n');
    }
    encoder.stdin.end();
    const [code] = await done;
    if (code !== 0) throw new Error('FFmpeg exited '+code+'\n'+log);
    if (errors.length) throw new Error('Animation page errors: '+errors.join('\n'));
    const report={output,width:1080,height:1920,fps,duration,frames,bytes:fs.statSync(output).size,pageErrors:errors};
    fs.writeFileSync(output+'.render.json',JSON.stringify(report,null,2));
    process.stdout.write(JSON.stringify(report)+'\n');
  } finally { await browser.close(); }
}
main().catch(e=>{console.error(e);process.exitCode=1});
