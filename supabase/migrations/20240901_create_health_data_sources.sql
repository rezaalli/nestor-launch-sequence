-- Create health_data_sources table
CREATE TABLE IF NOT EXISTS health_data_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  last_sync_date TIMESTAMPTZ,
  settings JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Add a unique constraint to ensure each user can only have one config per platform
  UNIQUE(user_id, platform)
);

-- Set up Row Level Security (RLS)
ALTER TABLE health_data_sources ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own health data sources
CREATE POLICY "Users can view their own health data sources"
  ON health_data_sources FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own health data sources
CREATE POLICY "Users can insert their own health data sources"
  ON health_data_sources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own health data sources
CREATE POLICY "Users can update their own health data sources"
  ON health_data_sources FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own health data sources
CREATE POLICY "Users can delete their own health data sources"
  ON health_data_sources FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at on record update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set updated_at on record update
CREATE TRIGGER update_health_data_sources_updated_at
BEFORE UPDATE ON health_data_sources
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 