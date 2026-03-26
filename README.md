# 🤖 AI-Call: Merchant AI Customer Service Platform

<div dir="rtl">

**مرحباً بك في AI-Call!**  
منصة متطورة لإدارة خدمة العملاء عبر الذكاء الاصطناعي، مصممة خصيصاً للتجار لمساعدتهم على الرد التلقائي والذكي على استفسارات العملاء في WhatsApp و Instagram.

</div>

---

## 🚀 Overview | نظرة عامة

AI-Call is a production-ready SaaS platform that bridges the gap between your product catalog and your social media customers. Using Google's Gemini 1.5 Flash AI, it provides instant, accurate responses based on your live inventory.

<div dir="rtl">

AI-Call هي منصة SaaS جاهزة للعمل، تربط بين قائمة منتجاتك وعملائك على وسائل التواصل الاجتماعي. باستخدام ذكاء Google Gemini 1.5 Flash، توفر المنصة ردوداً فورية ودقيقة تعتمد على مخزونك الفعلي.

</div>

---

## ✨ Key Features | المميزات الرئيسية

- **🧠 Smart AI Responses:** Autonomously answers customer questions about product details, prices, and availability.
- **📱 Multi-Channel Support:** Integrated with WhatsApp Business and Instagram Direct Messaging.
- **🌗 Dual-Theme Dashboard:** Premium Dark and Light mode support for the merchant interface.
- **📦 Inventory Management:** Real-time product CRUD with stock tracking and low-stock alerts.
- **🔒 Secure Multi-Tenancy:** Each merchant has their own isolated data and Meta credentials.
- **⚡ Next.js 16 Power:** Built on the latest Next.js 16 with optimized App Router and Middleware.

---

## 🛠 Tech Stack | التقنيات المستخدمة

- **Frontend:** Next.js 16 (App Router), Tailwind CSS, Lucide React.
- **Backend:** Supabase (PostgreSQL, Auth, RLS).
- **AI Engine:** Google Gemini 1.5 Flash SDK.
- **Communications:** Meta Graph API (WhatsApp & Messenger).
- **Hosting:** Vercel.

---

## ⚙️ Setup & Installation | الإعداد والتثبيت

### 1. Prerequisites
- Node.js (Latest LTS)
- Supabase Account
- Meta Developer Account

### 2. Environment Variables
Create a `.env.local` file with the following keys:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Meta Webhook
META_VERIFY_TOKEN=your_custom_token
ADMIN_SECRET=your_admin_secret

# AI
GEMINI_API_KEY=your_google_ai_key
```

### 3. Local Development
```bash
npm install
npm run dev
```

---

## 🚢 Deployment | النشر

To make the AI live:
1. Push your code to GitHub.
2. Connect the repository to **Vercel**.
3. Add all environment variables to Vercel Settings.
4. Set your Meta Webhook Callback URL to: `https://your-domain.com/api/webhook/meta`.
5. Subscribe to the `messages` field in the Meta Developer Portal.

---

## 📄 License | الترخيص
Internal Project - All Rights Reserved.

---
<div align="center">
Built with ❤️ by Antigravity AI for AI-Call Platform.
</div>
