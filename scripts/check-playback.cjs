/* Plays the exported MP4 for its full duration in Chromium, with decoded-frame evidence. */
const { chromium } = require('playwright-core');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

async function main() {
  const videoPath=path.resolve(process.argv[2] || 'dist/christmas-ascii-20s.mp4');
  const outputDir=path.resolve(process.argv[3] || 'qa/playback');
  fs.mkdirSync(outputDir,{recursive:true});
  const size=fs.statSync(videoPath).size;
  const server=http.createServer((req,res)=>{
    if(req.url==='/video.mp4'){
      const range=req.headers.range;
      if(range){
        const match=/bytes=(\d+)-(\d*)/.exec(range);
        if(!match){res.writeHead(416);res.end();return;}
        const start=Number(match[1]),end=match[2]?Math.min(Number(match[2]),size-1):size-1;
        res.writeHead(206,{'Content-Type':'video/mp4','Content-Length':end-start+1,'Content-Range':`bytes ${start}-${end}/${size}`,'Accept-Ranges':'bytes'});
        fs.createReadStream(videoPath,{start,end}).pipe(res);
      } else {
        res.writeHead(200,{'Content-Type':'video/mp4','Content-Length':size,'Accept-Ranges':'bytes'});
        fs.createReadStream(videoPath).pipe(res);
      }
      return;
    }
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
    res.end(`<!doctype html><html><meta charset="utf-8"><title>MP4 playback verification</title><style>*{margin:0}html,body{background:#030810;width:100%;height:100%;overflow:hidden}video{width:100%;height:100%;object-fit:contain}</style><video id="video" src="/video.mp4" muted playsinline></video><script>
      const v=document.querySelector('video');
      window.playback={samples:[],events:[],decodedFrames:0,startedAt:null,endedAt:null,error:null};
      for(const name of ['loadedmetadata','playing','waiting','stalled','ended']) v.addEventListener(name,()=>{playback.events.push({name,time:v.currentTime,wall:performance.now()});if(name==='ended')playback.endedAt=performance.now()});
      v.addEventListener('error',()=>playback.error=v.error&&v.error.message);
      function frame(now,meta){playback.decodedFrames++;playback.lastMediaTime=meta.mediaTime;if(!v.ended)v.requestVideoFrameCallback(frame)}
      v.requestVideoFrameCallback(frame);
      setInterval(()=>playback.samples.push({time:v.currentTime,readyState:v.readyState,paused:v.paused,ended:v.ended,decodedFrames:playback.decodedFrames}),1000);
      window.startPlayback=async()=>{playback.startedAt=performance.now();await v.play()};
    </script></html>`);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const chrome=process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser=await chromium.launch({executablePath:chrome,headless:true,args:['--autoplay-policy=no-user-gesture-required']});
  const page=await browser.newPage({viewport:{width:540,height:960},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  try {
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.waitForFunction(()=>document.querySelector('video').readyState>=2);
    await page.evaluate(()=>window.startPlayback());
    for(const at of [0.5,5,10,15,19.3]){
      await page.waitForFunction(t=>document.querySelector('video').currentTime>=t,at,{timeout:30000});
      await page.screenshot({path:path.join(outputDir,`playback-${String(at).replace('.','-')}.png`)});
    }
    await page.waitForFunction(()=>document.querySelector('video').ended,null,{timeout:30000});
    const report=await page.evaluate(()=>{
      const v=document.querySelector('video');
      return {...window.playback,width:v.videoWidth,height:v.videoHeight,duration:v.duration,currentTime:v.currentTime,ended:v.ended,quality:v.getVideoPlaybackQuality(),actualWallTimeMs:playback.endedAt-playback.startedAt};
    });
    report.videoPath=videoPath;report.pageErrors=errors;
    report.passed=report.ended&&Math.abs(report.duration-20)<0.05&&report.width===1080&&report.height===1920&&report.decodedFrames>500&&!report.error&&!errors.length&&report.actualWallTimeMs>19000;
    fs.writeFileSync(path.join(outputDir,'playback-report.json'),JSON.stringify(report,null,2));
    console.log(JSON.stringify(report,null,2));
    if(!report.passed)process.exitCode=1;
  } finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(e=>{console.error(e);process.exitCode=1});
