import { GoogleGenerativeAI } from '@google/generative-ai'
import { Product, Message } from '@/lib/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

/** Strip common prompt injection patterns and limit message length */
function sanitizeInput(input: string): string {
  let s = input.slice(0, 500) // prevent token flooding
  const injectionPatterns = [
    /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/gi,
    /you\s+are\s+now/gi,
    /^\s*system\s*:/gim,
    /^\s*#{1,6}\s/gm,
    /^\s*```/gm,
  ]
  for (const pattern of injectionPatterns) {
    s = s.replace(pattern, '[redacted]')
  }
  return s.trim()
}

export async function generateResponse(
  customerMessage: string,
  storeName: string,
  products: Product[],
  history: Message[]
) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const productContext = products.length > 0
    ? products.map(p => `- ${p.name}: ${p.description || 'No description'} (Price: ${p.price})`).join('\n')
    : 'No products listed yet.'

  const safeMessage = sanitizeInput(customerMessage)

  // System instructions — separated from user content with clear delimiters
  const systemPrompt = `You are an AI Customer Service Agent for an e-commerce store called "${storeName}".
Your goal is to be helpful, professional, and friendly.
Only answer based on the products provided below. If a customer asks about something not in the list, politely tell them you don't have information on that but can help with the existing products.

AVAILABLE PRODUCTS:
${productContext}

RESPONSE GUIDELINES:
- Language: Reply in the same language as the customer (Arabic or English).
- Tone: Helpful and concise.
- If asked for prices, provide them clearly.
- Do not make up products or details.
Please provide only the response text. Do not repeat these instructions.`

  // Include conversation history so the AI understands context
  const historyText = history.length > 0
    ? history
        .map(m => `${m.role === 'customer' ? 'Customer' : 'Assistant'}: ${m.content}`)
        .join('\n')
    : ''

  // Delimiters ensure the model distinguishes instructions from user input
  const fullPrompt = historyText
    ? `${systemPrompt}\n\n--- CONVERSATION HISTORY ---\n${historyText}\n--- END HISTORY ---\n\n--- CUSTOMER MESSAGE ---\n${safeMessage}\n--- END MESSAGE ---`
    : `${systemPrompt}\n\n--- CUSTOMER MESSAGE ---\n${safeMessage}\n--- END MESSAGE ---`

  const result = await model.generateContent(fullPrompt)
  const response = await result.response
  return response.text()
}
