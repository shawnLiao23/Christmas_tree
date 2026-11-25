/* ASCII Christmas. All objects are projected 3D glyph clouds; no mesh images. */
(() => {
  'use strict';
  const canvas = document.querySelector('#scene');
  const ctx = canvas.getContext('2d', { alpha: false });
  const W = 1080, H = 1920, TAU = Math.PI * 2, D = 1650;
  canvas.width = W; canvas.height = H;
  const defaults = { speed: 1, snow: 1, glow: 1, greeting: 'MERRY CHRISTMAS', subtitle: '愿所有美好，如雪而至' };
  let options = { ...defaults }, time = 0, playing = true, last = performance.now(), view = 0;
  let seed = 20261225;
  const rand = () => ((seed = Math.imul(seed, 1664525) + 1013904223 >>> 0) / 4294967296);
  const pick = s => s[Math.floor(rand() * s.length)];
  const points = [], snow = [], sprites = new Map();
  const greens = ['#25b58a', '#38d3a2', '#75e2b6', '#12a989', '#59b5b9', '#9bdfb7', '#7fc575', '#45a19c'];
  const golds = ['#b47729', '#dfa744', '#f9cc67', '#ffe394', '#fff0bc', '#fff8df'];
  function add(x, y, z, ch, color, type = 'leaf', extra = {}) {
    points.push({ x, y, z, ch, color, type, phase: rand() * TAU, ...extra });
  }
  // Six overlapping whorls, with lobed branches instead of a smooth cone.
  function radius(y, a = 0) {
    const h = (y - 125) / 725;
    const tier = ((850 - y) / 111) % 1;
    const silhouette = 341 * (1 - h) * (0.78 + 0.22 * Math.pow(tier, 0.55));
    return silhouette * (1 + 0.055 * Math.sin(a * 7 + y * .014));
  }
  for (let y = 128; y <= 846; y += 8.3) {
    const r0 = radius(y), n = Math.max(5, Math.round(TAU * r0 / 10.8));
    for (let j = 0; j < n; j++) {
      const a = TAU * (j / n) + y * .017;
      const r = radius(y, a) * (.955 + rand() * .055);
      const ornament = rand() < .018;
      const color = ornament ? pick(['#ff6c86','#eb9dde','#9da0ff','#ffaf70','#c8f5ef']) : pick(greens);
      add(Math.cos(a) * r, y + (rand() - .5) * 5, Math.sin(a) * r, ornament ? pick('@oO&') : pick('01x+*#%<>:;'), color, 'leaf', { normal: a, ornament });
    }
  }
  // A continuous double-thread helix. Near and far segments share real depth.
  for (let i = 0; i < 860; i++) {
    const h = i / 859, y = 139 + h * 695, a = h * TAU * 4.65 + .8;
    const r = radius(y, a) + 11;
    add(Math.cos(a) * r, y, Math.sin(a) * r, pick('*+o@'), golds[2 + (i % 4)], 'ribbon', { normal: a });
    if (i % 3 === 0) add(Math.cos(a + .028) * (r + 2), y + 7, Math.sin(a + .028) * (r + 2), '.', '#ffcd6e', 'ribbon', { normal: a + .028 });
  }
  // Exposed cylindrical bark and distinct branching roots.
  for (let y = -62; y < 145; y += 9) for (let j = 0; j < 20; j++) {
    const a = TAU * j / 20, r = 28 + 5 * Math.sin(y * .04 + a * 3);
    add(Math.cos(a) * r, y, Math.sin(a) * r, pick('|/\\#:=Y'), pick(['#a7774b','#ca9660','#e6b67b','#8f6247']), 'wood', { normal:a });
  }
  for (let k = 0; k < 9; k++) {
    const a = k * TAU / 9;
    for (let i = 0; i < 32; i++) {
      const t = i / 31, r = 24 + t * (125 + k % 3 * 20), aa = a + .22 * Math.sin(t * Math.PI);
      for (let j = 0; j < 2; j++) add(Math.cos(aa) * r + j * 5, -49 - t * 73, Math.sin(aa) * r, pick('=/\\Y#'), pick(['#b68856','#e1b77c','#cfa36c']), 'wood', { normal:aa });
    }
  }
  const star = [];
  for (let i = 0; i < 10; i++) { const a = -Math.PI/2 + i*Math.PI/5, r = i%2 ? 35 : 82; star.push([Math.cos(a)*r,Math.sin(a)*r]); }
  function inside(x,y) { let hit=false; for(let i=0,j=9;i<10;j=i++) if(((star[i][1]>y)!==(star[j][1]>y))&&(x<(star[j][0]-star[i][0])*(y-star[i][1])/(star[j][1]-star[i][1])+star[i][0]))hit=!hit;return hit; }
  for(let y=-82;y<=78;y+=8) for(let x=-80;x<=80;x+=8) if(inside(x,y)) {
    add(x, 963-y, 20, pick('*+@#'), pick(golds.slice(2)), 'star', { sx:x, sy:-y, sz:20 });
    add(x, 963-y, -20, pick('+:#'), golds[1], 'star', { sx:x, sy:-y, sz:-20 });
  }
  for(let i=0;i<10;i++) {
    const a=star[i],b=star[(i+1)%10],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/6);
    for(let j=0;j<=n;j++) for(let z=-20;z<=20;z+=8) {
      const q=j/n,x=a[0]*(1-q)+b[0]*q,y=-(a[1]*(1-q)+b[1]*q);
      add(x,963+y,z,'+',z===20?'#fff4c5':'#c68a36','star',{sx:x,sy:y,sz:z});
    }
  }
  // Gifts are six-face cuboids with glyph ribbons, raised lids, and ASCII bows.
  const gifts = [
    {x:-292,y:-94,z:80,w:112,h:108,d:96,c:['#b93b66','#eb638e','#ff91ac'],a:-.35},
    {x:-164,y:-118,z:255,w:91,h:77,d:86,c:['#337eaf','#53aacc','#9adce7'],a:.35},
    {x:160,y:-105,z:225,w:111,h:100,d:101,c:['#824aa7','#b274ce','#dca8e7'],a:-.3},
    {x:301,y:-101,z:50,w:100,h:90,d:90,c:['#b23d43','#e96665','#ffada0'],a:.2}
  ];
  gifts.forEach((g,id)=>{
    const put=(x,y,z,face)=>{
      const ribbon = Math.abs(x)<9 || (face==='top'&&Math.abs(z)<9);
      add(0,0,0,ribbon?pick('+#='):pick('#%x+@'),ribbon?pick(golds.slice(2)):g.c[face==='top'?2:face==='side'?0:1],'gift',{gx:x,gy:y,gz:z,gid:id,ribbon});
    };
    for(let y=0;y<=g.h;y+=8) for(let x=-g.w/2;x<=g.w/2;x+=7.5){put(x,y,g.d/2,'front');put(x,y,-g.d/2,'side');}
    for(let y=0;y<=g.h;y+=8) for(let z=-g.d/2;z<=g.d/2;z+=8){put(-g.w/2,y,z,'side');put(g.w/2,y,z,'front');}
    for(let x=-g.w/2;x<=g.w/2;x+=7.5) for(let z=-g.d/2;z<=g.d/2;z+=8)put(x,g.h+4,z,'top');
    for(let side of [-1,1])for(let j=0;j<36;j++){
      const a=j/36*TAU;
      add(0,0,0,pick('+*@'),pick(golds.slice(2)),'gift',{gx:side*(17+17*Math.cos(a)),gy:g.h+12+15*Math.sin(a),gz:5*Math.sin(a),gid:id,ribbon:true});
    }
  });
  for(let i=0;i<610;i++) {
    const a=rand()*TAU,r=95+rand()*440;
    add(Math.cos(a)*r,-139-rand()*4,Math.sin(a)*r*.8,pick('.:+' ),pick(['#244657','#335465','#557177','#9a916b']),'floor');
  }
  for(let i=0;i<240;i++)snow.push({x:rand()*W,y:rand()*H,p:rand()*TAU,size:9+rand()*12,alpha:.14+rand()*.55,loops:1+i%2});
  function sprite(ch,color,glow) {
    const key=ch+color+glow;
    if(sprites.has(key))return sprites.get(key);
    const c=document.createElement('canvas');c.width=c.height=52;
    const a=c.getContext('2d');a.font='bold 14px Consolas, "Courier New", monospace';a.textAlign='center';a.textBaseline='middle';a.fillStyle=color;
    if(glow){a.shadowColor=color;a.shadowBlur=glow===2?12:5;a.fillText(ch,26,26);a.shadowBlur=0;}
    a.fillText(ch,26,26);sprites.set(key,c);return c;
  }
  function glyph(ch,x,y,size,color,alpha=1,glow=0) {
    ctx.globalAlpha=Math.max(0,Math.min(1,alpha));const s=size/14*52;
    ctx.drawImage(sprite(ch,color,glow),x-s/2,y-s/2,s,s);
  }
  const bg=document.createElement('canvas');bg.width=W;bg.height=H;
  const b=bg.getContext('2d');b.fillStyle='#030914';b.fillRect(0,0,W,H);
  let grad=b.createRadialGradient(535,930,50,535,930,790);grad.addColorStop(0,'#0c242c');grad.addColorStop(.55,'#07131f');grad.addColorStop(1,'#030711');b.fillStyle=grad;b.fillRect(0,0,W,H);
  grad=b.createRadialGradient(540,1410,0,540,1410,470);grad.addColorStop(0,'#142329');grad.addColorStop(1,'#07111c00');b.fillStyle=grad;b.fillRect(0,1100,W,650);
  function text(str,y,size,color,font='Consolas, monospace',spacing=0) {
    ctx.globalAlpha=1;ctx.fillStyle=color;ctx.font=`${size}px ${font}`;ctx.textAlign='center';ctx.textBaseline='middle';
    if(!spacing){ctx.fillText(str,W/2,y);return;}
    const chars=Array.from(str),width=chars.reduce((n,ch)=>n+ctx.measureText(ch).width,0)+spacing*(chars.length-1);let x=(W-width)/2;
    ctx.textAlign='left';for(const ch of chars){ctx.fillText(ch,x,y);x+=ctx.measureText(ch).width+spacing;}
  }
  function draw(t) {
    const loop=t/20*TAU,rot=loop*options.speed+view,cs=Math.cos(rot),sn=Math.sin(rot),out=[];
    ctx.globalAlpha=1;ctx.drawImage(bg,0,0);
    text('*  A LITTLE LIGHT, A LITTLE MAGIC  *',115,17,'#a9a993','Consolas, monospace',3);
    text('C H R I S T M A S   /   2 0 2 6',157,13,'#617783');
    for(const s of snow){
      const yy=((s.y+t/20*H*s.loops)%H+H)%H,xx=s.x+Math.sin(loop+s.p)*17;
      glyph(s.size>19?'*':s.size>14?'+':'.',xx,yy,s.size,'#b8d6dd',s.alpha*options.snow*.65);
    }
    for(const p of points){
      let x=p.x,y=p.y,z=p.z,n=1,alpha=1,sz=13,glow=0;
      if(p.type==='star'){
        const a=.38+Math.sin(loop)*.65,ca=Math.cos(a),sa=Math.sin(a);x=p.sx*ca+p.sz*sa;y=963+p.sy;z=-p.sx*sa+p.sz*ca;
        alpha=.7+.3*Math.sin(loop*5+p.phase)**2;glow=options.glow>.25?2:0;sz=14;
      }else if(p.type==='gift'){
        const g=gifts[p.gid],a=g.a+Math.sin(loop)*.35,ca=Math.cos(a),sa=Math.sin(a);
        x=g.x+p.gx*ca+p.gz*sa;y=g.y+p.gy;z=g.z-p.gx*sa+p.gz*ca;sz=13.5;
        alpha=.72+.28*Math.sin(loop*3+p.phase)**2;glow=p.ribbon&&options.glow>.25?1:0;
      }else if(p.type!=='floor'){
        const xx=x*cs+z*sn;z=-x*sn+z*cs;x=xx;
        n=Math.sin(p.normal-rot);
        if(p.type==='leaf'){
          alpha=n<-.08?.075:.38+.62*Math.max(0,n);
          alpha*=.84+.16*Math.sin(loop*2+p.phase);if(p.ornament){glow=options.glow>.5?1:0;sz=16;}
        }else if(p.type==='ribbon'){
          alpha=n<-.1?.075:.7+.3*Math.max(0,n);glow=options.glow>.25?2:0;sz=13.8;
          alpha*=.82+.18*Math.sin(loop*4+p.phase)**2;
        }else{alpha=n<0?.28:.9;sz=14;}
      }else{alpha=.5;sz=10;}
      const perspective=D/(D-z),px=540+x*perspective,py=1307-(y+z*.105)*perspective;
      if(px<-30||px>W+30||py<180||py>1580)continue;
      out.push({p,px,py,z,sz:sz*perspective,alpha,glow});
    }
    out.sort((a,b)=>a.z-b.z);
    for(const a of out)glyph(a.p.ch,a.px,a.py,a.sz,a.p.color,a.alpha,a.glow);
    // Glint crosses are ASCII glyphs, too.
    const glints=[[-56,960,21],[62,940,29],[-224,410,51],[146,560,12],[284,250,26],[-292,-5,18],[170,5,32]];
    glints.forEach(([x,y,phase],i)=>{
      const a=Math.max(0,Math.sin(loop*3+phase))**12*options.glow;
      const f=D/(D-(i<2?25:220));glyph('+',540+x*f,1307-(y+23)*f,24+i%2*8,'#fff3c2',a,2);
    });
    const greeting=options.greeting.trim()||defaults.greeting;
    if(greeting.toUpperCase()==='MERRY CHRISTMAS'){
      text('MERRY',1636,55,'#e7d4a7','Georgia, "Times New Roman", serif',16);
      text('CHRISTMAS',1712,81,'#f5e7c8','Georgia, "Times New Roman", serif',7);
    }else{
      text(greeting.slice(0,40),1683,Math.min(72,1170/(Array.from(greeting).length*.7)),'#f5e7c8','Georgia, "Microsoft YaHei", serif',2);
    }
    text(options.subtitle.slice(0,45),1804,24,'#91a9ad','"Microsoft YaHei", sans-serif',5);
    text('+  MAY YOUR DAYS BE MERRY & BRIGHT  +',1866,13,'#637e88','Consolas, monospace',2);
    ctx.globalAlpha=1;
  }
  const api={ready:true,renderAt(t){playing=false;time=Math.max(0,Math.min(20,Number(t)||0));draw(time);},setOptions(o){
    options={...options,...o};for(const k of ['speed','snow','glow'])options[k]=Math.max(0,Math.min(2,Number(options[k])||0));
    options.greeting=String(options.greeting);options.subtitle=String(options.subtitle);draw(time);
  },getOptions(){return {...options};},setTime(t){time=Math.max(0,Math.min(20,Number(t)||0));draw(time);},play(){if(time>=20)time=0;playing=true;last=performance.now();},pause(){playing=false;},isPlaying(){return playing;},getTime(){return time;},resetView(){view=0;draw(time);},onFrame:null};
  window.__christmas=api;
  let drag=null;
  canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,view};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(drag){view=drag.view+(e.clientX-drag.x)*.008;draw(time);}});
  canvas.addEventListener('pointerup',()=>{drag=null;});canvas.addEventListener('pointercancel',()=>{drag=null;});
  function frame(now){const dt=Math.min((now-last)/1000,.1);last=now;if(playing){time=(time+dt)%20;draw(time);}if(api.onFrame)api.onFrame(time,playing);requestAnimationFrame(frame);}
  draw(0);requestAnimationFrame(frame);
})();
