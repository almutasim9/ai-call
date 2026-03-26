-- Migration 001: Add message deduplication field to conversations
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS last_processed_message_id TEXT;
