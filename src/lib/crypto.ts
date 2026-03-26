/**
 * AES-256-GCM encryption for sensitive fields stored in the database.
 * Requires ENCRYPTION_KEY env var (64 hex chars = 32 bytes).
 *
 * Encrypted format: `iv:authTag:ciphertext` (all hex-encoded)
 * The authTag ensures the ciphertext hasn't been tampered with.
 */

import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_BYTES = 12   // 96-bit IV recommended for GCM
const TAG_BYTES = 16  // 128-bit auth tag (GCM default)

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)')
  }
  return Buffer.from(hex, 'hex')
}

/** Returns `iv:authTag:ciphertext` hex string */
export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(IV_BYTES)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`
}

/**
 * Decrypts a value produced by `encrypt()`.
 * If the value does not match the `iv:tag:ciphertext` format (i.e. legacy plaintext),
 * it is returned as-is to support gradual migration of existing tokens.
 */
export function decrypt(value: string): string {
  // Detect legacy plaintext (not yet encrypted)
  if (!value.includes(':')) return value

  const parts = value.split(':')
  if (parts.length !== 3) return value  // malformed — return as-is

  const [ivHex, tagHex, dataHex] = parts
  try {
    const key = getKey()
    const iv = Buffer.from(ivHex, 'hex')
    const tag = Buffer.from(tagHex, 'hex')
    const data = Buffer.from(dataHex, 'hex')

    if (iv.length !== IV_BYTES || tag.length !== TAG_BYTES) return value

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)

    return decipher.update(data).toString('utf8') + decipher.final('utf8')
  } catch {
    // Decryption failed — could be wrong key or corrupted data
    throw new Error('Failed to decrypt token — check ENCRYPTION_KEY or re-enter the token in settings')
  }
}

/** Returns true if the value was encrypted by this module */
export function isEncrypted(value: string): boolean {
  const parts = value.split(':')
  return parts.length === 3 && parts[0].length === IV_BYTES * 2
}
