/* Olto · Studio vidéo de Malo : Reels 1080×1920 animés (canvas), export MP4/WebM */
(function(){
const C={iv:'#EEF3F4',pn:'#0F1E1B',in:'#0A0F14',mu:'#5A6870',pm:'#9DBFB4',ln:'#D3DDE0',pl:'#2A4A42',ja:'#3FD3A4',jd:'#0A7A5A',am:'#F2B05A',ad:'#9A5B0E',sig:'#FF5C4D'};
const W=1080,H=1920,FPS=30;
const ease=t=>t<0?0:t>1?1:1-Math.pow(1-t,3);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const IMG={};function loadImgs(){return Promise.all(['coins','ring','bars','cup','calendar','coin','hourglass','phone','card'].map(n=>IMG[n]?1:new Promise(ok=>{const i=new Image();i.onload=()=>{IMG[n]=i;ok()};i.onerror=ok;i.src='img/obj-'+n+'.png'})))}
function font(kind,s){return kind==='em'?`italic 400 ${s*1.12}px IS`:kind==='m'?`500 ${s}px PJ`:kind==='mono'?`400 ${s}px PM`:`800 ${s}px PJ`}
function nb(s){return String(s||'').replace(/(\d)\s+(?=(millions?|milliards?|M|Md|k|mois|ans?|jours?|semaines?|heures?|h|min|s|°|€|\$|%)(?![\wÀ-ÿ]))/g,'$1\u00a0').replace(/«\s+/g,'«\u00a0').replace(/\s+(»|:|;|\?|!|%|€)/g,'\u00a0$1')}
function toks(text){const out=[];let sp=true;nb(text).split(/(\*[^*]+\*)/).forEach(p=>{if(!p)return;const em=/^\*.*\*$/.test(p);(em?p.slice(1,-1):p).split(/([ \t\n\r]+)/).forEach(w=>{if(w==='')return;if(/^[ \t\n\r]+$/.test(w)){sp=true;return}out.push({t:w,em,sp});sp=false})});return out}
function lay(ctx,text,size,maxW,kind='b'){const T=toks(text),lines=[[]];let w=0;ctx.font=font(kind,size);const spw=ctx.measureText(' ').width;
 for(const t of T){ctx.font=t.em?font('em',size):font(kind,size);t.w=ctx.measureText(t.t).width;const cur=lines[lines.length-1];const add=(cur.length&&t.sp?spw:0)+t.w;
  if(cur.length&&t.sp&&w+add>maxW){lines.push([t]);w=t.w}else{cur.push(t);w+=add}}
 lines.forEach(l=>{let x=0;l.forEach((t,j)=>{if(j&&t.sp)x+=spw;t.x=x;x+=t.w});l.w=x});return lines}
function fitSize(ctx,text,maxW,maxL,start,min,kind='b'){let s=start;while(s>min&&lay(ctx,text,s,maxW,kind).length>maxL)s-=4;return s}
// dessine un texte mot par mot avec apparition échelonnée ; renvoie la hauteur
function words(ctx,text,x,y,size,maxW,col,emCol,t0,lt,kind='b',lh=1.06,stag=.07,align='left'){const L=lay(ctx,text,size,maxW,kind);let k=0;
 L.forEach((l,i)=>{const ox=align==='center'?x-l.w/2:x;l.forEach(t=>{const a=ease((lt-t0-k*stag)/.45);k++;if(a<=0)return;ctx.globalAlpha=a*(ctx._fade??1);ctx.fillStyle=t.em?emCol:col;ctx.font=t.em?font('em',size):font(kind,size);
  ctx.fillText(t.t,ox+t.x,y+i*size*lh+(1-a)*36)})});ctx.globalAlpha=ctx._fade??1;return L.length*size*lh}
function numParts(s){const m=String(s||'').match(/^(.*?)(\d{1,3}(?:[\s ]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?)(.*)$/);if(!m)return null;const raw=m[2].replace(/[\s ]/g,'');const dec=(raw.split(/[.,]/)[1]||'').length;return {pre:m[1],val:parseFloat(raw.replace(',','.')),dec,suf:m[3],sep:/[\s ]/.test(m[2]),comma:m[2].includes(',')}}
function fmtNum(p,v){let s=v.toFixed(p.dec);let [i,d]=s.split('.');if(p.sep||i.length>4)i=i.replace(/\B(?=(\d{3})+(?!\d))/g,' ');return p.pre+i+(d?(p.comma?',':'.')+d:'')+p.suf}
function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function logo(ctx,x,y,s,col){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.strokeStyle=col;ctx.lineWidth=24;ctx.lineCap='round';
 ctx.beginPath();ctx.arc(47,53,38,-Math.PI/2,Math.PI/2,true);ctx.stroke();ctx.beginPath();ctx.arc(53,47,38,-Math.PI/2,Math.PI/2,false);ctx.stroke();
 ctx.beginPath();ctx.moveTo(132,-30);ctx.lineTo(132,88);ctx.stroke();ctx.beginPath();ctx.moveTo(184,-6);ctx.lineTo(184,70);ctx.quadraticCurveTo(184,88,212,88);ctx.stroke();
 ctx.beginPath();ctx.moveTo(162,14);ctx.lineTo(214,14);ctx.stroke();ctx.beginPath();ctx.arc(276,50,38,0,Math.PI*2);ctx.stroke();ctx.fillStyle=C.ja;ctx.beginPath();ctx.arc(348,80.8,19.2,0,Math.PI*2);ctx.fill();ctx.restore()}
function total(p){return (p.reel&&p.reel.scenes||[]).reduce((s,x)=>s+(+x.d||3),0)}
function sceneAt(p,t){const S=p.reel.scenes;let a=0;for(let i=0;i<S.length;i++){const d=+S[i].d||3;if(t<a+d||i===S.length-1)return {i,s:S[i],lt:t-a,d};a+=d}}
function frame(ctx,p,t){const R=p.reel||{scenes:[]};const dark=(R.fond||'sombre')!=='clair';const fg=dark?C.iv:C.in,mut=dark?C.pm:C.mu,acc=dark?C.ja:C.jd;const rub=String(p.rubrique||'Olto');
 ctx._fade=1;ctx.globalAlpha=1;ctx.fillStyle=dark?C.pn:C.iv;ctx.fillRect(0,0,W,H);
 // halo qui respire
 const gx=W*.78+Math.sin(t*.5)*90,gy=H*.24+Math.cos(t*.4)*120;const g=ctx.createRadialGradient(gx,gy,0,gx,gy,620);g.addColorStop(0,dark?'rgba(63,211,164,.16)':'rgba(63,211,164,.14)');g.addColorStop(1,'rgba(63,211,164,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 if(!R.scenes||!R.scenes.length)return;const tot=total(p);const {i,s,lt,d}=sceneAt(p,t);
 // pastille rubrique
 ctx.font=font('mono',27);const lab=rub.toUpperCase();const cw=ctx.measureText(lab).width+lab.length*2.5+96;rr(ctx,80,320,cw,64,32);ctx.fillStyle=dark?'rgba(238,243,244,.08)':'#fff';ctx.fill();ctx.strokeStyle=dark?C.pl:C.ln;ctx.lineWidth=2;ctx.stroke();
 ctx.fillStyle=rub.toLowerCase().includes('habitude')?C.am:C.ja;ctx.beginPath();ctx.arc(116,352,9,0,7);ctx.fill();ctx.fillStyle=fg;ctx.letterSpacing='2px';ctx.fillText(lab,138,362);ctx.letterSpacing='0px';
 // fondu de sortie
 const out=i<R.scenes.length-1?clamp((d-lt)/.25,0,1):1;ctx._fade=out;ctx.globalAlpha=out;
 const X0=80,MW=760,top=450;
 if(s.objet&&IMG[s.objet]&&s.type!=='cta'){const im=IMG[s.objet];const a=ease((lt-.3)/.6);const ow=400,oh=ow*im.height/im.width;ctx.globalAlpha=a*out;ctx.drawImage(im,880-ow,1010+Math.sin(t*1.6)*16+(1-a)*80,ow,oh);ctx.globalAlpha=out}
 if(s.type==='hook'){const sz=fitSize(ctx,s.titre,MW,5,136,80);words(ctx,s.titre,X0,top+sz,sz,MW,fg,acc,0,lt,'b',1.04,.09)}
 else if(s.type==='chiffre'){const np=numParts(s.chiffre);const k=ease(lt/1.1);const txt=np?fmtNum(np,np.val*k):s.chiffre;ctx.font=font('b',10);let cs=300;ctx.font=font('b',cs);while(cs>140&&ctx.measureText(s.chiffre).width>MW){cs-=10;ctx.font=font('b',cs)}
  const a=ease(lt/.4);ctx.globalAlpha=a*out;ctx.fillStyle=acc;ctx.letterSpacing=(-cs*.04)+'px';ctx.fillText(txt,X0,top+cs*.9+(1-a)*40);ctx.letterSpacing='0px';ctx.globalAlpha=out;
  if(s.label)words(ctx,s.label,X0,top+cs*.9+130,fitSize(ctx,s.label,MW,4,72,48),MW,fg,acc,.5,lt,'b',1.1,.05)}
 else if(s.type==='texte'){let y=top+90;if(s.titre){const sz=fitSize(ctx,s.titre,MW,3,100,64);y+=words(ctx,s.titre,X0,y,sz,MW,fg,acc,0,lt,'b',1.05,.07)+30}if(s.texte)words(ctx,s.texte,X0,y+20,52,MW,mut,acc,.5,lt,'m',1.35,.025)}
 else if(s.type==='liste'){let y=top+90;if(s.titre){y+=words(ctx,s.titre,X0,y,fitSize(ctx,s.titre,MW,2,92,60),MW,fg,acc,0,lt,'b',1.05,.07)+50}
  (s.items||[]).slice(0,4).forEach((it,k)=>{const t0=.5+k*.55;const a=ease((lt-t0)/.4);if(a<=0)return;ctx.globalAlpha=a*out;rr(ctx,X0,y-58+(1-a)*30,MW,120,30);ctx.fillStyle=dark?'rgba(238,243,244,.07)':'#fff';ctx.fill();ctx.fillStyle=acc;ctx.beginPath();ctx.arc(X0+56,y+2+(1-a)*30,14,0,7);ctx.fill();ctx.globalAlpha=out;
   words(ctx,it,X0+100,y+18+(1-a)*30,fitSize(ctx,it,MW-140,1,52,34),MW-140,fg,acc,t0,lt,'b',1,0);y+=150})}
 else if(s.type==='cta'){const a=ease(lt/.6);ctx.globalAlpha=a*out;logo(ctx,480-172,560+(1-a)*40,.9,fg);ctx.globalAlpha=out;
  ctx.textAlign='left';const tt=s.titre||'Suis *@olto.media* pour la suite.';const sz=fitSize(ctx,tt,MW,3,96,60);const L=lay(ctx,tt,sz,MW);words(ctx,tt,480,860,sz,MW,fg,acc,.4,lt,'b',1.08,.07,'center');
  if(s.texte)words(ctx,s.texte,480,860+L.length*sz*1.08+60,48,MW-80,mut,acc,.9,lt,'m',1.35,.02,'center')}
 // sous-titres dynamiques : 3-4 mots à la fois, mot prononcé en jade
 if(s.sous){const T=toks(String(s.sous).replace(/\*/g,''));const n=T.length;if(n){
  const chunks=[];let cur=[],cl=0;T.forEach((tk,k)=>{cur.push(k);cl+=tk.t.length;const end=/[.,;:!?…]$/.test(tk.t);const weak=/^(à|a|de|d'|du|des|le|la|les|l'|un|une|et|en|ton|ta|tes|son|sa|ses|ce|cet|cette|pour|par|sur|dans|au|aux|qui|que|ne|pas|plus)$/i.test(tk.t)&&k<n-1;if(!weak&&(cur.length>=4||cl>18||end)||k===n-1||cur.length>=6){chunks.push(cur);cur=[];cl=0}});
  const hasV=p._voice&&s.vs!=null&&s.ve>s.vs;const speak=hasV?Math.max(.4,s.ve-s.vs):Math.max(.6,d-(i<R.scenes.length-1?.45:1.2)),st0=hasV?s.vs:.08;const wl=T.map(t=>t.t.length+2),tw=wl.reduce((a,b)=>a+b,0);const tStart=[];let acc=0;const sg=hasV&&s._sg;const sgT=sg?sg.reduce((a,z)=>a+z[1]-z[0],0):0;
  const at=u=>{if(!sg)return st0+speak*u;let r=u*sgT;for(const z of sg){const L=z[1]-z[0];if(r<=L)return z[0]+r;r-=L}return sg[sg.length-1][1]};
  wl.forEach(w=>{tStart.push(at(acc/tw)+(hasV?.06:0));acc+=w});
  let wi=0;for(let k=0;k<n;k++)if(lt>=tStart[k])wi=k;const ch=chunks.find(c=>c.includes(wi))||chunks[0];
  const SW=740;const lw_=(ln,z)=>{ctx.font=font('b',z);return ln.reduce((a,k)=>a+ctx.measureText(T[k].t).width,0)+ctx.measureText(' ').width*(ln.length-1)};
  let lines=[ch];if(lw_(ch,64)>SW&&ch.length>1){let best=null;for(let c=1;c<ch.length;c++){const a=ch.slice(0,c),b=ch.slice(c);const m=Math.max(lw_(a,64),lw_(b,64));if(!best||m<best[0])best=[m,[a,b]]}lines=best[1]}
  let sz=64;while(sz>40&&Math.max(...lines.map(l=>lw_(l,sz)))>SW)sz-=2;ctx.font=font('b',sz);const spw=ctx.measureText(' ').width;
  const ca=ease((lt-tStart[ch[0]]+.05)/.18);const cy=1370;
  lines.forEach((ln,li)=>{const lw=ln.reduce((a,k)=>a+ctx.measureText(T[k].t).width,0)+spw*(ln.length-1);let x=470-lw/2;const y=cy+li*sz*1.12-(lines.length-1)*sz*.56;
   ln.forEach(k=>{const w0=ctx.measureText(T[k].t).width;const active=k===wi&&lt>=tStart[k],said=k<wi;const pop=active?1+.08*(1-ease((lt-tStart[k])/.16)):1;
    ctx.save();ctx.translate(x+w0/2,y);ctx.scale(pop,pop);ctx.globalAlpha=out*ca*(active||said?1:.55);ctx.font=font('b',sz);ctx.textAlign='center';
    ctx.shadowColor='rgba(0,0,0,.45)';ctx.shadowBlur=24;ctx.shadowOffsetY=4;ctx.lineJoin='round';ctx.lineWidth=10;ctx.strokeStyle='rgba(10,15,20,.55)';ctx.strokeText(T[k].t,0,(1-ca)*14);ctx.shadowColor='transparent';
    ctx.fillStyle=active?C.ja:C.iv;ctx.fillText(T[k].t,0,(1-ca)*14);ctx.restore();x+=w0+spw})});ctx.textAlign='left';ctx.globalAlpha=out}}
 // logo discret
 ctx.globalAlpha=1}
// ---------- lecteur ----------
let ACX=null;function actx(){if(!ACX){const A=window.AudioContext||window.webkitAudioContext;ACX=A?new A():null}if(ACX&&ACX.state==='suspended')ACX.resume();return ACX}
function player(canvas,p,onTime){const ctx=canvas.getContext('2d');const sc=canvas.width/W;let raf=0,t0=0,pos=0,playing=false,src=null;
 const draw=t=>{ctx.save();ctx.scale(sc,sc);frame(ctx,p,t);ctx.restore()};
 const stopA=()=>{if(src){try{src.stop()}catch(e){}src=null}};
 let lat=0;const tick=now=>{pos=Math.max(0,(now-t0)/1000);const T=total(p);if(pos>=T){pos=T;playing=false;stopA();draw(T-.01);onTime&&onTime(pos,false);return}draw(pos);onTime&&onTime(pos,true);raf=requestAnimationFrame(tick)};
 return {play(){if(playing)return;if(pos>=total(p)-.05)pos=0;playing=true;const a=p._voice&&actx();if(a){src=a.createBufferSource();src.buffer=p._voice;src.connect(a.destination);src.start(0,Math.min(pos,p._voice.duration-.01));lat=Math.min(.5,(a.outputLatency||0)+(a.baseLatency||0))}else lat=0;t0=performance.now()-pos*1000+lat*1000;raf=requestAnimationFrame(tick)},
  pause(){playing=false;stopA();cancelAnimationFrame(raf);onTime&&onTime(pos,false)},seek(t){pos=t;draw(t)},redraw(){draw(pos)},get playing(){return playing}}}
// ---------- voix : décodage et calage des scènes ----------
async function decodeVoice(file){const a=actx();if(!a)throw {code:'no_audio'};const buf=await file.arrayBuffer();return await new Promise((ok,ko)=>{const r=a.decodeAudioData(buf,ok,ko);if(r&&r.then)r.then(ok,ko)})}
function speechSpans(p,ab){const S=p.reel.scenes;const ch=ab.getChannelData(0),sr=ab.sampleRate,fl=Math.round(sr*.02),F=Math.floor(ch.length/fl);const rms=new Float32Array(F);
 for(let f=0;f<F;f++){let s=0;for(let i=f*fl;i<(f+1)*fl;i++)s+=ch[i]*ch[i];rms[f]=Math.sqrt(s/fl)}
 const srt=Array.from(rms).sort((a,b)=>a-b);const thr=Math.max(.008,srt[Math.floor(F*.9)]*.12);let t=0;
 S.forEach(x=>{const d=+x.d||3;const f0=Math.floor(t/.02),f1=Math.min(F,Math.floor((t+d)/.02));let a=f0;while(a<f1&&rms[a]<thr)a++;let b=f1-1;while(b>a&&rms[b]<thr)b--;
  if(a<f1&&b>a){x.vs=Math.round((a*.02-t)*100)/100;x.ve=Math.round(((b+1)*.02-t)*100)/100;
   const sg=[];let st=a,q=-1;for(let f=a;f<=b+1;f++){const on=f<=b&&rms[f]>=thr;if(!on){if(q<0)q=f}else if(q>=0){if(f-q>=6){sg.push([st*.02-t,q*.02-t]);st=f}q=-1}}sg.push([st*.02-t,(b+1)*.02-t]);x._sg=sg}
  else{delete x.vs;delete x.ve;delete x._sg}t+=d})}
function alignVoice(p,ab){const S=p.reel.scenes,n=S.length;const ch=ab.getChannelData(0),sr=ab.sampleRate,fl=Math.round(sr*.02),F=Math.floor(ch.length/fl);const rms=new Float32Array(F);
 for(let f=0;f<F;f++){let s=0;for(let i=f*fl;i<(f+1)*fl;i++)s+=ch[i]*ch[i];rms[f]=Math.sqrt(s/fl)}
 const srt=Array.from(rms).sort((a,b)=>a-b);const thr=Math.max(.008,srt[Math.floor(F*.9)]*.12);
 let a0=0;while(a0<F&&rms[a0]<thr)a0++;let a1=F-1;while(a1>0&&rms[a1]<thr)a1--;const A0=a0*.02,A1=(a1+1)*.02;
 const sil=[];let st=-1;for(let f=a0;f<=a1;f++){if(rms[f]<thr){if(st<0)st=f}else if(st>=0){if(f-st>=8)sil.push({m:(st+f)/2*.02,len:(f-st)*.02});st=-1}}
 const w=S.map(x=>Math.max(8,String(x.sous||x.titre||x.label||'').length));const tw=w.reduce((a,b)=>a+b,0);let cum=0;const bounds=[0];let prev=A0;
 for(let k=1;k<n;k++){cum+=w[k-1];const exp=A0+(A1-A0)*cum/tw;let best=null,bd=1e9;for(const z of sil){if(z.m<=prev+.6)continue;const d=Math.abs(z.m-exp)-z.len*.8;if(Math.abs(z.m-exp)<1.8&&d<bd){bd=d;best=z}}const b=best?best.m:exp;bounds.push(b);prev=b}
 const end=A1+(S[n-1].type==='cta'?1.6:.8);bounds.push(Math.max(end,bounds[n-1]+2.2));
 S.forEach((x,k)=>{x.d=Math.round((bounds[k+1]-bounds[k])*100)/100});speechSpans(p,ab);return {dur:ab.duration,speech:A1-A0,cuts:sil.length}}
// ---------- export vidéo ----------
function pickMime(audio){const c=audio?['video/mp4;codecs=avc1.640028,mp4a.40.2','video/mp4;codecs=avc1,mp4a.40.2','video/mp4;codecs=avc1.42E01F,mp4a.40.2','video/mp4;codecs=avc3,mp4a.40.2','video/mp4;codecs=avc1,opus','video/mp4','video/webm;codecs=vp9,opus','video/webm']:['video/mp4;codecs=avc1.640028','video/mp4;codecs=avc1.42E01F','video/mp4','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'];for(const m of c){try{if(window.MediaRecorder&&MediaRecorder.isTypeSupported(m))return m}catch(e){}}return null}
async function record(p,onProg){const voice=p._voice&&actx();const mime=pickMime(!!voice);if(!mime||!HTMLCanvasElement.prototype.captureStream)throw {code:'no_recorder'};await loadImgs();
 const cv=document.createElement('canvas');cv.width=W;cv.height=H;cv.style.cssText='position:fixed;left:-99999px;top:0;width:10px;height:18px';document.body.appendChild(cv);const ctx=cv.getContext('2d');
 frame(ctx,p,0);const vs=cv.captureStream(FPS);let stream=vs,asrc=null;if(voice){const dest=voice.createMediaStreamDestination();asrc=voice.createBufferSource();asrc.buffer=p._voice;asrc.connect(dest);stream=new MediaStream([...vs.getVideoTracks(),...dest.stream.getAudioTracks()])}const rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:9e6});const chunks=[];rec.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
 const done=new Promise(ok=>rec.onstop=ok);const T=total(p)+.4;rec.start(250);if(asrc)asrc.start();const st=performance.now();
 await new Promise(ok=>{const loop=()=>{const t=(performance.now()-st)/1000;frame(ctx,p,Math.min(t,T-.41));onProg&&onProg(Math.min(1,t/T));if(t<T)requestAnimationFrame(loop);else ok()};requestAnimationFrame(loop)});
 rec.stop();await done;stream.getTracks().forEach(x=>x.stop());cv.remove();return {blob:new Blob(chunks,{type:mime.split(';')[0]}),ext:mime.includes('mp4')?'mp4':'webm',mime:rec.mimeType||mime}}
window.OltoReel={frame,player,record,loadImgs,total,decodeVoice,alignVoice,speechSpans,W,H};
})();
