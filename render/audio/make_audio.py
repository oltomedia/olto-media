"""Banque sonore Olto : musiques et bruitages 100 % originaux, générés par synthèse (aucun droit d'auteur tiers).
Usage : python3 make_audio.py  -> écrit music/*.m4a et sfx/*.wav à côté de ce fichier."""
import numpy as np, subprocess, pathlib, wave

SR = 44100
HERE = pathlib.Path(__file__).parent
rng = np.random.default_rng(7)

def save_wav(path, x):
    x = np.clip(x, -1, 1)
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(2 if x.ndim == 2 else 1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype('<i2').tobytes())

def env(n, a=0.005, r=0.2, sus=None):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4))
    e *= np.exp(-t / r) if sus is None else 1
    return e

def lp(x, cutoff):
    # filtre passe-bas simple (1 pôle), cutoff en Hz (scalaire ou tableau)
    c = np.broadcast_to(np.asarray(cutoff, float), x.shape)
    a = np.exp(-2 * np.pi * c / SR)
    y = np.empty_like(x); s = 0.0
    for i in range(len(x)):
        s = (1 - a[i]) * x[i] + a[i] * s; y[i] = s
    return y

def note(f, n, kind='saw'):
    t = np.arange(n) / SR
    if kind == 'sine': return np.sin(2 * np.pi * f * t)
    if kind == 'tri': return 2 * np.abs(2 * ((f * t) % 1) - 1) - 1
    # saw adouci (somme d'harmoniques)
    return sum(np.sin(2 * np.pi * f * k * t) / k for k in range(1, 9)) * 0.6

def midi(m): return 440 * 2 ** ((m - 69) / 12)

# ---------------- bruitages ----------------
def sfx():
    out = {}
    n = int(SR * .45); t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    sweep = 300 + 5000 * np.sin(np.pi * t / t[-1]) ** 2
    out['whoosh'] = lp(noise, sweep) * np.sin(np.pi * t / t[-1]) ** 1.5 * .9
    n = int(SR * .3); t = np.arange(n) / SR
    out['swish'] = lp(rng.standard_normal(n), 800 + 7000 * t / t[-1]) * np.sin(np.pi * t / t[-1]) ** 2 * .6
    n = int(SR * .12); t = np.arange(n) / SR
    out['pop'] = np.sin(2 * np.pi * (900 - 500 * t / t[-1]) * t) * env(n, .002, .03) * .8
    n = int(SR * .05)
    out['tick'] = lp(rng.standard_normal(n), 4000) * env(n, .0005, .008) * .7
    n = int(SR * .9); t = np.arange(n) / SR
    out['ding'] = (np.sin(2 * np.pi * 1318.5 * t) + .5 * np.sin(2 * np.pi * 1975.5 * t) + .25 * np.sin(2 * np.pi * 2637 * t)) * env(n, .002, .25) * .5
    n = int(SR * .7); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * (110 * np.exp(-t * 6) + 45) * t) * env(n, .001, .18)
    out['impact'] = (body + lp(rng.standard_normal(n), 1500) * env(n, .001, .05) * .6) * .9
    n = int(SR * 1.4); t = np.arange(n) / SR
    out['riser'] = (lp(rng.standard_normal(n), 200 + 6000 * (t / t[-1]) ** 2) * (t / t[-1]) ** 2 + .3 * np.sin(2 * np.pi * (200 + 600 * (t / t[-1]) ** 2) * t) * (t / t[-1]) ** 2) * .6
    n = int(SR * .5); t = np.arange(n) / SR
    out['stamp'] = (np.sin(2 * np.pi * 70 * t) * env(n, .001, .12) + lp(rng.standard_normal(n), 2500) * env(n, .0005, .03)) * .9
    n = int(SR * .25); t = np.arange(n) / SR
    out['blip'] = np.sin(2 * np.pi * 1600 * t) * env(n, .001, .05) * .5
    for k, v in out.items():
        v = v / (np.abs(v).max() + 1e-9) * .9
        fade = np.minimum(1, (len(v) - np.arange(len(v))) / (SR * .01))
        save_wav(HERE / 'sfx' / f'{k}.wav', v * fade)

# ---------------- musiques ----------------
def kick(n):
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * (50 + 90 * np.exp(-t * 30)) * t) * np.exp(-t * 9)

def hat(n):
    return lp(rng.standard_normal(n), 9000) * np.exp(-np.arange(n) / SR * 60) * .25

def track(name, bpm, prog, scale_root, kick_on=True, hats=True, length=64, pad_kind='saw', bright=1800):
    N = int(SR * length); mix = np.zeros(N); beat = 60 / bpm; bar = beat * 4
    # nappe (accords), 1 accord par mesure
    pad = np.zeros(N)
    nb = int(length / bar) + 1
    for b in range(nb):
        s = int(b * bar * SR); e = min(N, int((b + 1) * bar * SR) + int(SR * .3))
        if s >= N: break
        ch = prog[b % len(prog)]; n = e - s
        seg = sum(note(midi(scale_root + iv), n, pad_kind) for iv in ch) / len(ch)
        a = np.minimum(1, np.arange(n) / (SR * .25)) * np.minimum(1, (n - np.arange(n)) / (SR * .3))
        pad[s:e] += seg * a
    pad = lp(pad, bright) * .35
    # basse (fondamentale, croches)
    bass = np.zeros(N)
    step = beat / 2
    for k in range(int(length / step)):
        s = int(k * step * SR); n = int(step * SR * .9)
        if s + n > N: break
        ch = prog[int(k * step / bar) % len(prog)]
        f = midi(scale_root + ch[0] - 12)
        bass[s:s + n] += note(f, n, 'tri') * env(n, .005, .25)
    bass = lp(bass, 400) * .35
    drums = np.zeros(N)
    if kick_on:
        for k in range(int(length / beat)):
            s = int(k * beat * SR); n = int(SR * .4)
            if s + n <= N: drums[s:s + n] += kick(n) * .7
    if hats:
        for k in range(int(length / (beat / 2))):
            if k % 2 == 1:
                s = int(k * beat / 2 * SR); n = int(SR * .08)
                if s + n <= N: drums[s:s + n] += hat(n)
    # arpège léger
    arp = np.zeros(N); st = beat / 4
    for k in range(int(length / st)):
        s = int(k * st * SR); n = int(st * SR)
        if s + n > N: break
        ch = prog[int(k * st / bar) % len(prog)]
        f = midi(scale_root + 12 + ch[k % len(ch)])
        arp[s:s + n] += note(f, n, 'sine') * env(n, .002, .08)
    arp = arp * .12
    mix = pad + bass + drums + arp
    # stéréo légère (arpège décalé)
    L = mix + np.roll(arp, int(SR * .012)) * .5; R = mix + arp * .5
    st2 = np.stack([L, R], 1)
    st2 /= np.abs(st2).max() + 1e-9
    fade = np.minimum(1, np.arange(N) / (SR * 1.5))[:, None] * np.minimum(1, (N - np.arange(N)) / (SR * 2))[:, None]
    wav = HERE / 'music' / f'{name}.wav'
    save_wav(wav, st2 * fade * .85)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(wav), '-c:a', 'aac', '-b:a', '160k', str(wav.with_suffix('.m4a'))], check=True)
    wav.unlink()

if __name__ == '__main__':
    sfx()
    # pulse : motivant, majeur (I V vi IV), 108 bpm
    track('pulse', 108, [[0, 4, 7, 11], [7, 11, 14, 17], [9, 12, 16, 19], [5, 9, 12, 16]], 57)
    # calme : doux, sans batterie lourde, 84 bpm
    track('calme', 84, [[0, 4, 7, 14], [5, 9, 12, 16], [-3, 0, 4, 7], [7, 11, 14, 17]], 60, kick_on=False, pad_kind='tri', bright=1400)
    # tension : mineur, pour une actu ou un vrai/faux, 96 bpm
    track('tension', 96, [[0, 3, 7, 10], [-4, 0, 3, 7], [-2, 2, 5, 9], [-5, -1, 2, 5]], 57, bright=1200)
    print('ok')
