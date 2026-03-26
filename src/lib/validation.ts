/**
 * Shared validation helpers — no external dependency required.
 * Each function returns null on success or an error string on failure.
 */

export interface ValidationError {
  field: string
  message: string
}

function err(field: string, message: string): ValidationError {
  return { field, message }
}

// ─── Primitives ──────────────────────────────────────────────────────────────

function validateString(value: unknown, field: string, opts: {
  required?: boolean
  maxLength?: number
  minLength?: number
} = {}): ValidationError | null {
  if (value === null || value === undefined || value === '') {
    if (opts.required) return err(field, `${field} is required`)
    return null
  }
  if (typeof value !== 'string') return err(field, `${field} must be a string`)
  const trimmed = value.trim()
  if (opts.required && trimmed.length === 0) return err(field, `${field} cannot be blank`)
  if (opts.minLength && trimmed.length < opts.minLength) return err(field, `${field} must be at least ${opts.minLength} characters`)
  if (opts.maxLength && trimmed.length > opts.maxLength) return err(field, `${field} must be ${opts.maxLength} characters or fewer`)
  return null
}

function validateEmail(value: unknown, field = 'email'): ValidationError | null {
  const strErr = validateString(value, field, { required: true })
  if (strErr) return strErr
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(String(value).trim())) return err(field, 'Invalid email address')
  return null
}

function validatePositiveNumber(value: unknown, field: string, opts: {
  allowZero?: boolean
  max?: number
} = {}): ValidationError | null {
  const num = Number(value)
  if (isNaN(num)) return err(field, `${field} must be a valid number`)
  const min = opts.allowZero ? 0 : 0
  if (num < min) return err(field, `${field} cannot be negative`)
  if (opts.max !== undefined && num > opts.max) return err(field, `${field} cannot exceed ${opts.max}`)
  return null
}

function validateInteger(value: unknown, field: string, opts: { min?: number } = {}): ValidationError | null {
  const num = Number(value)
  if (isNaN(num)) return err(field, `${field} must be a valid number`)
  if (!Number.isInteger(num)) return err(field, `${field} must be a whole number`)
  if (opts.min !== undefined && num < opts.min) return err(field, `${field} cannot be less than ${opts.min}`)
  return null
}

// ─── Domain Schemas ───────────────────────────────────────────────────────────

export function validateProduct(data: {
  name: unknown
  price: unknown
  stock: unknown
  description: unknown
}): ValidationError[] {
  return [
    validateString(data.name, 'name', { required: true, maxLength: 200 }),
    validatePositiveNumber(data.price, 'price', { allowZero: true, max: 999_999_999 }),
    validateInteger(data.stock, 'stock', { min: 0 }),
    validateString(data.description, 'description', { maxLength: 2000 }),
  ].filter(Boolean) as ValidationError[]
}

export function validateSettings(data: {
  store_name: unknown
  whatsapp_phone_number_id: unknown
  instagram_page_id: unknown
  meta_access_token: unknown
}): ValidationError[] {
  return [
    validateString(data.store_name, 'store_name', { required: true, maxLength: 100 }),
    validateString(data.whatsapp_phone_number_id, 'whatsapp_phone_number_id', { maxLength: 100 }),
    validateString(data.instagram_page_id, 'instagram_page_id', { maxLength: 100 }),
    validateString(data.meta_access_token, 'meta_access_token', { maxLength: 500 }),
  ].filter(Boolean) as ValidationError[]
}

export function validateCreateTenant(data: {
  storeName: unknown
  email: unknown
  password: unknown
}): ValidationError[] {
  return [
    validateString(data.storeName, 'storeName', { required: true, maxLength: 100 }),
    validateEmail(data.email),
    validateString(data.password, 'password', { required: true, minLength: 8, maxLength: 128 }),
  ].filter(Boolean) as ValidationError[]
}

/** Format validation errors into a single readable message */
export function formatErrors(errors: ValidationError[]): string {
  return errors.map(e => e.message).join(', ')
}
