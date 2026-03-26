import { GoogleGenerativeAI } from '@google/generative-ai'
import { Product, Message } from '@/lib/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateResponse(
  customerMessage: string,
  storeName: string,
  products: Product[],
  history: Message[]
) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  // Construct the product context
  const productContext = products.length > 0
    ? products.map(p => `- ${p.name}: ${p.description || 'No description'} (Price: ${p.price})`).join('\n')
    : 'No products listed yet.'

  // Construct the prompt
  const prompt = `
    You are an AI Customer Service Agent for an e-commerce store called "${storeName}".
    Your goal is to be helpful, professional, and friendly. 
    Only answer based on the products provided below. If a customer asks about something not in the list, politely tell them you don't have information on that but can help with the existing products.

    AVAILABLE PRODUCTS:
    ${productContext}

    CUSTOMER MESSAGE:
    "${customerMessage}"

    RESPONSE GUIDELINES:
    - Language: Reply in the same language as the customer (Arabic or English).
    - Tone: Helpful and concise.
    - If asked for prices, provide them clearly.
    - Do not make up products or details.
    
    Please provide only the response text.
  `

  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text()
}
