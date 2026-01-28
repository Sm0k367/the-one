# Supabase Database Setup

## Step 1: Create Tables

Go to your Supabase project dashboard → SQL Editor → New Query

Run this SQL to create the chat history table:

```sql
-- Create chat_history table
CREATE TABLE chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own chat history
CREATE POLICY "Users can view own chat history"
  ON chat_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own chat history
CREATE POLICY "Users can insert own chat history"
  ON chat_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own chat history
CREATE POLICY "Users can update own chat history"
  ON chat_history
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy: Users can delete their own chat history
CREATE POLICY "Users can delete own chat history"
  ON chat_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_chat_history_user_id ON chat_history(user_id);
```

## Step 2: Enable Email Auth

1. Go to Authentication → Providers
2. Make sure "Email" is enabled
3. Configure email templates (optional)

## Done!

Your database is now ready for the app.
