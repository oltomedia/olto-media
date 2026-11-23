/* Olto · Studio vidéo de Malo : Reels 1080×1920 animés (canvas), export MP4/WebM */
(function(){
const C={iv:'#EEF3F4',pn:'#0F1E1B',in:'#0A0F14',mu:'#5A6870',pm:'#9DBFB4',ln:'#D3DDE0',pl:'#2A4A42',ja:'#3FD3A4',jd:'#0A7A5A',am:'#F2B05A',ad:'#9A5B0E',sig:'#FF5C4D'};
const W=1080,H=1920,FPS=30;
const ease=t=>t<0?0:t>1?1:1-Math.pow(1-t,3);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const IMG={};function loadImgs(){return Promise.all(['coins','ring','bars','cup','calendar','coin','hourglass','phone','card'].map(n=>IMG[n]?1:new Promise(ok=>{const i=new Image();i.onload=()=>{IMG[n]=i;ok()};i.onerror=ok;i.src='img/obj-'+n+'.png'})))}
function font(kind,s){return kind==='q'?`italic 400 ${s}px IS`:kind==='em'?`italic 400 ${s*1.12}px IS`:kind==='m'?`500 ${s}px PJ`:kind==='mono'?`400 ${s}px PM`:`800 ${s}px PJ`}
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
function sceneAt(p,t){const S=p.reel.scenes;let a=0;for(let i=0;i<S.length;i++){const d=+S[i].d||3;if(t<a+d||i===S.length-1)return {i,s:S[i],lt:t-a,d,start:a};a+=d}}
// ================= MOTEUR v2 : monteur / motion designer =================
// Easing
const easeOutBack=t=>{t=clamp(t,0,1);const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2)};
const easeOutExpo=t=>t<=0?0:t>=1?1:1-Math.pow(2,-10*t);
const easeInOut=t=>{t=clamp(t,0,1);return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
// Banque de transitions (entre deux scènes)
const TRANS=['push','zoom','wipe','slide','flash'];const TD=.45;
// Banque de musiques et bruitages (fichiers dans render/audio)
const MUSIC=['pulse','calme','tension'];
function music(p){const m=(p.reel&&p.reel.musique)||'';if(m==='aucune')return null;if(MUSIC.includes(m))return m;const types=(p.reel&&p.reel.scenes||[]).map(s=>s.type);const r=String(p.rubrique||'').toLowerCase();
 if(types.includes('vraifaux')||r.includes('actu'))return 'tension';if(r.includes('habitude')||r.includes('défi'))return 'calme';return 'pulse'}
// grain (bruit) pré-calculé
let GRAIN=null;function grain(){if(GRAIN)return GRAIN;const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');const d=g.createImageData(256,256);for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}g.putImageData(d,0,0);return GRAIN=c}
// particules (positions fixes, mouvement dérivé du temps)
const PART=Array.from({length:22},(_,k)=>({x:(k*397)%1080,y:(k*733)%1920,r:2+(k%4),v:14+(k%5)*7,ph:k*1.7}));
// Ambiances : sombre (sapin), jade (plein écran, pour les chiffres choc), clair (ivoire)
function pal(mode){if(mode==='jade')return {mode,dark:false,bg:C.ja,fg:C.in,mut:'rgba(10,15,20,.72)',acc:C.in,card:'rgba(10,15,20,.08)',strk:'rgba(10,15,20,.2)',hl:'rgba(255,255,255,.38)',b1:'rgba(255,255,255,.22)',b2:'rgba(10,122,90,.35)',pt:'rgba(10,15,20,.10)'};
 if(mode==='clair')return {mode,dark:false,bg:C.iv,fg:C.in,mut:C.mu,acc:C.jd,card:'#fff',strk:C.ln,hl:'rgba(63,211,164,.30)',b1:'rgba(63,211,164,.16)',b2:'rgba(242,176,90,.10)',pt:'rgba(10,122,90,.10)'};
 return {mode:'sombre',dark:true,bg:C.pn,fg:C.iv,mut:C.pm,acc:C.ja,card:'rgba(238,243,244,.07)',strk:C.pl,hl:'rgba(63,211,164,.24)',b1:'rgba(63,211,164,.17)',b2:'rgba(242,176,90,.07)',pt:'rgba(238,243,244,.10)'}}
function modes(p){const S=p.reel.scenes;if(S._m&&S._m.n===S.length&&S._m.k===S.map(x=>x.type+(x.fond||'')).join())return S._m.v;const base=(p.reel.fond==='clair')?'clair':'sombre';const v=[];
 S.forEach((s,i)=>{let m=s.fond||null;if(!m){if(['chiffre','compteur'].includes(s.type))m='jade';else if(['citation','devine'].includes(s.type))m='clair';else m=base;if(i>0&&m!==base&&v[i-1]===m)m=base}v.push(m)});
 S._m={n:S.length,k:S.map(x=>x.type+(x.fond||'')).join(),v};return v}
function background(ctx,t,dark,E){E=E||pal(dark?'sombre':'clair');ctx.fillStyle=E.bg;ctx.fillRect(0,0,W,H);
 const blob=(x,y,r,col)=>{const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H)};
 blob(W*.8+Math.sin(t*.45)*110,H*.22+Math.cos(t*.37)*140,680,E.b1);
 blob(W*.15+Math.cos(t*.31)*90,H*.78+Math.sin(t*.29)*120,620,E.b2);
 ctx.fillStyle=E.pt;PART.forEach(q=>{const y=((q.y-t*q.v)%1920+1920)%1920;const x=q.x+Math.sin(t*.6+q.ph)*18;ctx.beginPath();ctx.arc(x,y,q.r,0,7);ctx.fill()});
 const v=ctx.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,E.dark?'rgba(0,0,0,.35)':'rgba(10,15,20,.07)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
 ctx.save();ctx.globalAlpha=E.dark?.045:.035;ctx.globalCompositeOperation='overlay';const gr=grain();const ox=Math.floor(Math.random()*256),oy=Math.floor(Math.random()*256);ctx.translate(-ox,-oy);ctx.fillStyle=ctx.createPattern(gr,'repeat');ctx.fillRect(0,0,W+256,H+256);ctx.restore()}
// texte animé : rise (montée), slam (arrive en grand), mask (révélé par le bas)
function wordsFx(ctx,text,x,y,size,maxW,col,emCol,t0,lt,kind='b',lh=1.06,stag=.07,align='left',fx='rise'){const L=lay(ctx,text,size,maxW,kind);let k=0;
 L.forEach((l,i)=>{const ox=align==='center'?x-l.w/2:x;const by=y+i*size*lh;l.forEach(t=>{const u=(lt-t0-k*stag);k++;if(u<=0)return;ctx.save();if(t.em&&ctx._hl&&kind!=='q'){const g=easeOutExpo((u-.15)/.4);if(g>0){ctx.fillStyle=ctx._hl;rr(ctx,ox+t.x-10,by-size*.78,(t.w+20)*g,size*.98,size*.18);ctx.fill()}}ctx.fillStyle=t.em?emCol:col;ctx.font=t.em?font('em',size):kind==='q'?`italic 400 ${size}px IS`:font(kind,size);
  if(fx==='slam'){const a=clamp(u/.22,0,1);const s=1+.55*(1-easeOutExpo(u/.3));ctx.globalAlpha=a;ctx.translate(ox+t.x+t.w/2,by-size*.35);ctx.scale(s,s);ctx.fillText(t.t,-t.w/2,size*.35)}
  else if(fx==='mask'){const a=easeOutExpo(u/.55);ctx.beginPath();ctx.rect(ox+t.x-10,by-size*1.05,t.w+30,size*1.35);ctx.clip();ctx.fillText(t.t,ox+t.x,by+(1-a)*size*1.1)}
  else{const a=ease(u/.45);ctx.globalAlpha=a;ctx.fillText(t.t,ox+t.x,by+(1-a)*36)}ctx.restore()})});return L.length*size*lh}
// objet 3D vivant : entrée rebondie, flottement, léger balancement, ombre au sol
function obj3d(ctx,name,x,y,w,lt,t,delay=.3){const im=IMG[name];if(!im)return;const u=lt-delay;if(u<=0)return;const e=easeOutBack(u/.7);const h=w*im.height/im.width;
 const fy=Math.sin(t*1.5)*14,rot=Math.sin(t*1.1)*.05,sc=.55+.45*e;ctx.save();
 ctx.globalAlpha=clamp(u/.25,0,1)*.28;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(x+w/2,y+h+18,w*.36*(1-fy/140),16,0,0,7);ctx.fill();
 ctx.globalAlpha=clamp(u/.2,0,1);ctx.translate(x+w/2,y+h/2+fy+(1-e)*90);ctx.rotate(rot);ctx.scale(sc,sc);ctx.drawImage(im,-w/2,-h/2,w,h);ctx.restore()}
// Banque d'icônes Olto (vectorielles, tracées en direct)
const ICON={
 euro:g=>{g.arc(56,50,30,-Math.PI/4,Math.PI/4,true);g.moveTo(16,42);g.lineTo(58,42);g.moveTo(16,58);g.lineTo(54,58)},
 carte:g=>{g.rect(12,26,76,50);g.moveTo(12,40);g.lineTo(88,40);g.moveTo(22,62);g.lineTo(42,62)},
 caddie:g=>{g.moveTo(10,20);g.lineTo(22,20);g.lineTo(32,64);g.lineTo(78,64);g.lineTo(86,32);g.lineTo(26,32);g.moveTo(40,80);g.arc(36,80,5,0,7);g.moveTo(76,80);g.arc(72,80,5,0,7)},
 hausse:g=>{g.moveTo(12,78);g.lineTo(38,52);g.lineTo(54,64);g.lineTo(86,28);g.moveTo(66,28);g.lineTo(86,28);g.lineTo(86,48)},
 baisse:g=>{g.moveTo(12,26);g.lineTo(38,52);g.lineTo(54,40);g.lineTo(86,76);g.moveTo(66,76);g.lineTo(86,76);g.lineTo(86,56)},
 horloge:g=>{g.moveTo(86,50);g.arc(50,50,36,0,7);g.moveTo(50,26);g.lineTo(50,50);g.lineTo(66,60)},
 maison:g=>{g.moveTo(14,48);g.lineTo(50,16);g.lineTo(86,48);g.moveTo(24,40);g.lineTo(24,84);g.lineTo(76,84);g.lineTo(76,40);g.moveTo(42,84);g.lineTo(42,62);g.lineTo(58,62);g.lineTo(58,84)},
 cadeau:g=>{g.rect(16,40,68,44);g.rect(12,28,76,12);g.moveTo(50,28);g.lineTo(50,84);g.moveTo(50,28);g.bezierCurveTo(40,10,24,18,50,28);g.moveTo(50,28);g.bezierCurveTo(60,10,76,18,50,28)},
 tirelire:g=>{g.ellipse(48,54,34,26,0,0,7);g.moveTo(40,30);g.lineTo(58,30);g.moveTo(30,78);g.lineTo(30,88);g.moveTo(64,78);g.lineTo(64,88);g.moveTo(82,50);g.lineTo(90,46)},
 essence:g=>{g.rect(18,18,40,66);g.moveTo(18,40);g.lineTo(58,40);g.moveTo(58,30);g.lineTo(74,40);g.lineTo(74,74);g.lineTo(84,74);g.lineTo(84,44)},
 alerte:g=>{g.moveTo(50,12);g.lineTo(90,84);g.lineTo(10,84);g.closePath();g.moveTo(50,38);g.lineTo(50,60);g.moveTo(50,70);g.lineTo(50,72)},
 check:g=>{g.moveTo(86,50);g.arc(50,50,36,0,7);g.moveTo(32,50);g.lineTo(45,63);g.lineTo(70,36)},
 telephone:g=>{g.rect(28,10,44,80);g.moveTo(44,78);g.lineTo(56,78)},
 calendrier:g=>{g.rect(14,22,72,64);g.moveTo(14,40);g.lineTo(86,40);g.moveTo(32,14);g.lineTo(32,30);g.moveTo(68,14);g.lineTo(68,30);g.moveTo(30,58);g.lineTo(40,58);g.moveTo(54,58);g.lineTo(64,58);g.moveTo(30,72);g.lineTo(40,72)},
 loupe:g=>{g.moveTo(66,42);g.arc(42,42,24,0,7);g.moveTo(60,60);g.lineTo(86,86)},
 banque:g=>{g.moveTo(10,36);g.lineTo(50,14);g.lineTo(90,36);g.closePath();g.moveTo(22,42);g.lineTo(22,74);g.moveTo(40,42);g.lineTo(40,74);g.moveTo(60,42);g.lineTo(60,74);g.moveTo(78,42);g.lineTo(78,74);g.moveTo(10,84);g.lineTo(90,84)},
 eclair:g=>{g.moveTo(56,10);g.lineTo(26,56);g.lineTo(48,56);g.lineTo(42,90);g.lineTo(74,42);g.lineTo(52,42);g.closePath()}};
function icon(ctx,name,x,y,size,lt,E,t0=.05){const f=ICON[name];if(!f)return;const u=lt-t0;if(u<=0)return;const e=easeOutBack(u/.5);const pr=easeInOut((u-.1)/.7);ctx.save();ctx.translate(x+size/2,y+size/2);ctx.scale(clamp(e,0,1.15),clamp(e,0,1.15));
 ctx.fillStyle=E.mode==='jade'?'rgba(10,15,20,.10)':E.card;ctx.beginPath();ctx.arc(0,0,size/2,0,7);ctx.fill();ctx.strokeStyle=E.strk;ctx.lineWidth=2;ctx.stroke();
 const k=size*.55/100;ctx.translate(-50*k,-50*k+Math.sin((lt)*2)*2);ctx.scale(k,k);ctx.beginPath();f(ctx);ctx.strokeStyle=E.acc;ctx.lineWidth=7;ctx.lineCap='round';ctx.lineJoin='round';ctx.setLineDash([600,600]);ctx.lineDashOffset=600*(1-clamp(pr,0,1));ctx.stroke();ctx.restore()}
const PH={};function loadPhotos(p){return Promise.all((p.reel&&p.reel.scenes||[]).filter(s=>s.src).map(s=>PH[s.src]?1:new Promise(ok=>{const i=new Image();i.onload=()=>{PH[s.src]=i;ok()};i.onerror=ok;i.src=s.src})))}
// ----- une scène, dessinée sur un calque transparent -----
function drawScene(ctx,p,s,lt,d,t,E){const {fg,mut,acc,dark,card,strk}=E;const X0=80,MW=760,top=450;ctx._hl=E.hl;
 if(s.icone&&ICON[s.icone]&&!['cta','photo','match','devine'].includes(s.type)){icon(ctx,s.icone,X0,top-40,150,lt,E);ctx.translate(0,170)}
 const objOK=s.objet&&!['cta','match','barres','devine','photo','citation','compteur'].includes(s.type);if(objOK)obj3d(ctx,s.objet,480,1000,400,lt,t);
 if(s.type==='hook'){const sz=fitSize(ctx,s.titre,MW,5,136,80);const h=wordsFx(ctx,s.titre,X0,top+sz,sz,MW,fg,acc,0,lt,'b',1.04,.11,'left','slam');
  const u=ease((lt-.5)/.5);if(u>0){ctx.fillStyle=acc;rr(ctx,X0,top+sz+h-sz*.55,140*u,10,5);ctx.fill()}}
 else if(s.type==='chiffre'){const np=numParts(s.chiffre);const k=easeOutExpo(lt/1.1);const txt=np?fmtNum(np,np.val*k):s.chiffre;let cs=300;ctx.font=font('b',cs);while(cs>140&&ctx.measureText(s.chiffre).width>MW){cs-=10;ctx.font=font('b',cs)}
  const a=ease(lt/.35);const sc=1+.12*(1-easeOutBack(lt/.6));ctx.save();ctx.globalAlpha=a;ctx.fillStyle=acc;ctx.letterSpacing=(-cs*.04)+'px';ctx.translate(X0,top+cs*.9);ctx.scale(sc,sc);ctx.fillText(txt,0,0);ctx.restore();ctx.letterSpacing='0px';
  const bw=Math.min(MW,ctx.measureText(s.chiffre).width);const u=easeInOut((lt-.9)/.5);if(u>0){ctx.fillStyle=acc;ctx.globalAlpha=.9;rr(ctx,X0,top+cs*.9+36,bw*u,8,4);ctx.fill();ctx.globalAlpha=1}
  if(s.label)wordsFx(ctx,s.label,X0,top+cs*.9+140,fitSize(ctx,s.label,MW,4,72,48),MW,fg,acc,.55,lt,'b',1.1,.05)}
 else if(s.type==='texte'){let y=top+90;if(s.titre){const sz=fitSize(ctx,s.titre,MW,3,100,64);y+=wordsFx(ctx,s.titre,X0,y,sz,MW,fg,acc,0,lt,'b',1.05,.07,'left','mask')+30}if(s.texte)wordsFx(ctx,s.texte,X0,y+20,52,MW,mut,acc,.5,lt,'m',1.35,.025)}
 else if(s.type==='liste'){let y=top+90;if(s.titre){y+=wordsFx(ctx,s.titre,X0,y,fitSize(ctx,s.titre,MW,2,92,60),MW,fg,acc,0,lt,'b',1.05,.07,'left','mask')+50}
  (s.items||[]).slice(0,4).forEach((it,k)=>{const t0=.5+k*.55;const u=lt-t0;if(u<=0)return;const a=easeOutBack(u/.5);ctx.save();ctx.globalAlpha=clamp(u/.2,0,1);ctx.translate((1-clamp(a,0,1.2))*-60,0);rr(ctx,X0,y-58,MW,120,30);ctx.fillStyle=card;ctx.fill();ctx.strokeStyle=strk;ctx.lineWidth=2;ctx.stroke();
   ctx.fillStyle=acc;ctx.beginPath();ctx.arc(X0+56,y+2,18*clamp(a,0,1.2),0,7);ctx.fill();ctx.strokeStyle=dark?C.pn:'#fff';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(X0+47,y+3);ctx.lineTo(X0+54,y+10);ctx.lineTo(X0+66,y-5);ctx.stroke();ctx.restore();
   wordsFx(ctx,it,X0+100,y+18,fitSize(ctx,it,MW-140,1,52,34),MW-140,fg,acc,t0,lt,'b',1,0);y+=150})}
 else if(s.type==='citation'){const g=easeOutBack((lt-.05)/.6);if(g>0){ctx.save();ctx.globalAlpha=clamp(lt/.3,0,1);ctx.fillStyle=acc;ctx.font=`italic 400 ${300*clamp(g,0,1.2)}px IS`;ctx.fillText('«',X0-10,top+190);ctx.restore()}
  const q=String(s.citation||'');const sz=fitSize(ctx,q,MW,6,76,46,'m');const h=wordsFx(ctx,q,X0,top+260,sz,MW,fg,acc,.35,lt,'q',1.18,.045);
  const by=top+260+h+30;const u=ease((lt-.35-q.split(' ').length*.045-.2)/.5);if(u>0){ctx.save();ctx.globalAlpha=u;ctx.fillStyle=acc;rr(ctx,X0,by,60*u,6,3);ctx.fill();ctx.fillStyle=fg;ctx.font=font('b',40);ctx.fillText(String(s.auteur||''),X0,by+60);ctx.fillStyle=mut;ctx.font=font('mono',26);ctx.fillText(String([s.role,s.date].filter(Boolean).join(' · ')).toUpperCase().slice(0,44),X0,by+104);ctx.restore()}}
 else if(s.type==='compteur'){const np=numParts(s.chiffre);const st=numParts(s.depart||'0');const k=clamp((lt-.3)/Math.max(.8,d-1.1),0,1);const v=np?(st?st.val:0)+(np.val-(st?st.val:0))*easeInOut(k):0;const txt=np?fmtNum(np,v):s.chiffre;
  let cs=240;ctx.font=font('b',cs);while(cs>110&&ctx.measureText(s.chiffre).width>MW){cs-=8;ctx.font=font('b',cs)}
  const bl=(Math.floor(lt*2)%2)===0;ctx.save();rr(ctx,X0,top+30,210,56,28);ctx.fillStyle=card;ctx.fill();ctx.strokeStyle=strk;ctx.lineWidth=2;ctx.stroke();ctx.fillStyle=bl?C.sig:'rgba(255,92,77,.35)';ctx.beginPath();ctx.arc(X0+32,top+58,9,0,7);ctx.fill();ctx.fillStyle=fg;ctx.font=font('mono',24);ctx.fillText('EN DIRECT',X0+54,top+67);ctx.restore();
  ctx.save();ctx.globalAlpha=ease(lt/.3);ctx.fillStyle=acc;ctx.letterSpacing=(-cs*.04)+'px';ctx.fillText(txt,X0,top+150+cs*.85);ctx.restore();ctx.letterSpacing='0px';
  if(s.label)wordsFx(ctx,s.label,X0,top+150+cs*.85+120,fitSize(ctx,s.label,MW,4,64,44),MW,fg,acc,.4,lt,'b',1.1,.05)}
 else if(s.type==='match'){let y0=top+40;if(s.titre){const sz=fitSize(ctx,s.titre,MW,1,72,48);wordsFx(ctx,s.titre,X0,top+sz,sz,MW,fg,acc,0,lt,'b',1,.06,'left','mask');y0=top+sz+40}
  const ch=Math.min(300,(1240-y0-80)/2);const cardF=(o,yy,col,t0,dir)=>{o=o||{};const u=lt-t0;if(u<=0)return;const e=easeOutBack(u/.6);ctx.save();ctx.globalAlpha=clamp(u/.2,0,1);ctx.translate(dir*(1-clamp(e,0,1.1))*500,0);rr(ctx,X0,yy,MW,ch,36);ctx.fillStyle=card;ctx.fill();ctx.strokeStyle=strk;ctx.lineWidth=2;ctx.stroke();
   ctx.fillStyle=mut;ctx.font=font('mono',26);ctx.fillText(String(o.titre||'').toUpperCase().slice(0,30),X0+40,yy+58);const np=numParts(o.chiffre);const k=easeOutExpo((u-.2)/1);const txt=np?fmtNum(np,np.val*clamp(k,0,1)):String(o.chiffre||'');let cs=112;ctx.font=font('b',cs);while(cs>60&&ctx.measureText(String(o.chiffre||'')).width>MW-80){cs-=6;ctx.font=font('b',cs)}
   ctx.fillStyle=col;ctx.fillText(txt,X0+40,yy+58+cs*.95);if(o.label){ctx.fillStyle=fg;const ls=fitSize(ctx,o.label,MW-80,2,34,26,'m');const L=lay(ctx,o.label,ls,MW-80,'m');L.forEach((l,li)=>{l.forEach(tk=>{ctx.font=tk.em?font('em',ls):font('m',ls);ctx.fillText(tk.t,X0+40+tk.x,yy+58+cs*.95+48+li*ls*1.25)})})}ctx.restore()};
  cardF(s.a,y0,dark?C.ja:C.jd,.15,-1);cardF(s.b,y0+ch+80,C.sig,.45,1);const v=easeOutBack((lt-.75)/.45);if(v>0){ctx.save();ctx.translate(X0+MW/2,y0+ch+40);ctx.scale(v,v);ctx.fillStyle=C.am;ctx.beginPath();ctx.arc(0,0,48,0,7);ctx.fill();ctx.fillStyle=C.in;ctx.font=font('b',36);ctx.textAlign='center';ctx.fillText('VS',0,13);ctx.restore();ctx.textAlign='left'}}
 else if(s.type==='barres'){let y=top+40;if(s.titre){const sz=fitSize(ctx,s.titre,MW,2,80,52);y=top+sz;y+=wordsFx(ctx,s.titre,X0,y,sz,MW,fg,acc,0,lt,'b',1.05,.06,'left','mask')+20}
  const it=(s.items||[]).slice(0,5);const mx=Math.max(...it.map(x=>Math.abs(+x.valeur||0)),1);const step=Math.min(150,(1260-y)/Math.max(1,it.length));
  it.forEach((b,k)=>{const t0=.4+k*.25;const u=easeOutExpo((lt-t0)/.9);const yy=y+k*step;ctx.save();ctx.globalAlpha=clamp((lt-t0)/.2,0,1);ctx.fillStyle=fg;ctx.font=font('m',34);ctx.fillText(String(b.label||'').slice(0,28),X0,yy+34);
   const bw=Math.max(8,(MW-170)*Math.abs(+b.valeur||0)/mx*u);rr(ctx,X0,yy+52,bw,46,14);ctx.fillStyle=(+b.valeur<0)?C.sig:(k===0?acc:(dark?'rgba(63,211,164,.55)':'rgba(10,122,90,.55)'));ctx.fill();
   const np=numParts(b.affiche||String(b.valeur));ctx.fillStyle=fg;ctx.font=font('b',38);ctx.fillText(np?fmtNum(np,np.val*u):String(b.affiche||''),X0+bw+18,yy+88);ctx.restore()})}
 else if(s.type==='vraifaux'){const sz=fitSize(ctx,s.titre,MW,4,96,60);const h=wordsFx(ctx,s.titre,X0,top+90+sz*.5,sz,MW,fg,acc,0,lt,'b',1.06,.06);const ts=+s.tampon||1.4;const u=lt-ts;
  const vr=String(s.verdict||'').toLowerCase().startsWith('v');const col=vr?C.ja:C.sig;if(u>0){const e=easeOutExpo(u/.25);ctx.save();ctx.translate(X0+230,top+90+sz*.5+h+80);ctx.rotate(-.12);ctx.scale(2.2-1.2*e,2.2-1.2*e);ctx.globalAlpha=clamp(u/.12,0,1);ctx.strokeStyle=col;ctx.lineWidth=10;rr(ctx,-210,-70,420,140,26);ctx.stroke();ctx.fillStyle=col;ctx.font=font('b',96);ctx.textAlign='center';ctx.fillText(vr?'VRAI':'FAUX',0,34);ctx.restore();ctx.textAlign='left'}
  if(s.texte)wordsFx(ctx,s.texte,X0,top+90+sz*.5+h+250,fitSize(ctx,s.texte,MW,4,50,38,'m'),MW,mut,acc,ts+.5,lt,'m',1.32,.03)}
 else if(s.type==='devine'){const sz=fitSize(ctx,s.question||'',MW,3,84,56);const h=wordsFx(ctx,s.question||'',X0,top+sz,sz,MW,fg,acc,0,lt,'b',1.06,.06,'left','mask');const rv=Math.min(+s.revele||d*.58,d-1);const ok=+s.bonne||0;
  (s.options||[]).slice(0,3).forEach((o,k)=>{const t0=.6+k*.3;const u=lt-t0;if(u<=0)return;const yy=top+sz+h+30+k*140;const e=easeOutBack(u/.45);const rev=lt>=rv;const good=k===ok;
   ctx.save();ctx.globalAlpha=clamp(u/.2,0,1)*(rev&&!good?.35:1);ctx.translate(0,(1-clamp(e,0,1.1))*50);const pulse=rev&&good?1+.04*Math.sin(clamp((lt-rv)/.35,0,1)*Math.PI):1;ctx.translate(X0+MW/2,yy+55);ctx.scale(pulse,pulse);ctx.translate(-(X0+MW/2),-(yy+55));
   rr(ctx,X0,yy,MW,110,30);ctx.fillStyle=rev&&good?acc:card;ctx.fill();ctx.strokeStyle=rev&&good?acc:strk;ctx.lineWidth=2;ctx.stroke();ctx.fillStyle=rev&&good?C.in:mut;ctx.font=font('mono',30);ctx.fillText('ABC'[k],X0+36,yy+66);
   ctx.fillStyle=rev&&good?C.in:fg;ctx.font=font('b',fitSize(ctx,String(o),MW-200,1,48,30));ctx.fillText(String(o),X0+90,yy+70);if(rev&&good){ctx.strokeStyle=C.in;ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(X0+MW-80,yy+56);ctx.lineTo(X0+MW-66,yy+70);ctx.lineTo(X0+MW-42,yy+42);ctx.stroke()}ctx.restore()})}
 else if(s.type==='photo'){const im=PH[s.src];const ph=520,py=top+20;const u=easeOutExpo(lt/.7);ctx.save();ctx.globalAlpha=clamp(lt/.25,0,1);ctx.translate(0,(1-u)*60);rr(ctx,X0,py,MW,ph,36);ctx.save();ctx.clip();
   if(im){const k=1.12-.08*clamp(lt/d,0,1);const r=Math.max(MW/im.width,ph/im.height)*k;const iw=im.width*r,ih=im.height*r;ctx.drawImage(im,X0+(MW-iw)/2+Math.sin(lt*.3)*10,py+(ph-ih)/2,iw,ih)}else{ctx.fillStyle=card;ctx.fillRect(X0,py,MW,ph)}ctx.restore();
   ctx.strokeStyle=strk;ctx.lineWidth=2;rr(ctx,X0,py,MW,ph,36);ctx.stroke();if(s.credit){ctx.fillStyle=mut;ctx.font=font('mono',20);ctx.textAlign='right';ctx.fillText(String(s.credit).slice(0,50),X0+MW,py+ph+32);ctx.textAlign='left'}ctx.restore();
  if(s.titre){const sz=fitSize(ctx,s.titre,MW,3,76,50);wordsFx(ctx,s.titre,X0,py+ph+80+sz*.8,sz,MW,fg,acc,.4,lt,'b',1.06,.06,'left','mask')}}
 else if(s.type==='cta'){const a=easeOutBack(lt/.6);ctx.save();const pr=clamp(lt/1.2,0,1);ctx.globalAlpha=(1-pr)*.5;ctx.strokeStyle=acc;ctx.lineWidth=6;ctx.beginPath();ctx.arc(480,640,80+pr*260,0,7);ctx.stroke();ctx.restore();
  ctx.save();ctx.globalAlpha=clamp(lt/.3,0,1);ctx.translate(480,600);ctx.scale(clamp(a,0,1.2),clamp(a,0,1.2));logo(ctx,-172,-40,.9,fg);ctx.restore();
  const tt=s.titre||'Suis *@olto.media* pour la suite.';const sz=fitSize(ctx,tt,MW,3,96,60);const L=lay(ctx,tt,sz,MW);wordsFx(ctx,tt,480,860,sz,MW,fg,acc,.4,lt,'b',1.08,.07,'center','slam');
  if(s.texte)wordsFx(ctx,s.texte,480,860+L.length*sz*1.08+60,48,MW-80,mut,acc,.9,lt,'m',1.35,.02,'center')}}
// ----- calques et transitions -----
let LA=null,LB=null;function layer(c){if(!c){c=document.createElement('canvas');c.width=W;c.height=H}const g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.filter='none';g.clearRect(0,0,W,H);return c}
// Remplir le cadre : on mesure le bloc de la scène (état final) et on l'agrandit / le centre dans la zone utile (x 80-840, y 430-1270)
let MC=null;const FIT={};
function fitOf(p,s,d,E){const key=JSON.stringify(s)+E.mode;if(FIT[key])return FIT[key];if(s.type==='cta')return FIT[key]={s:1,x:0,y:0};
 if(!MC){MC=document.createElement('canvas');MC.width=W;MC.height=H}const g=MC.getContext('2d',{willReadFrequently:true});g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.clearRect(0,0,W,H);g.save();drawScene(g,p,s,d+6,d,0,E);g.restore();
 const D=g.getImageData(0,0,W,H).data;let x0=W,y0=H,x1=0,y1=0;for(let y=0;y<H;y+=3){for(let x=0;x<W;x+=3){if(D[(y*W+x)*4+3]>10){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}}}
 if(x1<=x0)return FIT[key]={s:1,x:0,y:0};const bw=x1-x0+3,bh=y1-y0+3;const sc=Math.min(800/bw,810/bh,1.32);const cx=['vraifaux'].includes(s.type)?0:0;
 return FIT[key]={s:sc,x:80-x0*sc+cx,y:430+(810-bh*sc)/2-y0*sc}}
function renderLayer(c,p,s,lt,d,t,E){const g=c.getContext('2d');background(g,t,E.dark,E);const F=fitOf(p,s,d,E);const kb=1+.02*clamp(lt/d,0,1);const pu=1+.035*(1-easeOutExpo(lt/.45));g.save();g.translate(460,880);g.scale(kb*pu,kb*pu);g.translate(-460,-880);g.translate(F.x,F.y);g.scale(F.s,F.s);drawScene(g,p,s,lt,d,t,E);g.restore()}
function transName(s,i){return s.transition&&TRANS.includes(s.transition)?s.transition:TRANS[(i-1)%TRANS.length]}
function compose(ctx,A,B,kind,q,dark){const e=easeInOut(q);ctx.save();
 if(kind==='push'){ctx.globalAlpha=1-e;ctx.drawImage(A,0,-e*420);ctx.globalAlpha=e;ctx.drawImage(B,0,(1-e)*420)}
 else if(kind==='slide'){ctx.globalAlpha=1-e;ctx.drawImage(A,-e*540,0);ctx.globalAlpha=e;ctx.drawImage(B,(1-e)*540,0)}
 else if(kind==='zoom'){ctx.save();ctx.globalAlpha=1-e;ctx.filter=`blur(${(e*14).toFixed(1)}px)`;ctx.translate(460,900);ctx.scale(1+.18*e,1+.18*e);ctx.translate(-460,-900);ctx.drawImage(A,0,0);ctx.restore();
  ctx.save();ctx.globalAlpha=e;ctx.filter=`blur(${((1-e)*14).toFixed(1)}px)`;ctx.translate(460,900);ctx.scale(.9+.1*e,.9+.1*e);ctx.translate(-460,-900);ctx.drawImage(B,0,0);ctx.restore()}
 else if(kind==='wipe'){const x=-400+e*(W+800);ctx.save();ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(W+400,0);ctx.lineTo(W+400,H);ctx.lineTo(x-400,H);ctx.closePath();ctx.clip();ctx.drawImage(A,0,0);ctx.restore();
  ctx.save();ctx.beginPath();ctx.moveTo(-400,0);ctx.lineTo(x,0);ctx.lineTo(x-400,H);ctx.lineTo(-800,H);ctx.closePath();ctx.clip();ctx.drawImage(B,0,0);ctx.restore();
  ctx.fillStyle=C.ja;ctx.beginPath();ctx.moveTo(x-14,0);ctx.lineTo(x+14,0);ctx.lineTo(x-386,H);ctx.lineTo(x-414,H);ctx.closePath();ctx.fill()}
 else{/* flash */const a=q<.5?1-q*2:0,b=q<.5?0:(q-.5)*2;ctx.globalAlpha=a;ctx.drawImage(A,0,0);ctx.globalAlpha=b;ctx.drawImage(B,0,0);ctx.globalAlpha=Math.sin(q*Math.PI)*.45;ctx.fillStyle=dark?C.ja:'#fff';ctx.fillRect(0,0,W,H)}
 ctx.restore()}
// ----- repères sonores (bruitages calés sur l'image) -----
function cues(p){const S=p.reel&&p.reel.scenes||[];const out=[];let a=0;S.forEach((s,i)=>{const d=+s.d||3;
 if(i===0)out.push({t:.02,s:'impact',v:.5});else{const k=transName(s,i);out.push({t:Math.max(0,a-.12),s:k==='wipe'||k==='flash'?'swish':'whoosh',v:.55})}
 if(s.type==='chiffre')out.push({t:a+1.05,s:'blip',v:.4});
 if(s.type==='liste')(s.items||[]).slice(0,4).forEach((_,k)=>out.push({t:a+.5+k*.55,s:'pop',v:.45}));
 if(s.type==='match'){out.push({t:a+.75,s:'impact',v:.45})}
 if(s.type==='barres')(s.items||[]).slice(0,5).forEach((_,k)=>out.push({t:a+.4+k*.25,s:'tick',v:.4}));
 if(s.type==='vraifaux')out.push({t:a+(+s.tampon||1.4),s:'stamp',v:.7});
 if(s.type==='devine'){(s.options||[]).slice(0,3).forEach((_,k)=>out.push({t:a+.6+k*.3,s:'pop',v:.4}));out.push({t:a+Math.min(+s.revele||d*.58,d-1),s:'ding',v:.55})}
 if(s.type==='compteur')out.push({t:a+d-.75,s:'blip',v:.4});
 if(s.type==='cta')out.push({t:a+.35,s:'ding',v:.45});
 a+=d});return out.filter(c=>c.t>=0)}
function frame(ctx,p,t){const R=p.reel||{scenes:[]};const rub=String(p.rubrique||'Olto');ctx._fade=1;ctx.globalAlpha=1;
 if(!R.scenes||!R.scenes.length){background(ctx,t,(R.fond||'sombre')!=='clair');return}const M=modes(p);const {i,s,lt,d,start}=sceneAt(p,t);const E=pal(M[i]);const dark=E.dark;
 let sh=0;((p._cuesT===total(p)&&p._cues)||(p._cuesT=total(p),p._cues=cues(p))).forEach(c=>{if(c.s==='impact'||c.s==='stamp'){const u=t-c.t;if(u>=0&&u<.32)sh+=(c.s==='stamp'?11:7)*(1-u/.32)*Math.sin(u*70)}});
 ctx.fillStyle=E.bg;ctx.fillRect(0,0,W,H);ctx.save();if(sh)ctx.translate(sh,sh*.6);
 LB=layer(LB);renderLayer(LB,p,s,lt,d,t,E);
 if(i>0&&lt<TD){const ps=R.scenes[i-1];const pd=+ps.d||3;LA=layer(LA);renderLayer(LA,p,ps,pd-.01+lt,pd,t,pal(M[i-1]));compose(ctx,LA,LB,transName(s,i),lt/TD,dark)}else ctx.drawImage(LB,0,0);
 ctx.restore();
 // pastille rubrique (fixe)
 ctx.font=font('mono',27);const lab=rub.toUpperCase();const cw=ctx.measureText(lab).width+lab.length*2.5+96;rr(ctx,80,320,cw,64,32);ctx.fillStyle=E.mode==='jade'?'rgba(10,15,20,.12)':dark?'rgba(238,243,244,.08)':'#fff';ctx.fill();ctx.strokeStyle=E.strk;ctx.lineWidth=2;ctx.stroke();
 ctx.fillStyle=rub.toLowerCase().includes('habitude')?C.am:E.mode==='jade'?C.in:C.ja;ctx.beginPath();ctx.arc(116,352,9,0,7);ctx.fill();ctx.fillStyle=E.fg;ctx.letterSpacing='2px';ctx.fillText(lab,138,362);ctx.letterSpacing='0px';
 const out=1;const fg=E.fg;
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
  const ca=ease((lt-tStart[ch[0]]+.05)/.18);const cy=1370;{const mw=Math.max(...lines.map(l=>lw_(l,sz)));const bh=lines.length*sz*1.12+44;ctx.save();ctx.globalAlpha=ca*.82;ctx.fillStyle='rgba(10,15,20,.62)';rr(ctx,470-mw/2-34,cy-(lines.length-1)*sz*.56-sz*.95-14,mw+68,bh,28);ctx.fill();ctx.restore();ctx.font=font('b',sz)}
  lines.forEach((ln,li)=>{const lw=ln.reduce((a,k)=>a+ctx.measureText(T[k].t).width,0)+spw*(ln.length-1);let x=470-lw/2;const y=cy+li*sz*1.12-(lines.length-1)*sz*.56;
   ln.forEach(k=>{const w0=ctx.measureText(T[k].t).width;const active=k===wi&&lt>=tStart[k],said=k<wi;const pop=active?1+.08*(1-ease((lt-tStart[k])/.16)):1;
    ctx.save();ctx.translate(x+w0/2,y);ctx.scale(pop,pop);ctx.globalAlpha=out*ca*(active||said?1:.55);ctx.font=font('b',sz);ctx.textAlign='center';
    ctx.shadowColor='rgba(0,0,0,.35)';ctx.shadowBlur=10;ctx.shadowOffsetY=2;
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
async function record(p,onProg){const voice=p._voice&&actx();const mime=pickMime(!!voice);if(!mime||!HTMLCanvasElement.prototype.captureStream)throw {code:"no_recorder"};await loadImgs();await loadPhotos(p);
 const cv=document.createElement('canvas');cv.width=W;cv.height=H;cv.style.cssText='position:fixed;left:-99999px;top:0;width:10px;height:18px';document.body.appendChild(cv);const ctx=cv.getContext('2d');
 frame(ctx,p,0);const vs=cv.captureStream(FPS);let stream=vs,asrc=null;if(voice){const dest=voice.createMediaStreamDestination();asrc=voice.createBufferSource();asrc.buffer=p._voice;asrc.connect(dest);stream=new MediaStream([...vs.getVideoTracks(),...dest.stream.getAudioTracks()])}const rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:9e6});const chunks=[];rec.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
 const done=new Promise(ok=>rec.onstop=ok);const T=total(p)+.4;rec.start(250);if(asrc)asrc.start();const st=performance.now();
 await new Promise(ok=>{const loop=()=>{const t=(performance.now()-st)/1000;frame(ctx,p,Math.min(t,T-.41));onProg&&onProg(Math.min(1,t/T));if(t<T)requestAnimationFrame(loop);else ok()};requestAnimationFrame(loop)});
 rec.stop();await done;stream.getTracks().forEach(x=>x.stop());cv.remove();return {blob:new Blob(chunks,{type:mime.split(';')[0]}),ext:mime.includes('mp4')?'mp4':'webm',mime:rec.mimeType||mime}}
window.OltoReel={ICONS:Object.keys(ICON),frame,player,record,loadImgs,loadPhotos,total,decodeVoice,alignVoice,speechSpans,cues,music,TRANS,MUSIC,W,H};
})();
