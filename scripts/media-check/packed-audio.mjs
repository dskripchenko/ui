// Turns audio-only MPEG-TS HLS segments into "packed audio" segments: an ID3 tag with
// Apple's transport stream timestamp followed by the raw ADTS frames.
// Usage: node packed-audio.mjs <in.m3u8> <out-dir>
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'

const [input, outDir] = process.argv.slice(2)
mkdirSync(outDir, { recursive: true })

function audioPes(d) {
  let pmt
  let audio
  const chunks = []
  let first = null
  for (let o = 0; o + 188 <= d.length; o += 188) {
    const pusi = (d[o + 1] & 0x40) !== 0
    const pid = ((d[o + 1] & 0x1f) << 8) | d[o + 2]
    const afc = (d[o + 3] & 0x30) >> 4
    let p = o + 4
    if (afc === 2) continue
    if (afc === 3) p += d[p] + 1
    if (pid === 0) {
      p += d[p] + 1
      pmt = ((d[p + 10] & 0x1f) << 8) | d[p + 11]
    } else if (pid === pmt && audio === undefined) {
      p += d[p] + 1
      const info = ((d[p + 10] & 0x0f) << 8) | d[p + 11]
      const q = p + 12 + info
      audio = ((d[q + 1] & 0x1f) << 8) | d[q + 2]
    } else if (pid === audio) {
      if (pusi) {
        const hl = d[p + 8]
        if (first === null && d[p + 7] & 0x80) {
          const b = p + 9
          first = (d[b] & 0x0e) * 536870912 + d[b + 1] * 4194304 + (d[b + 2] & 0xfe) * 16384 + d[b + 3] * 128 + (d[b + 4] & 0xfe) / 2
        }
        p += 9 + hl
      }
      chunks.push(d.subarray(p, o + 188))
    }
  }
  return { pts: first, adts: Buffer.concat(chunks) }
}

function id3(pts) {
  const owner = Buffer.from('com.apple.streaming.transportStreamTimestamp\0', 'latin1')
  const ts = Buffer.alloc(8)
  ts.writeUInt32BE(Math.floor(pts / 4294967296) & 1, 0)
  ts.writeUInt32BE(pts % 4294967296, 4)
  const body = Buffer.concat([owner, ts])
  const frame = Buffer.concat([Buffer.from('PRIV'), Buffer.from([0, 0, 0, body.length, 0, 0]), body])
  const size = frame.length
  const head = Buffer.from([0x49, 0x44, 0x33, 4, 0, 0, (size >> 21) & 0x7f, (size >> 14) & 0x7f, (size >> 7) & 0x7f, size & 0x7f])
  return Buffer.concat([head, frame])
}

const lines = readFileSync(input, 'utf8').split('\n')
const out = lines.map((line) => {
  if (!line || line.startsWith('#')) return line
  const { pts, adts } = audioPes(readFileSync(join(dirname(input), line)))
  const name = basename(line).replace(/\.ts$/, '.aac')
  writeFileSync(join(outDir, name), Buffer.concat([id3(pts), adts]))
  return name
})
writeFileSync(join(outDir, 'index.m3u8'), out.join('\n'))
