"""Construit la banque de photos d'Olto (img/banque/) à partir de img/banque/demande.json.
Sources : uniquement des fichiers Wikimedia Commons sous licence libre (CC0, CC BY, CC BY-SA, domaine public).
Lancé par GitHub Actions (.github/workflows/build-bank.yml). Ne réécrit jamais une entrée existante."""
import json, re, os, io, time, html, urllib.parse, urllib.request
from PIL import Image
UA = {'User-Agent': 'OltoMediaBank/1.0 (contact.olto.media@gmail.com)'}
OK_LIC = re.compile(r'^(CC0|CC[ -]BY(-SA)?( \d\.\d)?|Public domain|PD.*)', re.I)
BAD = re.compile(r'logo|icon|map|flag|signature|chart|graph|diagram|\.svg$|\.png$|\.gif$|\.tif', re.I)
BUILD = re.compile(r'si[eè]ge|headquarter|\bhq\b|building|tour |tower|immeuble|bureaux|office|campus|paris|la d[ée]fense', re.I)
def get(url):
    for k in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r: return r.read()
        except Exception as e: err = e; time.sleep(5 + 10 * k)
    raise err
def api(host, **p):
    p.update(format='json', formatversion='2')
    return json.loads(get(f'https://{host}/w/api.php?' + urllib.parse.urlencode(p)))
def info(title):
    d = api('commons.wikimedia.org', action='query', titles=title, prop='imageinfo', iiprop='url|extmetadata|size|mime', iiurlwidth='1600')
    pg = d['query']['pages'][0]
    if pg.get('missing') or not pg.get('imageinfo'): return None
    ii = pg['imageinfo'][0]; m = ii.get('extmetadata', {})
    v = lambda k: html.unescape(re.sub('<[^>]+>', '', (m.get(k) or {}).get('value', ''))).strip()
    lic = v('LicenseShortName')
    if not OK_LIC.match(lic) or 'fair' in lic.lower() or v('NonFree'): return None
    if ii.get('mime') not in ('image/jpeg',): return None
    if ii.get('width', 0) < 700: return None
    artist = re.sub(r'\s+', ' ', v('Artist'))[:60] or 'auteur inconnu'
    return {'url': ii.get('thumburl') or ii['url'], 'licence': lic, 'auteur': artist, 'desc': v('ImageDescription')[:300],
            'source_url': 'https://commons.wikimedia.org/wiki/' + urllib.parse.quote(title.replace(' ', '_'))}
def candidates(e):
    host = (e.get('lang') or 'en') + '.wikipedia.org'
    if e.get('commons'):  # recherche directe dans Commons
        d = api('commons.wikimedia.org', action='query', list='search', srsearch=e['commons'] + ' filetype:bitmap', srnamespace='6', srlimit='15')
        return [s['title'] for s in d['query']['search']]
    out = []
    d = api(host, action='query', titles=e['wiki'], prop='pageimages', piprop='name', redirects='1')
    pg = d['query']['pages'][0]
    if pg.get('pageimage'): out.append('File:' + pg['pageimage'])
    if e['type'] != 'personne':
        d = api(host, action='query', titles=e['wiki'], prop='images', imlimit='60', redirects='1')
        out += [i['title'] for i in d['query']['pages'][0].get('images', [])]
    d = api('commons.wikimedia.org', action='query', list='search', srsearch=e['nom'] + (' ' + e['entreprise'] if e['type'] != 'personne' else '') + ' filetype:bitmap', srnamespace='6', srlimit='15')
    out += [x['title'] for x in d['query']['search']]
    seen = []; [seen.append(t) for t in out if t not in seen]
    return seen
def main():
    root = 'img/banque'; os.makedirs(root, exist_ok=True)
    dem = json.load(open(f'{root}/demande.json'))
    ip = f'{root}/index.json'; idx = json.load(open(ip)) if os.path.exists(ip) else []
    have = {x['slug'] for x in idx}; miss = []
    for e in dem:
        if e['slug'] in have: continue
        got = None
        try:
            for t in candidates(e)[:40]:
                name = t.split(':', 1)[-1]
                if BAD.search(name): continue
                if e.get('pays') == 'FR' and e['type'] != 'personne' and BUILD.search(name): continue
                i = info('File:' + name)
                if not i: continue
                if e.get('pays') == 'FR' and e['type'] != 'personne' and BUILD.search(i['desc']): continue
                got = i; break
        except Exception as ex: print('ERREUR', e['slug'], ex)
        if not got: miss.append(e['slug']); print('MANQUE', e['slug']); continue
        im = Image.open(io.BytesIO(get(got['url']))).convert('RGB'); im.thumbnail((1600, 1600))
        im.save(f"{root}/{e['slug']}.jpg", 'JPEG', quality=88)
        idx.append({'slug': e['slug'], 'nom': e['nom'], 'type': e['type'], 'entreprise': e.get('entreprise', ''), 'indice': e.get('indice', ''),
                    'credit': f"Photo : {got['auteur']}, {got['licence']} via Wikimedia Commons", 'licence': got['licence'], 'auteur': got['auteur'],
                    'source_url': got['source_url'], 'description': got['desc'][:200], 'mots_cles': e.get('mots_cles', []), 'a_verifier': e.get('pays') == 'FR' and e['type'] != 'personne'})
        print('OK', e['slug'], got['licence']); time.sleep(1.5)
    json.dump(idx, open(ip, 'w'), ensure_ascii=False, indent=1)
    json.dump(miss, open(f'{root}/manquants.json', 'w'), ensure_ascii=False, indent=1)
    print(f'TOTAL {len(idx)} images, {len(miss)} manquantes')
main()
