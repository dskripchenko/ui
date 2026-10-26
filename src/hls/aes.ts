import { sequenceIv, type HlsKey } from './playlist.js'

const keyCache = new Map<string, Promise<CryptoKey>>()

export function aesSupported(): boolean {
  return typeof crypto !== 'undefined' && !!crypto.subtle
}

export function importKey(uri: string, load: (uri: string) => Promise<ArrayBuffer>): Promise<CryptoKey> {
  let p = keyCache.get(uri)
  if (!p) {
    p = load(uri).then((raw) => {
      if (raw.byteLength !== 16) throw new Error(`AES-128 key must be 16 bytes, got ${raw.byteLength}`)
      return crypto.subtle.importKey('raw', raw, { name: 'AES-CBC' }, false, ['decrypt'])
    })
    p.catch(() => keyCache.delete(uri))
    keyCache.set(uri, p)
  }
  return p
}

/** AES-128-CBC with PKCS#7 padding, as HLS full-segment encryption uses. */
export async function decryptSegment(
  data: ArrayBuffer,
  key: HlsKey,
  sn: number,
  load: (uri: string) => Promise<ArrayBuffer>,
): Promise<ArrayBuffer> {
  if (!key.uri) throw new Error('EXT-X-KEY without URI')
  const cryptoKey = await importKey(key.uri, load)
  const iv = key.iv ?? sequenceIv(sn)
  return crypto.subtle.decrypt({ name: 'AES-CBC', iv: iv as BufferSource }, cryptoKey, data)
}
