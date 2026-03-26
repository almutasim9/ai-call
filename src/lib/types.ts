export interface Tenant {
  id: string
  store_name: string
  meta_access_token?: string
  status: 'active' | 'suspended'
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  tenant_id: string
  name: string
  description?: string
  price: number
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  tenant_id: string
  customer_phone_or_id: string
  platform: 'whatsapp' | 'instagram'
  message_history: Message[]
  created_at: string
  updated_at: string
}

export interface Message {
  role: 'customer' | 'ai' | 'agent'
  content: string
  timestamp: string
}

export interface MetaWebhookPayload {
  object: string
  entry: Array<{
    id: string
    time: number
    changes?: Array<{
      value: {
        messaging_product: string
        metadata: {
          display_phone_number: string
          phone_number_id: string
        }
        messages?: Array<{
          from: string
          id: string
          timestamp: string
          text: { body: string }
          type: string
        }>
      }
      field: string
    }>
    messaging?: Array<{
      sender: { id: string }
      recipient: { id: string }
      timestamp: number
      message: {
        mid: string
        text: string
      }
    }>
  }>
}
