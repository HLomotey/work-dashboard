-- Payroll Exports Table Schema
-- This table manages payroll export data and history

-- Create the payroll_exports table
CREATE TABLE IF NOT EXISTS payroll_exports (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign key
  billing_period_id UUID NOT NULL REFERENCES billing_periods(id) ON DELETE CASCADE,
  
  -- Export details
  export_type VARCHAR(50) NOT NULL DEFAULT 'full' CHECK (export_type IN ('full', 'incremental', 'corrections')),
  format VARCHAR(20) NOT NULL DEFAULT 'csv' CHECK (format IN ('csv', 'excel', 'json', 'xml')),
  
  -- File information
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NULL, -- Path to stored file
  file_size BIGINT NULL, -- File size in bytes
  
  -- Export statistics
  total_records INTEGER NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  
  -- Status and processing
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  
  -- Processing details
  started_at TIMESTAMPTZ NULL,
  completed_at TIMESTAMPTZ NULL,
  error_message TEXT NULL,
  
  -- Export metadata
  exported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  export_parameters JSONB NULL, -- Store export configuration/filters
  
  -- Checksum for data integrity
  checksum VARCHAR(64) NULL,
  
  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payroll_exports_billing_period ON payroll_exports(billing_period_id);
CREATE INDEX IF NOT EXISTS idx_payroll_exports_status ON payroll_exports(status);
CREATE INDEX IF NOT EXISTS idx_payroll_exports_exported_by ON payroll_exports(exported_by);
CREATE INDEX IF NOT EXISTS idx_payroll_exports_created_at ON payroll_exports(created_at);
CREATE INDEX IF NOT EXISTS idx_payroll_exports_type ON payroll_exports(export_type);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_payroll_exports_period_status ON payroll_exports(billing_period_id, status);
CREATE INDEX IF NOT EXISTS idx_payroll_exports_date_status ON payroll_exports(created_at, status);

-- Business rule constraints
ALTER TABLE payroll_exports 
ADD CONSTRAINT IF NOT EXISTS chk_completed_at_after_started 
CHECK (completed_at IS NULL OR started_at IS NULL OR completed_at >= started_at);

ALTER TABLE payroll_exports 
ADD CONSTRAINT IF NOT EXISTS chk_file_size_positive 
CHECK (file_size IS NULL OR file_size >= 0);

ALTER TABLE payroll_exports 
ADD CONSTRAINT IF NOT EXISTS chk_total_records_positive 
CHECK (total_records >= 0);

-- Update trigger function
CREATE OR REPLACE FUNCTION update_payroll_exports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create trigger
DROP TRIGGER IF EXISTS update_payroll_exports_updated_at ON payroll_exports;
CREATE TRIGGER update_payroll_exports_updated_at 
    BEFORE UPDATE ON payroll_exports 
    FOR EACH ROW 
    EXECUTE FUNCTION update_payroll_exports_updated_at();

-- Trigger to set timestamps based on status changes
CREATE OR REPLACE FUNCTION set_payroll_export_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    -- Set started_at when status changes to processing
    IF NEW.status = 'processing' AND OLD.status != 'processing' THEN
        NEW.started_at = NOW();
    END IF;
    
    -- Set completed_at when status changes to completed or failed
    IF NEW.status IN ('completed', 'failed') AND OLD.status NOT IN ('completed', 'failed') THEN
        NEW.completed_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS set_payroll_export_timestamps ON payroll_exports;
CREATE TRIGGER set_payroll_export_timestamps 
    BEFORE UPDATE ON payroll_exports 
    FOR EACH ROW 
    EXECUTE FUNCTION set_payroll_export_timestamps();

-- Enable Row Level Security
ALTER TABLE payroll_exports ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Policy: Allow administrators to manage all payroll exports
CREATE POLICY "Administrators can manage all payroll exports" ON payroll_exports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'Administrator'
        )
    );

-- Policy: Allow HR and Finance staff to manage all payroll exports
CREATE POLICY "HR and Finance can manage all payroll exports" ON payroll_exports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('HR', 'Finance', 'Payroll')
        )
    );

-- Policy: Allow users to view their own exports
CREATE POLICY "Users can view their own exports" ON payroll_exports
    FOR SELECT USING (exported_by = auth.uid());

-- Policy: Allow managers to view exports (read-only)
CREATE POLICY "Managers can view payroll exports" ON payroll_exports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('Manager', 'Department Head')
        )
    );

-- Policy: Prevent deletion of completed exports
CREATE POLICY "Prevent deletion of completed exports" ON payroll_exports
    FOR DELETE USING (
        status NOT IN ('completed') AND
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('Administrator', 'HR', 'Finance')
        )
    );

-- Policy: Only allow updates by authorized roles
CREATE POLICY "Restrict payroll export updates" ON payroll_exports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('Administrator', 'HR', 'Finance', 'Payroll')
        )
    );

-- Grant necessary permissions
GRANT ALL ON payroll_exports TO authenticated;
GRANT USAGE ON SEQUENCE payroll_exports_id_seq TO authenticated;

-- Comments for documentation
COMMENT ON TABLE payroll_exports IS 'Payroll export history and file management';
COMMENT ON COLUMN payroll_exports.id IS 'Unique identifier for the export';
COMMENT ON COLUMN payroll_exports.billing_period_id IS 'Reference to the billing period being exported';
COMMENT ON COLUMN payroll_exports.export_type IS 'Type of export (full, incremental, corrections)';
COMMENT ON COLUMN payroll_exports.format IS 'Export file format';
COMMENT ON COLUMN payroll_exports.file_name IS 'Name of the exported file';
COMMENT ON COLUMN payroll_exports.file_path IS 'Path to the stored export file';
COMMENT ON COLUMN payroll_exports.file_size IS 'Size of the export file in bytes';
COMMENT ON COLUMN payroll_exports.total_records IS 'Number of records in the export';
COMMENT ON COLUMN payroll_exports.total_amount IS 'Total amount in the export';
COMMENT ON COLUMN payroll_exports.status IS 'Current status of the export';
COMMENT ON COLUMN payroll_exports.started_at IS 'Timestamp when export processing started';
COMMENT ON COLUMN payroll_exports.completed_at IS 'Timestamp when export was completed';
COMMENT ON COLUMN payroll_exports.error_message IS 'Error message if export failed';
COMMENT ON COLUMN payroll_exports.exported_by IS 'User who initiated the export';
COMMENT ON COLUMN payroll_exports.export_parameters IS 'JSON configuration used for the export';
COMMENT ON COLUMN payroll_exports.checksum IS 'File checksum for integrity verification';
COMMENT ON COLUMN payroll_exports.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN payroll_exports.updated_at IS 'Record last update timestamp';
