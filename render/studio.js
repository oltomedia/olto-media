/* Olto · Studio de Malo : rend les posts dans la charte (SVG), export PNG / ZIP */
(function(){
const C={iv:'#EEF3F4',pn:'#0F1E1B',in:'#0A0F14',mu:'#5A6870',pm:'#9DBFB4',ln:'#D3DDE0',pl:'#2A4A42',ja:'#3FD3A4',jd:'#0A7A5A',am:'#F2B05A',ad:'#9A5B0E',at:'#F6E7CF',sig:'#FF5C4D'};
const RUB={'argent':[C.ja,C.jd],'les bases':[C.ja,C.jd],'habitudes':[C.am,C.ad],'défi 66 jours':[C.am,C.ad],'le média':[C.ja,C.jd],'récap':[C.ja,C.jd],'actu':[C.sig,C.sig],'sources':[C.ja,C.jd],'débat':[C.am,C.ad]};
// TikTok : l'image 9:16 est entourée de noir sur les téléphones récents (barre d'état, légende) ; on fond le haut et le bas vers le noir pour un raccord invisible
const TKFADE_OLD=`<defs><linearGradient id="tkT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient><linearGradient id="tkB" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient></defs><rect width="1080" height="290" fill="url(#tkT)"/><rect y="1630" width="1080" height="290" fill="url(#tkB)"/>`;
const TKFADE='';
// TikTok : image plus haute que 9:16 pour remplir les écrans allongés (iPhone) avec NOTRE fond, sans bande noire.
// tallTK(svg,H) agrandit une image 1080x1920 à 1080xH en prolongeant le fond, contenu centré.
function tallTK(svg,H){if(!H||H<=1920)return svg;const dy=Math.round((H-1920)/2);const m=svg.match(/<rect width="1080" height="1920" fill="([^"]+)"/);const col=m?m[1]:'#0F1E1B';
 const FADE=(typeof window!=="undefined"&&window.TKFADE_ON);
 let inner=svg.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');
 if(FADE){inner=inner.replace(/<rect width="1080" height="1920" fill="[^"]+"( data-bg="1")?\/>/,'');
  const PL=window.__PLEIN;window.__PLEIN=null;
  if(PL&&PL.src)inner=inner.replace(/<circle[^>]*\/>/,'');
  if(PL&&PL.src)return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1080 ${H}" width="1080" height="${H}"><rect width="1080" height="${H}" fill="#000"/><image data-plein="1" href="${X(PL.src)}" x="0" y="0" width="1080" height="${H}" preserveAspectRatio="xMidYMid slice"/><defs><linearGradient id="tkpl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".6"/><stop offset=".16" stop-color="#000" stop-opacity=".15"/><stop offset=".34" stop-color="#000" stop-opacity=".25"/><stop offset=".55" stop-color="#05100D" stop-opacity=".72"/><stop offset=".8" stop-color="#000" stop-opacity=".93"/><stop offset="1" stop-color="#000"/></linearGradient></defs><rect width="1080" height="${H}" fill="url(#tkpl)"/><g transform="translate(0,${dy})">${inner}</g></svg>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1080 ${H}" width="1080" height="${H}"><defs><linearGradient id="tkbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2B7560"/><stop offset=".22" stop-color="#22604F"/><stop offset=".45" stop-color="#16392F"/><stop offset=".64" stop-color="#0A1A15"/><stop offset=".78" stop-color="#020504"/><stop offset="1" stop-color="#000"/></linearGradient></defs><rect width="1080" height="${H}" fill="url(#tkbg)"/><g transform="translate(0,${dy})">${inner}</g></svg>`}
 return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1080 ${H}" width="1080" height="${H}"><rect width="1080" height="${H}" fill="${col}"/><g transform="translate(0,${dy})">${inner}</g>${(typeof window!=="undefined"&&window.TKFADE_ON)?`<defs><linearGradient id="tkfb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".45" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity=".92"/></linearGradient><linearGradient id="tkft" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient></defs><rect x="0" y="${H-560}" width="1080" height="560" fill="url(#tkfb)"/><rect x="0" y="0" width="1080" height="400" fill="url(#tkft)"/>`:""}</svg>`}


// Photo presse (kit presse officiel, créditée) : carte arrondie, image recadrée, crédit en dessous.
let PHN=0;
function photoCard(ph,x,y,w,h,dark){if(!ph||!ph.src||h<120)return '';const id='ph'+(++PHN);const cr=ph.credit?`<text x="${x+w}" y="${y+h+28}" text-anchor="end" font-family="PM" font-size="18" fill="${dark?C.pm:C.mu}">${X(String(ph.credit).slice(0,60))}</text>`:'';
 return `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="32"/></clipPath></defs><image href="${X(ph.src)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="32" fill="none" stroke="${dark?C.pl:C.ln}" stroke-width="2"/>`+cr}
// TikTok : agrandit le contenu pour occuper TOUTE la zone visible (hors barre de recherche, boutons, légende), fond intact.
const TKBOX={x0:50,x1:890,y0:365,y1:1555,max:1.6};// mesuré sur iPhone (23/11) : sous la barre de recherche et le compteur 1/8, au-dessus des points et du nom
function fitTK(svg,box){box=box||TKBOX;const host=document.createElement('div');host.style.cssText='position:absolute;left:-20000px;top:0;width:1080px;visibility:hidden';host.innerHTML=svg;document.body.appendChild(host);
 try{const root=host.querySelector('svg');root.style.width='1080px';const o=root.getBoundingClientRect();const k=1080/o.width;
  const g=document.createElementNS('http://www.w3.org/2000/svg','g');[...root.childNodes].forEach(n=>{if(n.nodeType===1&&(n.getAttribute('data-bg')||n.tagName==='defs'))return;g.appendChild(n)});root.appendChild(g);
  g.querySelectorAll('[data-bg]').forEach(n=>n.remove());
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;g.querySelectorAll('text,image,rect,path,line,circle,ellipse,polygon,polyline').forEach(e=>{const b=e.getBoundingClientRect();if(!b.width&&!b.height)return;x0=Math.min(x0,(b.left-o.left)*k);y0=Math.min(y0,(b.top-o.top)*k);x1=Math.max(x1,(b.right-o.left)*k);y1=Math.max(y1,(b.bottom-o.top)*k)});
  if(x1<=x0)return svg;const bw=x1-x0,bh=y1-y0,W=box.x1-box.x0,H=box.y1-box.y0;const s=Math.min(W/bw,H/bh,box.max);if(typeof window!=='undefined')window.__TKFIT={sw:Math.min(W/bw,box.max),sh:H/bh};
  const tx=box.x0+(W-bw*s)/2,ty=box.y0+(H-bh*s)/2;g.setAttribute('transform',`translate(${tx.toFixed(1)},${ty.toFixed(1)}) scale(${s.toFixed(4)}) translate(${(-x0).toFixed(1)},${(-y0).toFixed(1)})`);
  return new XMLSerializer().serializeToString(root).replace(/ style="width: 1080px;"/,'')}finally{host.remove()}}
const TK={x:-20,y:300,s:.93};// zone visible TikTok (photo, mesurée sur iPhone) : x 40-920, y 310-1620
const OBJ=['coins','ring','bars','cup','calendar','coin','hourglass','phone','card'];
const LOGO=(fill,dot)=>`<path d="M47 15A38 38 0 0 0 47 91" fill="none" stroke="${fill}" stroke-width="24" stroke-linecap="round"/><path d="M53 9A38 38 0 0 1 53 85" fill="none" stroke="${fill}" stroke-width="24" stroke-linecap="round"/><line x1="132" y1="-30" x2="132" y2="88" stroke="${fill}" stroke-width="24" stroke-linecap="round"/><path d="M184 -6V70Q184 88 212 88" fill="none" stroke="${fill}" stroke-width="24" stroke-linecap="round"/><line x1="162" y1="14" x2="214" y2="14" stroke="${fill}" stroke-width="24" stroke-linecap="round"/><circle cx="276" cy="50" r="38" fill="none" stroke="${fill}" stroke-width="24"/><circle cx="348" cy="80.8" r="19.2" fill="${dot}"/>`;
const X=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const cv=document.createElement('canvas').getContext('2d');
const F={b:'800 {s}px PJ',m:'500 {s}px PJ',s:'italic 400 {s}px IS',mono:'400 {s}px PM'};
function mw(t,f,s){cv.font=F[f].replace('{s}',s);return cv.measureText(t).width}
// texte avec *mot* en serif italique ; renvoie lignes de runs
function nb(s){return String(s||'').replace(/(\d)\s+(?=(millions?|milliards?|M|Md|k|mois|ans?|jours?|semaines?|heures?|h|min|s|°|€|\$|%)(?![\wÀ-ÿ]))/g,'$1\u00a0').replace(/«\s+/g,'«\u00a0').replace(/\s+(»|:|;|\?|!|%|€)/g,'\u00a0$1')}
function runs(text){const out=[];let sp=true;nb(text).split(/(\*[^*]+\*)/).forEach(p=>{if(!p)return;const em=/^\*.*\*$/.test(p);(em?p.slice(1,-1):p).split(/([ \t\n\r]+)/).forEach(w=>{if(w==='')return;if(/^[ \t\n\r]+$/.test(w)){sp=true;return}out.push({t:w,em,sp});sp=false})});return out}
function layout(text,size,maxW,font='b'){const toks=runs(text);const lines=[[]];let w=0;const sp=mw(' ',font,size);
 for(const t of toks){const tw=t.em?mw(t.t,'s',size*1.12):mw(t.t,font,size);const cur=lines[lines.length-1];const add=(cur.length&&t.sp?sp:0)+tw;
  if(cur.length&&t.sp&&w+add>maxW){lines.push([t]);w=tw}else{cur.push(t);w+=add}}
 return lines}
function lineW(ln,size,font){let w=0;const sp=mw(' ',font,size);ln.forEach((t,j)=>{w+=(j&&t.sp?sp:0)+(t.em?mw(t.t,'s',size*1.12):mw(t.t,font,size))});return w}
function fit(text,maxW,maxLines,start,min,font='b'){let s=start;while(s>min){const L=layout(text,s,maxW,font);if(L.length<=maxLines&&Math.max(...L.map(l=>lineW(l,s,font)*(font==='b'?0.97:1)))<=maxW)break;s-=4}return s}
function textBlock(text,x,y,size,maxW,color,emColor,font='b',lh=1.04,anchor='start'){const L=layout(text,size,maxW,font);let o='';
 L.forEach((ln,i)=>{const yy=y+i*size*lh;let parts='';ln.forEach((t,j)=>{const sep=j&&t.sp?' ':'';parts+=t.em?`<tspan font-family="IS" font-style="italic" font-weight="400" font-size="${size*1.12}" fill="${emColor}">${X(sep+t.t)}</tspan>`:`<tspan>${X(sep+t.t)}</tspan>`});
  o+=`<text x="${x}" y="${yy}" text-anchor="${anchor}" font-family="PJ" font-weight="${font==='b'?800:500}" font-size="${size}" letter-spacing="${font==='b'?-size*0.03:0}" fill="${color}" xml:space="preserve">${parts}</text>`});
 return {svg:o,h:L.length*size*lh,lines:L.length}}
function chip(label,dark,acc,x=72,y=72){const t=String(label||'').toUpperCase();const w=mw(t,'mono',22)+t.length*2+84;
 return `<g transform="translate(${x},${y})"><rect width="${w}" height="56" rx="28" fill="${dark?'rgba(238,243,244,.08)':'#fff'}" stroke="${dark?C.pl:C.ln}" stroke-width="2"/><circle cx="30" cy="28" r="8" fill="${acc}"/><text x="50" y="36" font-family="PM" font-size="22" letter-spacing="2" fill="${dark?C.iv:C.in}">${X(t)}</text></g>`}
function foot(dark,src,right){const fg=dark?C.iv:C.in;let o=`<g transform="translate(72,1236) scale(.24)">${LOGO(fg,C.ja)}</g>`;
 if(src){let t=String(src);while(t.length>4&&mw(t,'mono',20)+t.length*0.5>720)t=t.slice(0,-2);if(t!==String(src))t=t.replace(/[ ,;·]+$/,'')+'…';o+=`<text x="1008" y="1272" text-anchor="end" font-family="PM" font-size="20" fill="${dark?C.pm:C.mu}">${X(t)}</text>`}
 else if(right)o+=`<text x="1008" y="1272" text-anchor="end" font-family="PJ" font-weight="700" font-size="24" fill="${dark?C.pm:C.mu}">${X(right)}</text>`;
 return o}
function bg(dark,h=1350){return `<rect width="1080" height="${h}" fill="${dark?C.pn:C.iv}" data-bg="1"/>`+(dark?`<circle cx="980" cy="${h>1400?420:120}" r="420" fill="${C.ja}" opacity=".07" data-bg="1"/>`:`<circle cx="1000" cy="${h>1400?1500:1250}" r="420" fill="${C.ja}" opacity=".08" data-bg="1"/>`)}
function img(name,x,y,w,h,imgs){const src=imgs&&imgs[name];if(!src)return '';return `<image href="${src}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>`}

// TikTok : mise en page native (colonne étroite, gros textes), empilée de haut en bas ; fitTK l'agrandit ensuite pour remplir la zone visible.
function slideTK(p,s,i,n,imgs){const rub=(p.rubrique||'').toLowerCase();const [acc,accD]=RUB[rub]||[C.ja,C.jd];
 const dark=true;/* TikTok : tout en sombre (dégradé noir natif, décision du 24/11) */const fg=dark?C.iv:C.in,mut=dark?C.pm:C.mu,emc=dark?acc:accD;
 const W=(typeof window!=='undefined'&&window.__TKW)||760,HT=1130,X0=0;const card=dark?'rgba(238,243,244,.06)':'#fff',strk=dark?C.pl:C.ln;
 const last=i===n-1,swipe=p.format==='carrousel'&&!last?'Glisse →':'';let head='',b='',y=0,src='';
 const num=String(i).padStart(2,'0')+' / '+String(n-1).padStart(2,'0');
 const T=(txt,sz,mx,col,f='b',lh)=>{const t=textBlock(txt,X0,y+sz*.8,sz,mx||W,col,emc,f,lh||(f==='b'?1.06:1.36));b+=t.svg;y+=t.h;return t};
 if(s.type==='cover'){head=chip((p.rubrique||'')+(p.format==='carrousel'?' · carrousel':''),dark,acc,X0,0);
  const pl=s.photo&&s.mise!=='carte';T(s.accroche,pl?fit(s.accroche,W,4,112,64):fit(s.accroche,W,6,128,70),W,fg);if(s.sous){y+=pl?30:40;T(s.sous,pl?38:44,W-20,pl?'#D5E2DE':mut,'m')}
  if(s.photo&&s.mise!=='carte'){if(typeof window!=="undefined")window.__PLEIN={src:s.photo.src};if(s.photo.credit){y+=34;T(s.photo.credit,20,W,'#D5E2DE','m')}}
  else if(s.photo){y+=44;b+=photoCard(s.photo,X0,y,W,440,dark);y+=480}else if(s.objet&&OBJ.includes(s.objet)){y+=40;b+=img(s.objet,W-420,y,420,330,imgs);y+=330}}
 else if(s.type==='texte'){head=chip(num,dark,acc,X0,0);T(s.titre,fit(s.titre,W,4,96,60),W,fg);y+=44;T(s.texte,50,W,mut,'m');
  if(s.photo){y+=44;b+=photoCard(s.photo,X0,y,W,400,dark);y+=440}else if(s.objet&&OBJ.includes(s.objet)){y+=40;b+=img(s.objet,W-360,y,360,280,imgs);y+=280}src=s.source||''}
 else if(s.type==='chiffre'){head=chip(num,dark,acc,X0,0);const cs=fit(s.chiffre,W,1,260,110);
  b+=`<text x="${X0}" y="${y+cs*.78}" font-family="PJ" font-weight="800" font-size="${cs}" letter-spacing="${-cs*.04}" fill="${dark?acc:accD}">${X(s.chiffre)}</text>`;y+=cs*.9+40;
  T(s.label,fit(s.label,W,5,66,44),W,fg);src=s.source||''}
 else if(s.type==='duel'){head=chip('Débat · '+(p.rubrique||''),dark,C.am,X0,0);
  const cd=(d,col)=>{d=d||{};const cs=fit(d.chiffre||'',W-80,1,150,80);const ls=fit(d.label||'',W-80,3,40,30,'m');const L=layout(d.label||'',ls,W-80,'m').length;const h=40+cs*.95+20+L*ls*1.3+30;
   b+=`<rect x="${X0}" y="${y}" width="${W}" height="${h}" rx="36" fill="${card}" stroke="${strk}" stroke-width="2"/><text x="${X0+40}" y="${y+40+cs*.78}" font-family="PJ" font-weight="800" font-size="${cs}" letter-spacing="${-cs*.04}" fill="${col}">${X(d.chiffre||'')}</text>`+textBlock(d.label||'',X0+40,y+40+cs*.95+20+ls*.8,ls,W-80,fg,emc,'m',1.3).svg;y+=h};
  cd(s.a,dark?C.ja:C.jd);y+=24;b+=`<text x="${X0+W/2}" y="${y+56}" text-anchor="middle" font-family="IS" font-style="italic" font-size="64" fill="${mut}">contre</text>`;y+=90;cd(s.b,C.sig);y+=50;
  T(s.question,fit(s.question,W,3,64,44),W,fg);src=s.source||''}
 else if(s.type==='recap'){head=chip('Récap · la semaine',dark,acc,X0,0);const tt=s.titre||'La semaine en *3 chiffres*.';T(tt,fit(tt,W,3,88,60),W,fg);y+=40;
  (s.items||[]).slice(0,3).forEach((it,k)=>{const cs=fit(it.chiffre||'',W-80,1,110,64);const ls=fit(it.label||'',W-80,2,36,28,'m');const L=layout(it.label||'',ls,W-80,'m').length;const h=36+cs*.95+16+L*ls*1.3+28;
   b+=`<rect x="${X0}" y="${y}" width="${W}" height="${h}" rx="32" fill="${card}" stroke="${strk}" stroke-width="2"/><text x="${X0+40}" y="${y+36+cs*.78}" font-family="PJ" font-weight="800" font-size="${cs}" letter-spacing="${-cs*.04}" fill="${/^[−-]/.test(String(it.chiffre||''))?(dark?C.sig:'#C8362A'):(s.ton==='bourse'?(dark?acc:accD):(k===1?(dark?C.am:C.ad):(dark?acc:accD)))}">${X(it.chiffre||'')}</text>`+textBlock(it.label||'',X0+40,y+36+cs*.95+16+ls*.8,ls,W-80,fg,emc,'m',1.3).svg;y+=h+22});src=s.source||''}
 else if(s.type==='cta'){head=chip('Olto',dark,acc,X0,0);/* TikTok : la dernière slide appelle à s'abonner (décision du 24/11), pas au lien en bio */const tt=s.titreTK||'*Abonne-toi* pour comprendre ton argent.';T(tt,fit(tt,W,4,112,64),W,fg);y+=44;
  T(s.texteTK||((s.texte&&s.texte.includes('?'))?s.texte:'5 infos argent par semaine, chiffres sourcés, zéro promesse.'),44,W,mut,'m');y+=40;b+=img(s.objet||'coins',W-400,y,400,300,imgs);y+=300}
 else return null;
 // 26/11 : couverture photo plein cadre = même mise en page que « la une » du Top 5 (bloc compact, texte large)
 if(s.type==='cover'&&typeof window!=='undefined'&&window.__PLEIN){let g=`<g transform="translate(0,110)">${b}</g>`;const yy=110+y+70;
  if(swipe)g+=`<text x="${X0}" y="${yy}" font-family="PJ" font-weight="700" font-size="40" fill="${C.iv}">${X(swipe.replace(' →',''))} <tspan fill="${acc}">→</tspan></text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1080 1920" width="1080" height="1920">${bg(dark,1920)}${head}${g}</svg>`}
 // chip en haut, pied en bas, contenu centré entre les deux
 const top=56+70,fy=Math.max(HT,top+y+120);const off=top+Math.max(0,(fy-90-top-y)/2);
 let f=`<g transform="translate(${X0},${fy-36}) scale(.24)">${LOGO(fg,C.ja)}</g>`;
 if(src){let t=String(src);while(t.length>4&&mw(t,'mono',20)+t.length*0.5>W-200)t=t.slice(0,-2);if(t!==String(src))t=t.replace(/[ ,;·]+$/,'')+'…';f+=`<text x="${X0+W}" y="${fy}" text-anchor="end" font-family="PM" font-size="20" fill="${mut}">${X(t)}</text>`}
 else if(swipe)f+=`<text x="${X0+W}" y="${fy}" text-anchor="end" font-family="PJ" font-weight="700" font-size="26" fill="${mut}">${X(swipe)}</text>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1080 1920" width="1080" height="1920">${bg(dark,1920)}${head}<g transform="translate(0,${off.toFixed(1)})">${b}</g>${f}</svg>`}
function slideSVG(p,s,i,n,imgs,fmt){if(fmt==='tiktok'&&s.type!=='reel'){const nt=slideTK(p,s,i,n,imgs);if(nt)return nt;const v=slideSVG(p,s,i,n,imgs);const dk=/<rect width="1080" height="1350" fill="#0F1E1B"/.test(v);
  const body=v.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'').replace(/^<rect width="1080" height="1350"[^>]*\/>(<circle[^>]*\/>)?/,'');
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1080 1920" width="1080" height="1920">${bg(dk,1920)}${TKFADE}<g transform="translate(${TK.x},${TK.y}) scale(${TK.s})">${body}</g></svg>`}
 const rub=(p.rubrique||'').toLowerCase();const [acc,accD]=RUB[rub]||[C.ja,C.jd];
 const dark=s.theme?s.theme==='sombre':(s.type==='cover'||s.type==='cta'||s.type==='duel'||s.type==='reel')?(i%2===0):false;const fg=dark?C.iv:C.in,mut=dark?C.pm:C.mu,emc=dark?acc:accD;
 const H=s.type==='reel'?1920:1350;let o=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1080 ${H}" width="1080" height="${H}">${bg(dark,H)}`;
 const last=i===n-1,swipe=p.format==='carrousel'&&!last?'Glisse →':'';
 if(s.type==='cover'||s.type==='reel'){const big=s.type==='reel';const maxW=936;const wp=!big&&s.photo&&s.photo.src;const size=wp?fit(s.accroche,maxW,4,104,60):fit(s.accroche,maxW,big?6:5,big?132:118,64);const tb=textBlock(s.accroche,72,0,size,maxW,fg,emc);
  const plein=wp&&s.mise!=='carte';
  if(plein){/* couverture « photo plein cadre » (25/11) : la photo remplit tout, voile sombre, texte en bas */
   const pid='pl'+(++PHN);o=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1080 1350" width="1080" height="1350"><rect width="1080" height="1350" fill="#0A1412" data-bg="1"/><image data-plein="1" href="${X(s.photo.src)}" x="0" y="0" width="1080" height="1350" preserveAspectRatio="xMidYMid slice"/><defs><linearGradient id="${pid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0A1412" stop-opacity=".55"/><stop offset=".18" stop-color="#0A1412" stop-opacity="0"/><stop offset=".42" stop-color="#0A1412" stop-opacity=".05"/><stop offset=".68" stop-color="#0A1412" stop-opacity=".82"/><stop offset="1" stop-color="#0A1412" stop-opacity=".97"/></linearGradient></defs><rect width="1080" height="1350" fill="url(#${pid})"/>`;
   const ps=fit(s.accroche,maxW,3,112,64);const pb=textBlock(s.accroche,72,0,ps,maxW,C.iv,acc);const sb=s.sous?textBlock(s.sous,72,0,38,880,'#D5E2DE',acc,'m',1.3):null;
   const bottom=1190-(sb?sb.h+26:0);const py=bottom-pb.h+ps*.8;
   o+=chip((p.rubrique||'')+(p.format==='carrousel'?' · carrousel':''),true,acc);
   if(s.photo.credit)o+=`<text x="1008" y="1238" text-anchor="end" font-family="PM" font-size="16" fill="#EEF3F4" fill-opacity=".72">${X(String(s.photo.credit).slice(0,70))}</text>`;
   o+=`<g transform="translate(0,${py-ps*.8})">${pb.svg}</g>`;if(sb)o+=`<g transform="translate(0,${bottom+26})">${sb.svg}</g>`;
   o+=foot(true,'',swipe);return o+'</svg>'}
  const ty=big?560:wp?660+size*.8:300+size;if(wp)o+=photoCard(s.photo,72,150,936,440,dark);o+=chip((p.rubrique||'')+(p.format==='carrousel'?' · carrousel':big?' · vidéo':''),dark,acc);
  o+=`<g transform="translate(0,${ty})">${tb.svg}</g>`;
  if(s.sous)o+=textBlock(s.sous,72,ty+tb.h+30,40,800,mut,emc,'m',1.3).svg;
  if(wp){}
  else if(s.objet&&OBJ.includes(s.objet)){const oy=big?1250:Math.max(ty+tb.h+40,760);const oh=(big?1700:1200)-oy;if(oh>180)o+=img(s.objet,540,oy,460,oh,imgs)}
  if(big)o+=`<g transform="translate(72,1700)"><rect width="180" height="64" rx="32" fill="${acc}"/><text x="90" y="42" text-anchor="middle" font-family="PJ" font-weight="800" font-size="28" fill="${C.in}">▶ ${X(s.duree||'30 s')}</text></g>`+`<g transform="translate(72,1810) scale(.24)">${LOGO(fg,C.ja)}</g>`;
  else o+=foot(dark,'',swipe)}
 else if(s.type==='texte'){o+=chip(String(i).padStart(2,'0')+' / '+String(n-1).padStart(2,'0'),dark,acc);const t=textBlock(s.titre,72,300,fit(s.titre,936,3,84,54),936,fg,emc);o+=t.svg;
  const tx2=textBlock(s.texte,72,300+t.h+40,40,920,mut,emc,'m',1.38);o+=tx2.svg;if(s.photo){const py=300+t.h+40+tx2.h+20;o+=photoCard(s.photo,72,py,936,1160-py,dark)}else if(s.objet&&OBJ.includes(s.objet))o+=img(s.objet,640,880,360,300,imgs);o+=foot(dark,s.source||'',swipe)}
 else if(s.type==='chiffre'){o+=chip(String(i).padStart(2,'0')+' / '+String(n-1).padStart(2,'0'),dark,acc);const cs=fit(s.chiffre,936,1,250,110);
  o+=`<text x="72" y="${420+cs*.3}" font-family="PJ" font-weight="800" font-size="${cs}" letter-spacing="${-cs*.04}" fill="${dark?acc:accD}">${X(s.chiffre)}</text>`;
  o+=textBlock(s.label,72,560+cs*.3,fit(s.label,936,4,60,40,'b'),936,fg,emc).svg;o+=foot(dark,s.source||'',swipe)}
 else if(s.type==='duel'){o+=chip('Débat · '+(p.rubrique||''),dark,C.am);
  const card=(y,d,col)=>{const cs=fit(d.chiffre,800,1,150,84);return `<rect x="72" y="${y}" width="936" height="300" rx="36" fill="${dark?'rgba(238,243,244,.06)':'#fff'}" stroke="${dark?C.pl:C.ln}" stroke-width="2"/><text x="120" y="${y+36+cs*.78}" font-family="PJ" font-weight="800" font-size="${cs}" letter-spacing="${-cs*.04}" fill="${col}">${X(d.chiffre)}</text>`+(()=>{const ls=fit(d.label||'',840,2,34,26,'m');const L=layout(d.label||'',ls,840,'m').length;return textBlock(d.label,120,y+300-36-(L-1)*ls*1.2,ls,840,mut,emc,'m',1.2).svg})()};
  o+=card(190,s.a||{},dark?C.ja:C.jd)+`<text x="540" y="555" text-anchor="middle" font-family="IS" font-style="italic" font-size="64" fill="${mut}">contre</text>`+card(600,s.b||{},C.sig);
  o+=textBlock(s.question,72,1010,fit(s.question,936,2,64,44),936,fg,emc).svg;o+=foot(dark,s.source||'','')}
 else if(s.type==='recap'){o+=chip('Récap · la semaine',dark,acc);o+=textBlock(s.titre||'La semaine en *3 chiffres*.',72,250,84,936,fg,emc).svg;
  (s.items||[]).slice(0,3).forEach((it,k)=>{const y=420+k*260;const cs=fit(it.chiffre,420,1,120,70);o+=`<rect x="72" y="${y}" width="936" height="220" rx="32" fill="${dark?'rgba(238,243,244,.06)':'#fff'}" stroke="${dark?C.pl:C.ln}" stroke-width="2"/><text x="112" y="${y+80+cs*.4}" font-family="PJ" font-weight="800" font-size="${cs}" letter-spacing="${-cs*.04}" fill="${/^[−-]/.test(String(it.chiffre||''))?(dark?C.sig:'#C8362A'):(s.ton==='bourse'?(dark?C.ja:C.jd):(k===1?(dark?C.am:C.ad):(dark?C.ja:C.jd)))}">${X(it.chiffre)}</text>`+textBlock(it.label,560,y+90,32,410,fg,emc,'m',1.25).svg});
  o+=foot(dark,s.source||'','')}
 else if(s.type==='cta'){o+=chip('Olto',dark,acc);o+=textBlock(s.titre||'Suis *@olto.media* pour la suite.',72,420,fit(s.titre||'Suis *@olto.media* pour la suite.',936,4,104,64),936,fg,emc).svg;
  o+=textBlock(s.texte||'La lettre du dimanche : la semaine en 3 chiffres, lien en bio.',72,860,40,900,mut,emc,'m',1.35).svg;o+=img(s.objet||'coins',600,940,380,260,imgs);o+=foot(dark,'','')}
 return o+'</svg>'}
// ---- export ----
let FONTCSS=null,IMGS=null;const b64=buf=>{let s='';const a=new Uint8Array(buf);for(let i=0;i<a.length;i+=0x8000)s+=String.fromCharCode.apply(null,a.subarray(i,i+0x8000));return btoa(s)};
async function fontCSS(){if(FONTCSS)return FONTCSS;const list=[['PJ','pj-500','500','normal'],['PJ','pj-700','700','normal'],['PJ','pj-800','800','normal'],['IS','is-italic','400','italic'],['PM','plex-mono','400','normal']];let css='';
 for(const [f,n,w,st] of list){const r=await fetch('fonts/'+n+'.woff2');css+=`@font-face{font-family:${f};src:url(data:font/woff2;base64,${b64(await r.arrayBuffer())}) format("woff2");font-weight:${w};font-style:${st}}`}return FONTCSS=css}
async function images(){if(IMGS)return IMGS;IMGS={};for(const n of OBJ){try{const r=await fetch('img/obj-'+n+'.png');IMGS[n]='data:image/png;base64,'+b64(await r.arrayBuffer())}catch(e){}}return IMGS}
async function toPNG(svg){const css=await fontCSS();const s=svg.replace('>',`><style>${css}</style>`);const blob=new Blob([s],{type:'image/svg+xml'});const url=URL.createObjectURL(blob);
 const im=new Image();await new Promise((ok,ko)=>{im.onload=ok;im.onerror=ko;im.src=url});await new Promise(r=>setTimeout(r,60));const c=document.createElement('canvas');c.width=im.width||1080;c.height=im.height||1350;c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(url);
 return await new Promise(r=>c.toBlob(r,'image/png'))}
// zip STORE minimal
const CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(a){let c=0xFFFFFFFF;for(let i=0;i<a.length;i++)c=CRC[(c^a[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
async function zip(files){const enc=new TextEncoder();const parts=[],cen=[];let off=0;for(const f of files){const d=new Uint8Array(await f.blob.arrayBuffer());const nm=enc.encode(f.name);const crc=crc32(d);
 const h=new DataView(new ArrayBuffer(30));h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint32(14,crc,true);h.setUint32(18,d.length,true);h.setUint32(22,d.length,true);h.setUint16(26,nm.length,true);parts.push(h.buffer,nm,d);
 const c=new DataView(new ArrayBuffer(46));c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint32(16,crc,true);c.setUint32(20,d.length,true);c.setUint32(24,d.length,true);c.setUint16(28,nm.length,true);c.setUint32(42,off,true);cen.push(c.buffer,nm);off+=30+nm.length+d.length}
 const cs=cen.reduce((s,b)=>s+(b.byteLength||b.length),0);const e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cs,true);e.setUint32(16,off,true);
 return new Blob([...parts,...cen,e.buffer],{type:'application/zip'})}
async function ready(){try{await Promise.all(['800 40px PJ','500 40px PJ','italic 400 40px IS','400 20px PM'].map(f=>document.fonts.load(f)))}catch(e){}}

// story Bourse 1080x1920 : top 5 hausses + top 5 baisses (CAC 40 + S&P 500)
function storySVG(st){st=st||{};const H=1920;let o=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 ${H}" width="1080" height="${H}">${bg(true,H)}`;
 o+=chip('Le récap Bourse',true,C.ja,72,250);
 o+=textBlock('Top 5 *du jour*',72,420,92,936,C.iv,C.ja).svg;
 // indices
 const ix=(st.indices||[]).slice(0,3);const iw=936/Math.max(1,ix.length);
 ix.forEach((x,k)=>{const neg=/^[-−]/.test(String(x.var||'').trim());const cx=72+k*iw;
  o+=`<rect x="${cx}" y="496" width="${iw-16}" height="100" rx="22" fill="rgba(238,243,244,.06)" stroke="${C.pl}" stroke-width="2"/>`;
  o+=`<text x="${cx+28}" y="536" font-family="PM" font-size="22" letter-spacing="2" fill="${C.pm}">${X(String(x.nom||'').toUpperCase())}</text>`;
  o+=`<text x="${cx+28}" y="578" font-family="PJ" font-weight="800" font-size="40" fill="${neg?C.sig:C.ja}">${X(x.var||'')}</text>`});
 const block=(title,arr,y,up)=>{const col=up?C.ja:C.sig;let b=`<text x="72" y="${y}" font-family="PJ" font-weight="800" font-size="40" fill="${col}">${up?'▲':'▼'} ${X(title)}</text>`;
  (arr||[]).slice(0,5).forEach((r,k)=>{const yy=y+26+k*90;
   b+=`<line x1="72" y1="${yy}" x2="1008" y2="${yy}" stroke="${C.pl}" stroke-width="2"/>`;
   b+=`<text x="72" y="${yy+42}" font-family="PJ" font-weight="800" font-size="34" fill="${C.iv}">${X(String(r.nom||'').slice(0,26))}</text>`;
   const tag=String(r.indice||'').toUpperCase();const tw=mw(tag,'mono',18)+tag.length*1.5+28;const nx=72+Math.min(560,mw(String(r.nom||'').slice(0,26),'b',34))+18;
   b+=`<g transform="translate(${nx},${yy+14})"><rect width="${tw}" height="36" rx="18" fill="rgba(238,243,244,.08)" stroke="${C.pl}" stroke-width="1.5"/><text x="14" y="25" font-family="PM" font-size="18" letter-spacing="1.5" fill="${C.pm}">${X(tag)}</text></g>`;
   if(r.raison)b+=`<text x="72" y="${yy+74}" font-family="PJ" font-weight="500" font-size="24" fill="${C.pm}">${X(String(r.raison).slice(0,58))}</text>`;
   b+=`<text x="1008" y="${yy+60}" text-anchor="end" font-family="PJ" font-weight="800" font-size="50" letter-spacing="-1.5" fill="${col}">${X(r.var||'')}</text>`});
  return b};
 o+=block('En hausse',st.hausses,672,true);
 o+=block('En baisse',st.baisses,1196,false);
 o+=`<g transform="translate(72,1702) scale(.24)">${LOGO(C.iv,C.ja)}</g>`;
 o+=`<text x="1008" y="1710" text-anchor="end" font-family="PM" font-size="19" fill="${C.pm}">${X(String(st.source||'').slice(0,64))}</text>`;
 o+=`<text x="1008" y="1738" text-anchor="end" font-family="PM" font-size="19" fill="${C.pm}">Pas un conseil en investissement.</text>`;
 return o+'</svg>'}

// story « La une du soir » 1080x1920 (décision du 24/11) : la photo de la valeur n°1 du jour (ou de son dirigeant), avant le Top 5.
// st.une = {photo:{src,credit}, titre?, sens?:'hausse'|'baisse'} ; nom/var/raison pris dans hausses[0] (ou baisses[0]).
function uneSVG(st,fmt){st=st||{};const u=st.une||{};const H=1920;const down=u.sens==='baisse';const r=((down?st.baisses:st.hausses)||[])[0]||{};const col=down?C.sig:C.ja;
 const tk=fmt&&String(fmt).startsWith('tiktok');const ph=u.photo||{};
 /* 26/11 : « la une » en photo plein cadre (comme la couverture Nvidia) */
 if(tk){if(typeof window!=="undefined"&&ph.src)window.__PLEIN={src:ph.src};
  const W=760;let o=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1080 1920" width="1080" height="1920">${bg(true,1920)}`;let y=0;
  o+=chip('Le récap Bourse · '+(st.jour||''),true,col,0,0);y=110;
  if(u.titre){const ts=fit(u.titre,W,3,104,64);const tb=textBlock(u.titre,0,y+ts*.8,ts,W,C.iv,col);o+=tb.svg;y+=tb.h+50}
  const nm=String(r.nom||'');o+=`<text x="0" y="${y+60}" font-family="PJ" font-weight="800" font-size="${fit(nm,420,1,64,40)}" fill="${C.iv}">${X(nm)}</text><text x="${W}" y="${y+80}" text-anchor="end" font-family="PJ" font-weight="800" font-size="112" letter-spacing="-4" fill="${col}">${X(r.var||'')}</text>`;y+=120;
  if(r.raison){o+=`<text x="0" y="${y+20}" font-family="PJ" font-weight="500" font-size="36" fill="#D5E2DE">${X(String(r.raison).slice(0,48))}</text>`;y+=50}
  o+=`<text x="0" y="${y+60}" font-family="PJ" font-weight="700" font-size="40" fill="${C.iv}">Le Top 5 complet, glisse <tspan fill="${col}">→</tspan></text>`;y+=100;
  if(ph.credit)o+=`<text x="0" y="${y+10}" font-family="PM" font-size="20" fill="#D5E2DE">${X(String(ph.credit).slice(0,70))}</text>`;
  return o+'</svg>'}
 const pid='un'+(++PHN);
 let o=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1080 ${H}" width="1080" height="${H}"><rect width="1080" height="${H}" fill="#0A1412" data-bg="1"/>`;
 if(ph.src)o+=`<image data-plein="1" href="${X(ph.src)}" x="0" y="0" width="1080" height="${H}" preserveAspectRatio="xMidYMid slice"/>`;
 o+=`<defs><linearGradient id="${pid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0A1412" stop-opacity=".6"/><stop offset=".18" stop-color="#0A1412" stop-opacity=".1"/><stop offset=".4" stop-color="#0A1412" stop-opacity=".15"/><stop offset=".62" stop-color="#0A1412" stop-opacity=".85"/><stop offset="1" stop-color="#0A1412" stop-opacity=".98"/></linearGradient></defs><rect width="1080" height="${H}" fill="url(#${pid})"/>`;
 o+=chip('Le récap Bourse · '+(st.jour||''),true,col,72,250);
 const nm=String(r.nom||'');const ns=fit(nm,560,1,64,40);
 let y=1560;/* on empile depuis le bas */
 const cta=`<text x="72" y="1640" font-family="PJ" font-weight="700" font-size="40" fill="${C.iv}">Le Top 5 complet, juste après <tspan fill="${col}">→</tspan></text>`;
 let blk='';if(r.raison){blk=`<text x="72" y="1560" font-family="PJ" font-weight="500" font-size="34" fill="#D5E2DE">${X(String(r.raison).slice(0,48))}</text>`;y=1500}
 blk+=`<text x="72" y="${y}" font-family="PJ" font-weight="800" font-size="${ns}" fill="${C.iv}">${X(nm)}</text><text x="1008" y="${y+12}" text-anchor="end" font-family="PJ" font-weight="800" font-size="130" letter-spacing="-4" fill="${col}">${X(r.var||'')}</text>`;y-=150;
 if(u.titre){const ts=fit(u.titre,936,3,104,64);const tb=textBlock(u.titre,72,0,ts,936,C.iv,col);o+=`<g transform="translate(0,${y-tb.h+ts*.8})">${tb.svg}</g>`}
 o+=blk+cta;
 o+=`<g transform="translate(72,1702) scale(.24)">${LOGO(C.iv,C.ja)}</g>`;
 o+=`<text x="1008" y="1700" text-anchor="end" font-family="PM" font-size="17" fill="#D5E2DE">${X(String(ph.credit||'').slice(0,70))}</text>`;
 o+=`<text x="1008" y="1724" text-anchor="end" font-family="PM" font-size="19" fill="${C.pm}">${X(String(st.source||'').slice(0,64))}</text>`;
 o+=`<text x="1008" y="1748" text-anchor="end" font-family="PM" font-size="19" fill="${C.pm}">Pas un conseil en investissement.</text>`;
 return o+'</svg>'}

// story « Le mot du jour » 1080x1920 (fond ivoire, contraste avec le Top 5 sombre)
function motSVG(st,imgs,fmt){st=st||{};const m=st.mot||{};const H=1920;const tk=fmt==='tiktok';const dk=tk;const fg=tk?C.iv:C.in,mut=tk?C.pm:C.mu,emc=tk?C.ja:C.jd;const X0=tk?60:72,MW=tk?((typeof window!=='undefined'&&window.__TKW)||740):936,T0=tk?330:250,FY=tk?1570:1702;let o=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1080 ${H}" width="1080" height="${H}">${bg(dk,H)}`;
 o+=chip('Le mot du jour',false,C.ja,X0,T0);const head=o;o='';
 const terme=String(m.terme||'');const ts=fit(terme,MW,3,tk?128:132,64,'s');const tb=textBlock('*'+terme+'*',X0,T0+130+ts*.9,ts,MW,fg,emc,'b',1.0);o+=tb.svg;
 let y=T0+130+ts*.9+(tb.lines-1)*ts+60;
 if(m.phon)o+=`<text x="${X0}" y="${y}" font-family="PM" font-size="26" fill="${mut}">${X(m.phon)}</text>`,y+=50;
 o+=`<rect x="${X0}" y="${y}" width="120" height="6" rx="3" fill="${C.ja}"/>`;y+=80;
 const d=textBlock(m.texte||'',X0,y,tk?48:46,MW,fg,emc,'m',1.36);o+=d.svg;y+=d.h+50;
 if(m.cle){const kb=textBlock(m.cle,X0+48,y+118,tk?44:40,MW-96,fg,emc,'b',1.25);const bh=kb.h+104;
  o+=`<rect x="${X0}" y="${y}" width="${MW}" height="${bh}" rx="28" fill="${tk?'rgba(238,243,244,.06)':'#fff'}" stroke="${tk?C.pl:C.ln}" stroke-width="2"/><rect x="${X0}" y="${y}" width="10" height="${bh}" rx="5" fill="${C.ja}"/>`;
  o+=`<text x="${X0+48}" y="${y+56}" font-family="PM" font-size="22" letter-spacing="2" fill="${emc}">À RETENIR</text>`+kb.svg;y+=bh+40}
 if(m.lien){const lb=textBlock(m.lien,X0,y+40,tk?36:30,MW,mut,emc,'m',1.35);o+=lb.svg;y+=40+lb.h}
 o=head+`<g transform="translate(0,${Math.max(0,Math.round(((FY-70)-y)/2))})">${o}</g>`;
 o+=`<g transform="translate(${X0},${FY}) scale(.24)">${LOGO(fg,C.ja)}</g>`;
 o+=`<text x="${X0+MW}" y="${FY+36}" text-anchor="end" font-family="PM" font-size="19" fill="${mut}">Pas un conseil en investissement.</text>`;
 return o+'</svg>'}

// Top 5 pour TikTok (post photo 9:16) : 1 image hausses + 1 image baisses, tout dans la zone visible (x 60-890, y 310-1620)
function storyTK(st,side){st=st||{};const up=side!=='baisses';const H=1920;const col=up?C.ja:C.sig;const X0=60,R=905,W=R-X0;
 // zone visible TikTok photo (mesurée sur iPhone) : y 310-1620, boutons à droite sous y 900 (x > 930)
 let o=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 ${H}" width="1080" height="${H}">${bg(true,H)}${TKFADE}`;
 o+=chip('Le récap Bourse',true,C.ja,X0,325);
 o+=textBlock(up?'Top 5 *hausses*':'Top 5 *baisses*',X0,500,96,W,C.iv,col).svg;
 const ix=(st.indices||[]).slice(0,3);const iw=W/Math.max(1,ix.length);
 ix.forEach((x,k)=>{const neg=/^[-−]/.test(String(x.var||'').trim());const cx=X0+k*iw;
  o+=`<rect x="${cx}" y="545" width="${iw-14}" height="110" rx="24" fill="rgba(238,243,244,.06)" stroke="${C.pl}" stroke-width="2"/>`;
  o+=`<text x="${cx+26}" y="586" font-family="PM" font-size="22" letter-spacing="2" fill="${C.pm}">${X(String(x.nom||'').toUpperCase())}</text>`;
  o+=`<text x="${cx+26}" y="632" font-family="PJ" font-weight="800" font-size="40" fill="${neg?C.sig:C.ja}">${X(x.var||'')}</text>`});
 const Y0=690,STEP=166;
 (up?st.hausses:st.baisses||[]).slice(0,5).forEach((r,k)=>{const y=Y0+k*STEP;
  o+=`<line x1="${X0}" y1="${y}" x2="${R}" y2="${y}" stroke="${C.pl}" stroke-width="2"/>`;
  const vs=String(r.var||'');const vw=mw(vs,'b',62);const nmMax=W-vw-40;let nm=String(r.nom||'');let ns=46;while(ns>30&&mw(nm,'b',ns)>nmMax-10)ns-=2;while(nm.length>4&&mw(nm,'b',ns)>nmMax)nm=nm.slice(0,-2);
  o+=`<text x="${X0}" y="${y+66}" font-family="PJ" font-weight="800" font-size="${ns}" fill="${C.iv}">${X(nm)}</text>`;
  const tag=String(r.indice||'').toUpperCase();const tw=mw(tag,'mono',20)+tag.length*1.5+30;
  o+=`<g transform="translate(${X0},${y+92})"><rect width="${tw}" height="38" rx="19" fill="rgba(238,243,244,.08)" stroke="${C.pl}" stroke-width="1.5"/><text x="15" y="27" font-family="PM" font-size="20" letter-spacing="1.5" fill="${C.pm}">${X(tag)}</text></g>`;
  if(r.raison){let rs=String(r.raison);const rmax=W-tw-24-vw-30;while(rs.length>4&&mw(rs,'m',27)>rmax)rs=rs.slice(0,-2);if(rs!==String(r.raison))rs=rs.replace(/[ ,;]+$/,'')+'…';o+=`<text x="${X0+tw+16}" y="${y+120}" font-family="PJ" font-weight="500" font-size="27" fill="${C.pm}">${X(rs)}</text>`}
  o+=`<text x="${R}" y="${y+98}" text-anchor="end" font-family="PJ" font-weight="800" font-size="62" letter-spacing="-1.5" fill="${col}">${X(vs)}</text>`});
 const FL=Y0+5*STEP;
 o+=`<line x1="${X0}" y1="${FL}" x2="${R}" y2="${FL}" stroke="${C.pl}" stroke-width="2"/>`;
 o+=`<g transform="translate(${X0},${FL+42}) scale(.26)">${LOGO(C.iv,C.ja)}</g>`;
 o+=`<text x="${R}" y="${FL+48}" text-anchor="end" font-family="PM" font-size="20" fill="${C.pm}">${X(String(st.source||'').slice(0,52))}</text>`;
 o+=`<text x="${R}" y="${FL+78}" text-anchor="end" font-family="PM" font-size="20" fill="${C.pm}">Pas un conseil en investissement.</text>`;
 return o+'</svg>'}

// Story « L'actu argent » : une info du jour qui touche le porte-monnaie (Instagram 1080x1920 ; TikTok : même image, zone visible respectée)
// a = {titre, chiffre?, label?, texte, impact, source}
function actuSVG(a,fmt){a=a||{};const tk=fmt==='tiktok';
 /* 26/11 : TikTok = même mise en page que « la une » du Top 5 (bloc compact, texte large, sans carte ni pied de page) */
 if(tk){const W=760;let o=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1080 1920" width="1080" height="1920">${bg(true,1920)}`;let y=0;
  o+=chip("L'actu argent",true,C.sig,0,0);y=110;
  if(a.titre){const ts=fit(a.titre,W,3,104,64);const tb=textBlock(a.titre,0,y+ts*.8,ts,W,C.iv,C.ja);o+=tb.svg;y+=tb.h+50}
  if(a.chiffre){const cs=fit(a.chiffre,W,1,120,72);y+=cs*.78;o+=`<text x="0" y="${y}" font-family="PJ" font-weight="800" font-size="${cs}" letter-spacing="${-cs*.04}" fill="${C.ja}">${X(a.chiffre)}</text>`;y+=24;
   if(a.label){const lb=textBlock(a.label,0,y+34,34,W,'#D5E2DE',C.ja,'m',1.3);o+=lb.svg;y+=lb.h+20}}
  if(a.texte){const d=textBlock(a.texte,0,y+50,34,W,'#D5E2DE',C.ja,'m',1.36);o+=d.svg;y+=d.h+40}
  if(a.impact){o+=`<rect x="0" y="${y+14}" width="8" height="10" fill="none"/><text x="0" y="${y+40}" font-family="PM" font-size="22" letter-spacing="2" fill="${C.ja}">CE QUE ÇA CHANGE POUR TOI</text>`;const kb=textBlock(a.impact,0,y+40+56,40,W,C.iv,C.ja,'b',1.2);o+=kb.svg;y+=40+kb.h+40}
  o+=`<text x="0" y="${y+30}" font-family="PM" font-size="20" fill="#D5E2DE">${X(String(a.source||'').slice(0,60))} · Contenu pédagogique, pas un conseil.</text>`;
  return o+'</svg>'}const X0=tk?60:72,MW=tk?((typeof window!=='undefined'&&window.__TKW)||740):936,T0=tk?330:250,FY=tk?1570:1702;const H=1920;
 let o=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 ${H}" width="1080" height="${H}">${bg(true,H)}${tk?TKFADE:''}`;
 o+=chip("L'actu argent",true,C.sig,X0,T0);const head=o;o='';
 const ts=fit(a.titre||'',MW,4,tk?84:92,56);const tb=textBlock(a.titre||'',X0,T0+130+ts*.85,ts,MW,C.iv,C.ja);o+=tb.svg;let y=T0+130+ts*.85+(tb.lines-1)*ts*1.04+80;
 if(a.chiffre){const cs=fit(a.chiffre,MW,1,tk?190:210,100);y+=cs*.8;o+=`<text x="${X0}" y="${y}" font-family="PJ" font-weight="800" font-size="${cs}" letter-spacing="${-cs*.04}" fill="${C.ja}">${X(a.chiffre)}</text>`;y+=40;
  if(a.label){const lb=textBlock(a.label,X0,y+30,tk?32:36,MW,C.pm,C.ja,'m',1.3);o+=lb.svg;y+=lb.h+30}}
 if(a.texte){const d=textBlock(a.texte,X0,y+50,tk?36:40,MW,C.iv,C.ja,'m',1.36);o+=d.svg;y+=d.h+50}
 if(a.impact){/* 26/11 : plus de carte, même style que TikTok et la une */o+=`<text x="${X0}" y="${y+70}" font-family="PM" font-size="24" letter-spacing="2" fill="${C.ja}">CE QUE ÇA CHANGE POUR TOI</text>`;const kb=textBlock(a.impact,X0,y+70+62,44,MW,C.iv,C.ja,'b',1.2);o+=kb.svg;y+=70+kb.h+30}
 {const av=(FY-100)-T0,hh=y-T0;/* trop haut : on réduit le bloc au lieu de déborder sur le pied de page (25/11) */
 o=head+(hh>av?`<g transform="translate(${X0},${T0}) scale(${(av/hh).toFixed(4)}) translate(${-X0},${-T0})">${o}</g>`:`<g transform="translate(0,${Math.max(0,Math.round(((FY-70)-y)/2))})">${o}</g>`);}
 o+=`<g transform="translate(${X0},${FY}) scale(.24)">${LOGO(C.iv,C.ja)}</g>`;
 o+=`<text x="${X0+MW}" y="${FY+8}" text-anchor="end" font-family="PM" font-size="19" fill="${C.pm}">${X(String(a.source||'').slice(0,52))}</text>`;
 o+=`<text x="${X0+MW}" y="${FY+36}" text-anchor="end" font-family="PM" font-size="19" fill="${C.pm}">Contenu pédagogique, pas un conseil.</text>`;
 return o+'</svg>'}
window.OltoStudio={TK,TKBOX,fitTK,tallTK,slideSVG,storySVG,storyTK,uneSVG,actuSVG,motSVG,toPNG,zip,images,ready,OBJ,C};
})();
