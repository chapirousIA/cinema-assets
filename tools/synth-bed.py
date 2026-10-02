#!/usr/bin/env python3
"""Trilha PROVISÓRIA sintetizada (calma, para serviços profissionais) — use quando o ElevenLabs
não estiver disponível. Piano elétrico suave em arpejo + pad + baixo + batida leve.

  python3 tools/synth-bed.py --seconds 25 --chord-len 3.5 --out assets/audio/trilha.wav
  python3 tools/synth-bed.py --seconds 25 --chord-len 3.5 --progression "F:maj9 Dm:m9 Bb:maj7 C:sus4 F:maj9" --out x.wav

As trocas de acorde caem a cada --chord-len segundos: alinhe com os cortes do storyboard.
O último acorde da progressão é o "repouso" (alinhe com a entrada da marca).
Requer numpy. Gera WAV 44,1 kHz estéreo; converta com ffmpeg se precisar de MP3.
"""
import argparse
import wave

import numpy as np

SR = 44100
NOTES = {'C': 0, 'Db': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5, 'Gb': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11}
QUALITY = {
    'maj7': [0, 4, 7, 11], 'maj9': [0, 4, 7, 11, 14], 'm7': [0, 3, 7, 10], 'm9': [0, 3, 7, 10, 14],
    '6': [0, 4, 7, 9], 'sus4': [0, 5, 7, 10], 'add9': [0, 4, 7, 14], 'maj': [0, 4, 7],
}


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def chord(sym, octave=4):
    root, q = sym.split(':')
    base = 12 * (octave + 1) + NOTES[root]
    return base, [base + i for i in QUALITY[q]]


def epiano(f, dur, vel=1.0):
    t = np.arange(int(dur * SR)) / SR
    env = np.exp(-t / 1.1) * (1 - np.exp(-t / 0.004))
    tone = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.4)
            + 0.12 * np.sin(2 * np.pi * 3.01 * f * t) * np.exp(-t / 0.25))
    return vel * env * tone


def pad(freqs, dur):
    t = np.arange(int(dur * SR)) / SR
    env = np.minimum(1, t / 1.2) * np.minimum(1, (dur - t) / 0.8).clip(0)
    out = np.zeros_like(t)
    for f in freqs:
        for det in (-0.12, 0.12):
            out += np.sin(2 * np.pi * (f + det) * t) + 0.2 * np.sin(2 * np.pi * 2 * (f + det) * t)
    return env * out / (2 * len(freqs))


def kick(dur=0.5):
    t = np.arange(int(dur * SR)) / SR
    f = 52 + 60 * np.exp(-t / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.14)


def shaker(dur=0.09, seed=1):
    rng = np.random.default_rng(seed)
    t = np.arange(int(dur * SR)) / SR
    n = rng.standard_normal(len(t))
    n = np.diff(n, prepend=0)  # passa-altas simples
    return n * np.exp(-t / 0.025)


def add(buf, sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= buf.shape[0]:
        return
    sig = sig[: buf.shape[0] - i] * gain
    buf[i:i + len(sig), 0] += sig * np.sqrt((1 - pan) / 2)
    buf[i:i + len(sig), 1] += sig * np.sqrt((1 + pan) / 2)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--seconds', type=float, default=25)
    ap.add_argument('--chord-len', type=float, default=3.5)
    ap.add_argument('--progression', default='F:maj9 A:m7 D:m9 Bb:maj7 G:m7 C:sus4 F:maj9')
    ap.add_argument('--out', required=True)
    a = ap.parse_args()

    total = a.seconds + 2.5  # cauda para o reverb
    buf = np.zeros((int(total * SR), 2))
    prog = a.progression.split()
    step = a.chord_len / 8  # colcheias
    pattern = [0, 2, 1, 3, 2, 1, 4, 2]  # índices do arpejo
    n_chords = min(int(np.ceil(a.seconds / a.chord_len)), len(prog))
    for c in range(n_chords):
        sym = prog[c]
        t0 = c * a.chord_len
        root, tones = chord(sym, 4)
        last = c == n_chords - 1
        add(buf, pad([hz(m) for m in tones[:4]], a.chord_len + 0.6), t0, 0.16)
        add(buf, epiano(hz(root - 12), 3.0) * 0.9, t0, 0.07)                       # baixo
        if last:  # repouso: acorde em bloco, deixa soar
            for k, m in enumerate(tones):
                add(buf, epiano(hz(m), 4.0), t0 + 0.03 * k, 0.11, pan=-0.3 + 0.15 * k)
        else:
            for s, idx in enumerate(pattern):
                m = tones[idx % len(tones)] + (12 if idx >= len(tones) else 0)
                add(buf, epiano(hz(m), 2.2, 0.8 + 0.2 * (s % 2 == 0)), t0 + s * step, 0.085,
                    pan=-0.35 + 0.1 * (idx % 5))
            for b in range(4):  # batida leve: kick nos tempos 1 e 3, shaker nos contratempos
                if b % 2 == 0:
                    add(buf, kick(), t0 + b * a.chord_len / 4, 0.07)
                add(buf, shaker(seed=c * 4 + b), t0 + (b + 0.5) * a.chord_len / 4, 0.025, pan=0.3)

    # reverb simples (pré-delay + reflexões amortecidas), fade-in/out
    wet = np.zeros_like(buf)
    for d, g in ((0.031, 0.32), (0.047, 0.26), (0.071, 0.21), (0.113, 0.16), (0.167, 0.12), (0.241, 0.08)):
        k = int(d * SR)
        wet[k:, 0] += buf[:-k, 1] * g
        wet[k:, 1] += buf[:-k, 0] * g
    out = buf + wet
    n = int(a.seconds * SR)
    out = out[:n]
    fade_in = np.minimum(1, np.arange(n) / (0.8 * SR))
    fade_out = np.minimum(1, (n - np.arange(n)) / (1.6 * SR))
    out *= (fade_in * fade_out)[:, None]
    out /= np.abs(out).max() / 0.7
    with wave.open(a.out, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((out * 32767).astype('<i2').tobytes())
    print('✓', a.out)


if __name__ == '__main__':
    main()
