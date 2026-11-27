#!/usr/bin/env python3
"""Rendu des visuels Olto (charte du QG) en PNG/JPG 1080 px.
Usage :
  python3 render.py story <livrable.json> <dossier_sortie>   -> top5.jpg, mot.jpg (si mot) + tiktok/01-03.jpg (hausses, baisses, mot)
  python3 render.py actu  <livrable.json>   <dossier_sortie>   -> actu.jpg + tiktok/actu.jpg (story L'actu argent)
  python3 render.py post  <post.json>     <dossier_sortie>   -> 01.jpg... (1080x1350) + tiktok/01.jpg... (1080x1920 natif) + controle.txt (marges)
  python3 render.py reel  <post.json> <voix.mp3|-> <sortie.mp4>  -> Reel 1080x1920 30 fps, voix AAC
Le JSON est le document du QG (livrable avec champ story, ou post avec slides)."""
import asyncio, json, os, sys, pathlib
from playwright.async_api import async_playwright
HERE = pathlib.Path(__file__).resolve().parent
def chrome():
    for p in ['/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser']:
        if os.path.exists(p): return p
    return None

def inline_photos(data):
    """Remplace slide.photo.src (chemin du dépôt, ex. img/presse/x.jpg) par une image intégrée (data URI)."""
    import base64
    items = [sl.get('photo') if isinstance(sl, dict) else None for sl in (data.get('slides') or [])]
    items += [sc for sc in ((data.get('reel') or {}).get('scenes') or []) if isinstance(sc, dict) and sc.get('src')]
    st = data.get('story') if isinstance(data.get('story'), dict) else data
    items += [((st.get('une') or {}).get('photo'))] if isinstance(st, dict) else []
    items += [((data.get('actu') or {}).get('photo'))] if isinstance(data.get('actu'), dict) else []
    for ph in items:
        if not ph or not ph.get('src') or str(ph['src']).startswith(('data:', 'http')): continue
        p = (HERE.parent / ph['src']).resolve()
        if HERE.parent.resolve() not in p.parents or not p.exists(): raise SystemExit(f"Image introuvable : {ph['src']}")
        ph['src'] = 'data:image/jpeg;base64,' + base64.b64encode(p.read_bytes()).decode()
    return data
async def reel(src, voice, out):
    import base64, subprocess, shutil
    data = inline_photos(json.load(open(src)))
    tmp = pathlib.Path(out).with_suffix('.silent.mp4')
    async with async_playwright() as pw:
        kw = {'args':['--allow-file-access-from-files','--autoplay-policy=no-user-gesture-required']}
        if chrome(): kw['executable_path'] = chrome()
        b = await pw.chromium.launch(**kw)
        pg = await b.new_page(viewport={'width':1080,'height':1920})
        await pg.goto((HERE/'reel_page.html').as_uri()); await pg.wait_for_function('window.READY===1', timeout=60000)
        vurl = pathlib.Path(voice).resolve().as_uri() if voice and voice != '-' else None
        T = await pg.evaluate('([p,v,a])=>setup(p,v,a)', [data, vurl, 'voix' not in data])
        CUES = await pg.evaluate('OltoReel.cues(P)'); MUS = await pg.evaluate('OltoReel.music(P)')
        n = int(T*30)
        ff = subprocess.Popen(['ffmpeg','-v','error','-y','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-','-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p',str(tmp)], stdin=subprocess.PIPE)
        for i in range(n):
            d = await pg.evaluate(f"(draw({i}/30),document.getElementById('c').toDataURL('image/jpeg',.92))")
            ff.stdin.write(base64.b64decode(d.split(',')[1]))
        ff.stdin.close(); ff.wait(); await b.close()
    # MIXAGE : voix (devant) + musique Olto (sous la voix, baissée quand on parle) + bruitages calés sur l'image
    AUD = HERE / 'audio'
    ins = ['-i', str(tmp)]; parts = []; mixin = []; k = 1
    if vurl:
        ins += ['-i', voice]; parts.append(f'[{k}:a]aresample=44100,aformat=channel_layouts=stereo,loudnorm=I=-16:TP=-1.5:LRA=11,apad=whole_dur={T:.2f},asplit=2[vox][key]'); mixin.append('[vox]'); k += 1
    if MUS and (AUD / 'music' / f'{MUS}.m4a').exists():
        ins += ['-stream_loop', '-1', '-i', str(AUD / 'music' / f'{MUS}.m4a')]
        fo = max(0, T - 1.5)
        chain = f'[{k}:a]aresample=44100,aformat=channel_layouts=stereo,atrim=0:{T:.2f},volume={0.22 if vurl else 0.5},afade=t=in:d=0.6,afade=t=out:st={fo:.2f}:d=1.5'
        if vurl: parts.append(chain + '[m0]'); parts.append('[m0][key]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=300[mus]')
        else: parts.append(chain + '[mus]')
        mixin.append('[mus]'); k += 1
    elif vurl:
        parts.append('[key]anullsink')
    for c in CUES:
        f = AUD / 'sfx' / f"{c['s']}.wav"
        if not f.exists() or c['t'] >= T: continue
        ins += ['-i', str(f)]; ms = int(c['t'] * 1000)
        parts.append(f"[{k}:a]aresample=44100,aformat=channel_layouts=stereo,volume={c.get('v', .5) * 0.6:.2f},adelay={ms}|{ms}[s{k}]"); mixin.append(f'[s{k}]'); k += 1
    if mixin:
        parts.append(''.join(mixin) + f'amix=inputs={len(mixin)}:normalize=0:duration=longest,atrim=0:{T:.2f},loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.95[a]')
        subprocess.run(['ffmpeg','-v','error','-y',*ins,'-filter_complex',';'.join(parts),'-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k','-t',f'{T:.2f}','-movflags','+faststart',out], check=True)
        os.remove(tmp)
    else:
        shutil.move(str(tmp), out)
    print(out)
async def main(kind, src, out):
    data = inline_photos(json.load(open(src)))
    os.makedirs(out, exist_ok=True)
    async with async_playwright() as pw:
        kw = {'args':['--allow-file-access-from-files']}
        if chrome(): kw['executable_path'] = chrome()
        b = await pw.chromium.launch(**kw)
        pg = await b.new_page(viewport={'width':1080,'height':1920})
        await pg.goto((HERE/'page.html').as_uri() + ('?fade=0' if os.environ.get('OLTO_TK_FADE','1')=='0' else '')); await pg.wait_for_function('window.READY===1', timeout=60000)
        jobs = []
        Z45 = {'x0':60,'x1':1020,'y0':50,'y1':1300}
        TKH = int(os.environ.get('OLTO_TK_H', '2340'))   # hauteur des images TikTok (plus haute que 1920 = remplit les écrans allongés)
        await pg.evaluate(f'window.TKH={TKH}')
        _d = (TKH - 1920) // 2
        ZTK = {'x0':30,'x1':910,'y0':350+_d,'y1':1570+_d}      # TikTok photo (mesuré sur iPhone) : barre de recherche, boutons, légende
        ZST = {'x0':60,'x1':1020,'y0':240,'y1':1760}     # story Instagram (barre de réponse sous l'image)
        if kind == 'actu':
            os.makedirs(os.path.join(out, 'tiktok'), exist_ok=True)
            a = data.get('actu', data)
            jobs.append(('actu', a, 0, None, 'actu.jpg', ZST))
            jobs.append(('actu', a, 0, 'tiktok', 'tiktok/actu.jpg', ZTK))
        elif kind == 'story':
            st = data.get('story', data)
            os.makedirs(os.path.join(out, 'tiktok'), exist_ok=True)
            # « La une » (photo de la valeur n°1) : 1re story Instagram (une.jpg) et 1re image TikTok (tiktok/00.jpg)
            if ((st.get('une') or {}).get('photo') or {}).get('src'):
                jobs.append(('une', st, 0, None, 'une.jpg', ZST))
                jobs.append(('une', st, 0, 'tiktok', 'tiktok/00.jpg', ZTK))
            jobs.append(('top5', st, 0, None, 'top5.jpg', ZST))
            if (st.get('mot') or {}).get('terme'): jobs.append(('mot', st, 0, None, 'mot.jpg', ZST))
            # TikTok : post photo en 3 images (hausses, baisses, mot du jour), dans la zone visible
            jobs.append(('top5', st, 0, 'tiktok-h', 'tiktok/01.jpg', ZTK))
            jobs.append(('top5', st, 0, 'tiktok-b', 'tiktok/02.jpg', ZTK))
            if (st.get('mot') or {}).get('terme'): jobs.append(('mot', st, 0, 'tiktok', 'tiktok/03.jpg', ZTK))
        else:
            os.makedirs(os.path.join(out, 'tiktok'), exist_ok=True)
            for i, sl in enumerate(data.get('slides', [])):
                if sl.get('type') == 'reel': jobs.append(('slide', data, i, None, f'{i+1:02d}.jpg', None)); continue
                jobs.append(('slide', data, i, None, f'{i+1:02d}.jpg', Z45))
                jobs.append(('slide', data, i, 'tiktok', f'tiktok/{i+1:02d}.jpg', ZTK))
        report = []
        for k, d, i, fmt, name, zone in jobs:
            await pg.evaluate('([k,d,i,f])=>show(k,d,i,f)', [k, d, i, fmt]); await pg.wait_for_timeout(250)
            await pg.locator('#out svg').screenshot(path=os.path.join(out, name), type='jpeg', quality=94)
            if name.startswith('tiktok/'):
                # API TikTok : 1920 px de haut maximum. On garde la forme d'un iPhone (1080x2340) en réduisant à 886x1920.
                from PIL import Image
                im = Image.open(os.path.join(out, name)).convert('RGB')
                if im.height > 1920: im.resize((round(im.width * 1920 / im.height), 1920), Image.LANCZOS).save(os.path.join(out, name), quality=93)
            if zone:
                for pb in await pg.evaluate('(z)=>check(z)', zone): report.append(f'{name} : {pb}')
            print(os.path.join(out, name))
        with open(os.path.join(out, 'controle.txt'), 'w') as f: f.write('\n'.join(report) or 'OK')
        print('CONTROLE ' + ('OK' if not report else f'{len(report)} problème(s) :\n' + '\n'.join(report)))
        await b.close()
if __name__ == '__main__':
    if sys.argv[1] == 'reel': asyncio.run(reel(sys.argv[2], sys.argv[3], sys.argv[4]))
    else: asyncio.run(main(sys.argv[1], sys.argv[2], sys.argv[3]))
