-- ================================================================
-- GeoGuard AI — Supabase Database Schema
-- Run this in your Supabase SQL Editor (https://supabase.com)
-- Project → SQL Editor → New Query → Paste & Run
-- ================================================================

-- Enable PostGIS extension (already enabled in Supabase by default)
CREATE EXTENSION IF NOT EXISTS postgis;

-- ================================================================
-- TABLE 1: Scan Results
-- ================================================================
CREATE TABLE IF NOT EXISTS scans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    scan_id TEXT UNIQUE NOT NULL,
    city TEXT NOT NULL,
    region TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- PostGIS geometry for spatial queries
    center_point GEOMETRY(POINT, 4326),
    bbox GEOMETRY(POLYGON, 4326),
    
    -- Classification results (JSONB for flexible querying)
    classification JSONB,
    total_changed_pixels INTEGER,
    total_changed_area_m2 FLOAT,
    total_changed_hectares FLOAT,
    
    -- Compliance violations
    violations JSONB,
    violation_count INTEGER DEFAULT 0,
    max_severity TEXT,
    risk_score INTEGER,
    next_scan_due TIMESTAMPTZ,
    
    -- Blockchain evidence
    evidence_hash TEXT,
    
    -- Model metadata
    model_name TEXT DEFAULT 'Siamese-SNN v3',
    inference_time_seconds FLOAT,
    
    -- Image URLs (from Supabase Storage)
    before_rgb_url TEXT,
    after_rgb_url TEXT,
    change_mask_url TEXT,
    overlay_url TEXT,
    report_pdf_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial index for fast geographic queries
CREATE INDEX IF NOT EXISTS idx_scans_center ON scans USING GIST (center_point);
CREATE INDEX IF NOT EXISTS idx_scans_bbox ON scans USING GIST (bbox);

-- Index for filtering by city and severity
CREATE INDEX IF NOT EXISTS idx_scans_city ON scans (city);
CREATE INDEX IF NOT EXISTS idx_scans_severity ON scans (max_severity);

-- ================================================================
-- TABLE 2: Chat Conversations
-- ================================================================
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT DEFAULT 'New Conversation',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE 3: Chat Messages
-- ================================================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast message retrieval by conversation
CREATE INDEX IF NOT EXISTS idx_messages_conversation 
    ON chat_messages (conversation_id, created_at);

-- ================================================================
-- STORAGE: Create the satellite-scans bucket (do this in Dashboard)
-- Go to: Supabase Dashboard → Storage → New Bucket
-- Name: satellite-scans
-- Make it PUBLIC
-- ================================================================

-- ================================================================
-- ROW LEVEL SECURITY (RLS) — Permissive for development
-- In production, you should add proper auth policies
-- ================================================================

-- Allow all operations on scans table (for development)
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow all on scans" ON scans
    FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow all on chat_conversations" ON chat_conversations
    FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow all on chat_messages" ON chat_messages
    FOR ALL USING (true) WITH CHECK (true);
