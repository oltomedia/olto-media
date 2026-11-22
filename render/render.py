#!/usr/bin/env python3
"""Rendu des visuels Olto (charte du QG) en PNG/JPG 1080 px.
Usage :
  python3 render.py story <livrable.json> <dossier_sortie>   -> top5.jpg, mot.jpg (si mot)
  python3 render.py post  <post.json>     <dossier_sortie>   -> 01.jpg, 02.jpg, ... (1080x1350)
  python3 render.py reel  <post.json> <voix.mp3|-> <sortie.mp4>  -> Reel 1080x1920 30 fps, voix AAC
Le JSON est le document du QG (livrable avec champ story, ou post avec slides)."""
import asyncio, json, os, sys, pathlib
from playwright.async_api import async_playwright
HERE = pathlib.Path(__file__).resolve().parent
def chrome():
    for p in ['/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser']:
        if os.path.exists(p): return p
    return None
async def reel(src, voice, out):
    import base64, subprocess, shutil
    data = json.load(open(src))
    tmp = pathlib.Path(out).with_suffix('.silent.mp4')
    async with async_playwright() as pw:
        kw = {'args':['--allow-file-access-from-files','--autoplay-policy=no-user-gesture-required']}
        if chrome(): kw['executable_path'] = chrome()
        b = await pw.chromium.launch(**kw)
        pg = await b.new_page(viewport={'width':1080,'height':1920})
        await pg.goto((HERE/'reel_page.html').as_uri()); await pg.wait_for_function('window.READY===1', timeout=60000)
        vurl = pathlib.Path(voice).resolve().as_uri() if voice and voice != '-' else None
        T = await pg.evaluate('([p,v,a])=>setup(p,v,a)', [data, vurl, 'voix' not in data])
        n = int(T*30)
        ff = subprocess.Popen(['ffmpeg','-v','error','-y','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-','-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p',str(tmp)], stdin=subprocess.PIPE)
        for i in range(n):
            d = await pg.evaluate(f"(draw({i}/30),document.getElementById('c').toDataURL('image/jpeg',.92))")
            ff.stdin.write(base64.b64decode(d.split(',')[1]))
        ff.stdin.close(); ff.wait(); await b.close()
    if vurl:
        subprocess.run(['ffmpeg','-v','error','-y','-i',str(tmp),'-i',voice,'-map','0:v','-map','1:a','-c:v','copy','-c:a','aac','-b:a','192k','-af','loudnorm=I=-14:TP=-1.5:LRA=11,apad','-shortest','-movflags','+faststart',out], check=True)
        os.remove(tmp)
    else:
        shutil.move(str(tmp), out)
    print(out)
async def main(kind, src, out):
    data = json.load(open(src))
    os.makedirs(out, exist_ok=True)
    async with async_playwright() as pw:
        kw = {'args':['--allow-file-access-from-files']}
        if chrome(): kw['executable_path'] = chrome()
        b = await pw.chromium.launch(**kw)
        pg = await b.new_page(viewport={'width':1080,'height':1920})
        await pg.goto((HERE/'page.html').as_uri()); await pg.wait_for_function('window.READY===1', timeout=60000)
        jobs = []
        if kind == 'story':
            st = data.get('story', data)
            jobs.append(('top5', st, 0, 'top5.jpg'))
            if (st.get('mot') or {}).get('terme'): jobs.append(('mot', st, 0, 'mot.jpg'))
        else:
            for i in range(len(data.get('slides', []))): jobs.append(('slide', data, i, f'{i+1:02d}.jpg'))
        for k, d, i, name in jobs:
            await pg.evaluate('([k,d,i])=>show(k,d,i)', [k, d, i]); await pg.wait_for_timeout(250)
            await pg.locator('#out svg').screenshot(path=os.path.join(out, name), type='jpeg', quality=94)
            print(os.path.join(out, name))
        await b.close()
if __name__ == '__main__':
    if sys.argv[1] == 'reel': asyncio.run(reel(sys.argv[2], sys.argv[3], sys.argv[4]))
    else: asyncio.run(main(sys.argv[1], sys.argv[2], sys.argv[3]))
