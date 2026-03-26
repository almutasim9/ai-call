/**
 * Meta Graph API Helper
 */

export async function sendMetaMessage(
  recipientId: string,
  message: string,
  platform: 'whatsapp' | 'instagram',
  accessToken: string,
  phoneNumberId?: string // Required for WhatsApp
) {
  if (!accessToken) {
    console.error('Missing Meta Access Token for tenant')
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
      console.error(`Meta API Error (${platform}):`, JSON.stringify(data, null, 2))
      return false
    }

    console.log(`Successfully sent ${platform} message to ${recipientId}`)
    return true
  } catch (error) {
    console.error('Network error calling Meta API:', error)
    return false
  }
}
