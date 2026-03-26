-- 1. Create Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    store_name TEXT NOT NULL,
    meta_access_token TEXT,
    whatsapp_phone_number_id TEXT,
    instagram_page_id TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL DEFAULT 0,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_phone_or_id TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('whatsapp', 'instagram')),
    message_history JSONB DEFAULT '[]'::jsonb,
    last_processed_message_id TEXT,  -- deduplication: tracks last Meta message ID processed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, customer_phone_or_id, platform)
);

-- ENABLE RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR TENANTS
CREATE POLICY "Tenants can view own data" 
    ON tenants FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Tenants can update own data" 
    ON tenants FOR UPDATE 
    USING (auth.uid() = id);

-- RLS POLICIES FOR PRODUCTS
CREATE POLICY "Tenants can manage own products" 
    ON products FOR ALL 
    USING (tenant_id = auth.uid());

-- RLS POLICIES FOR CONVERSATIONS
CREATE POLICY "Tenants can manage own conversations" 
    ON conversations FOR ALL 
    USING (tenant_id = auth.uid());

-- FUNCTION TO HANDLE UPDATED_AT
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS
CREATE TRIGGER set_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
