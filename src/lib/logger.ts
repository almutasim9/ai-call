/**
 * Structured logger — outputs JSON lines suitable for Vercel log drains,
 * Datadog, or any log aggregator. Falls back gracefully in development.
 */

type Level = 'info' | 'warn' | 'error'

function log(level: Level, message: string, data?: Record<string, unknown>) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(data && Object.keys(data).length > 0 && { data }),
  }
  const line = JSON.stringify(entry)
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.log(line)
}

export const logger = {
  info: (message: string, data?: Record<string, unknown>) => log('info', message, data),
  warn: (message: string, data?: Record<string, unknown>) => log('warn', message, data),
  error: (message: string, data?: Record<string, unknown>) => log('error', message, data),
}
