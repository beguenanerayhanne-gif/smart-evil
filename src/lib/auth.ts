/**
 * Edge-compatible Password Hashing & Verification using Web Crypto API (PBKDF2 SHA-256)
 * 100% compatible with Cloudflare Workers & Node.js Edge Runtimes.
 */

const ITERATIONS = 100000
const KEY_LEN = 32 // 256 bits

function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const encoder = new TextEncoder()
  const passwordBuffer = encoder.encode(password)

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  )

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_LEN * 8
  )

  const saltHex = bufferToHex(salt)
  const hashHex = bufferToHex(derivedBits)

  return `pbkdf2:${ITERATIONS}:${saltHex}:${hashHex}`
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false

  // Handle PBKDF2 Web Crypto hashes
  if (hash.startsWith('pbkdf2:')) {
    const parts = hash.split(':')
    if (parts.length !== 4) return false

    const iterations = parseInt(parts[1], 10)
    const saltHex = parts[2]
    const originalHashHex = parts[3]

    const salt = hexToBuffer(saltHex)
    const encoder = new TextEncoder()
    const passwordBuffer = encoder.encode(password)

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    )

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt.buffer as ArrayBuffer,
        iterations,
        hash: 'SHA-256',
      },
      keyMaterial,
      KEY_LEN * 8
    )

    const derivedHex = bufferToHex(derivedBits)
    return derivedHex === originalHashHex
  }

  // Fallback for existing bcrypt hashes ($2a$, $2b$) during transition
  if (hash.startsWith('$2a$') || hash.startsWith('$2b$')) {
    try {
      const bcrypt = await import('bcryptjs')
      return await bcrypt.compare(password, hash)
    } catch {
      return false
    }
  }

  return false
}
