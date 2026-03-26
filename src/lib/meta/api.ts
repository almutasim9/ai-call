/**
 * Meta Graph API Helper
 */

import { logger } from '@/lib/logger'

export async function sendMetaMessage(
  recipientId: string,
  message: string,
  platform: 'whatsapp' | 'instagram',
  accessToken: string,
  phoneNumberId?: string // Required for WhatsApp
) {
  if (!accessToken) {
    logger.error('Meta API: missing access token')
    return false
  }

  const url = platform === 'whatsapp'
    ? `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`
    : `https://graph.facebook.com/v19.0/me/messages`

  const body = platform === 'whatsapp'
    ? {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientId,
        type: 'text',
        text: { body: message }
      }
    : {
        recipient: { id: recipientId },
        message: { text: message }
      }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()

    if (!response.ok) {
      logger.error('Meta API: send failed', { platform, status: response.status, error: data })
      return false
    }

    logger.info('Meta API: message sent', { platform, recipientId })
    return true
  } catch (error) {
    logger.error('Meta API: network error', { error: error instanceof Error ? error.message : String(error) })
    return false
  }
}
