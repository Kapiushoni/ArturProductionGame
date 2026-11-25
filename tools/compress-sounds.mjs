// game_data/sounds/*.mp3 -> public/sounds/*.mp3, smaller: music 64 kbps stereo @32 kHz, effects 64 kbps mono.
// MP3 is kept for universal decodeAudioData support (incl. older iOS Safari).
import { readdirSync, statSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';

const ROOT = new URL('../..', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const SRC = join(ROOT, 'web/source/game_data/sounds'), OUT = join(ROOT, 'web/public/sounds');
mkdirSync(OUT, { recursive: true });
let before = 0, after = 0;
for (const f of readdirSync(SRC).filter((f) => f.endsWith('.mp3'))) {
  const music = /music/.test(f);
  const args = ['-hide_banner', '-loglevel', 'error', '-y', '-i', join(SRC, f), '-map_metadata', '-1',
    ...(music ? ['-ac', '2', '-ar', '32000', '-b:a', '64k'] : ['-ac', '1', '-ar', '44100', '-b:a', '64k']),
    '-codec:a', 'libmp3lame', join(OUT, f)];
  execFileSync(ffmpeg, args);
  const a = statSync(join(SRC, f)).size, b = statSync(join(OUT, f)).size;
  before += a; after += b;
}
console.log(`sounds: ${(before / 1048576).toFixed(2)} MB -> ${(after / 1048576).toFixed(2)} MB`);
