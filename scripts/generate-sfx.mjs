import fs from 'node:fs';
import path from 'node:path';

const SAMPLE_RATE = 44100;
const OUTPUT_DIR = path.resolve(process.cwd(), 'assets', 'sfx');

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const tone = (frequency, durationSeconds, amplitude = 0.5, phase = 0) => {
  const sampleCount = Math.floor(SAMPLE_RATE * durationSeconds);
  const samples = new Float32Array(sampleCount);

  for (let index = 0; index < sampleCount; index += 1) {
    const time = index / SAMPLE_RATE;
    samples[index] = amplitude * Math.sin(2 * Math.PI * frequency * time + phase);
  }

  return samples;
};

const noise = (durationSeconds, amplitude = 0.2) => {
  const sampleCount = Math.floor(SAMPLE_RATE * durationSeconds);
  const samples = new Float32Array(sampleCount);

  for (let index = 0; index < sampleCount; index += 1) {
    samples[index] = amplitude * (Math.random() * 2 - 1);
  }

  return samples;
};

const concat = (...tracks) => {
  const totalLength = tracks.reduce((sum, track) => sum + track.length, 0);
  const out = new Float32Array(totalLength);
  let offset = 0;

  for (const track of tracks) {
    out.set(track, offset);
    offset += track.length;
  }

  return out;
};

const mix = (...tracks) => {
  const maxLength = tracks.reduce((max, track) => Math.max(max, track.length), 0);
  const out = new Float32Array(maxLength);

  for (const track of tracks) {
    for (let index = 0; index < track.length; index += 1) {
      out[index] += track[index];
    }
  }

  let peak = 0;
  for (let index = 0; index < out.length; index += 1) {
    peak = Math.max(peak, Math.abs(out[index]));
  }

  if (peak > 1) {
    for (let index = 0; index < out.length; index += 1) {
      out[index] /= peak;
    }
  }

  return out;
};

const applyEnvelope = (samples, attackSeconds = 0.01, releaseSeconds = 0.08) => {
  const attackSamples = Math.max(1, Math.floor(SAMPLE_RATE * attackSeconds));
  const releaseSamples = Math.max(1, Math.floor(SAMPLE_RATE * releaseSeconds));
  const out = new Float32Array(samples.length);

  for (let index = 0; index < samples.length; index += 1) {
    let gain = 1;
    if (index < attackSamples) {
      gain = index / attackSamples;
    } else if (index > samples.length - releaseSamples) {
      gain = clamp((samples.length - index) / releaseSamples, 0, 1);
    }

    out[index] = samples[index] * gain;
  }

  return out;
};

const silence = (durationSeconds) => new Float32Array(Math.floor(SAMPLE_RATE * durationSeconds));

const writeWav = (filePath, samples) => {
  const enveloped = applyEnvelope(samples);
  const pcm = Buffer.alloc(enveloped.length * 2);

  for (let index = 0; index < enveloped.length; index += 1) {
    const sample = clamp(enveloped[index], -1, 1);
    const int16 = Math.round(sample * 32767);
    pcm.writeInt16LE(int16, index * 2);
  }

  const header = Buffer.alloc(44);
  const byteRate = SAMPLE_RATE * 2;
  const blockAlign = 2;
  const subchunk2Size = pcm.length;
  const chunkSize = 36 + subchunk2Size;

  header.write('RIFF', 0);
  header.writeUInt32LE(chunkSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(subchunk2Size, 40);

  fs.writeFileSync(filePath, Buffer.concat([header, pcm]));
};

const reveal = concat(
  mix(tone(420, 0.08, 0.35), tone(840, 0.08, 0.18)),
  mix(tone(620, 0.1, 0.32), tone(1240, 0.1, 0.15))
);

const submit = concat(
  mix(noise(0.02, 0.12), tone(900, 0.02, 0.2)),
  tone(660, 0.08, 0.24)
);

const vote = concat(tone(520, 0.07, 0.28), silence(0.03), tone(430, 0.1, 0.26));

const result = concat(tone(392, 0.09, 0.28), tone(494, 0.09, 0.27), tone(587, 0.14, 0.29));

const warning = mix(
  concat(tone(700, 0.08, 0.26), tone(520, 0.1, 0.24), tone(380, 0.12, 0.22)),
  noise(0.3, 0.05)
);

const reconnect = concat(tone(500, 0.08, 0.24), tone(740, 0.12, 0.26));
const confirm = concat(tone(640, 0.06, 0.22), tone(780, 0.06, 0.2));
const error = mix(
  concat(tone(300, 0.08, 0.25), tone(220, 0.12, 0.28)),
  tone(455, 0.2, 0.12),
  noise(0.2, 0.06)
);

const files = {
  'sfx_reveal.wav': reveal,
  'sfx_submit.wav': submit,
  'sfx_vote.wav': vote,
  'sfx_result.wav': result,
  'sfx_warning.wav': warning,
  'sfx_reconnect.wav': reconnect,
  'sfx_confirm.wav': confirm,
  'sfx_error.wav': error,
};

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

for (const [fileName, data] of Object.entries(files)) {
  writeWav(path.join(OUTPUT_DIR, fileName), data);
}

console.log(`Generated ${Object.keys(files).length} SFX files in ${OUTPUT_DIR}`);
