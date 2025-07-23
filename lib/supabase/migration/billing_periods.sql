-- Billing Periods Table Schema
-- This table manages billing periods for payroll deductions

-- Create the billing_periods table
CREATE TABLE IF NOT EXISTS billing_periods (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Period dates
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'exported', 'cancelled')),
  
  -- Export information
  payroll_export_date TIMESTAMPTZ NULL,
  
  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_billing_periods_dates ON billing_periods(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_billing_periods_status ON billing_periods(status);
CREATE INDEX IF NOT EXISTS idx_billing_periods_export_date ON billing_periods(payroll_export_date);

-- Business rule constraints
ALTER TABLE billing_periods 
ADD CONSTRAINT IF NOT EXISTS chk_end_date_after_start 
CHECK (end_date > start_date);

ALTER TABLE billing_periods 
ADD CONSTRAINT IF NOT EXISTS chk_export_date_after_end 
CHECK (payroll_export_date IS NULL OR payroll_export_date >= end_date);

-- Prevent overlapping billing periods
CREATE UNIQUE INDEX IF NOT EXISTS idx_billing_periods_no_overlap 
ON billing_periods(start_date, end_date) 
WHERE status != 'cancelled';

-- Update trigger function
CREATE OR REPLACE FUNCTION update_billing_periods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create trigger
DROP TRIGGER IF EXISTS update_billing_periods_updated_at ON billing_periods;
CREATE TRIGGER update_billing_periods_updated_at 
    BEFORE UPDATE ON billing_periods 
    FOR EACH ROW 
    EXECUTE FUNCTION update_billing_periods_updated_at();

-- Enable Row Level Security
ALTER TABLE billing_periods ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Policy: Allow administrators to manage all billing periods
CREATE POLICY "Administrators can manage all billing periods" ON billing_periods
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'Administrator'
        )
    );

-- Policy: Allow HR and Finance staff to manage all billing periods
CREATE POLICY "HR and Finance can manage all billing periods" ON billing_periods
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('HR', 'Finance', 'Payroll')
        )
    );

-- Policy: Allow managers to view billing periods (read-only)
CREATE POLICY "Managers can view billing periods" ON billing_periods
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('Manager', 'Department Head')
        )
    );

-- Policy: Allow staff to view completed billing periods that affect them
CREATE POLICY "Staff can view relevant completed billing periods" ON billing_periods
    FOR SELECT USING (
        status IN ('completed', 'exported') AND
        EXISTS (
            SELECT 1 FROM charges c
            JOIN staff s ON s.id = c.staff_id
            WHERE c.billing_period_id = billing_periods.id
            AND s.user_id = auth.uid()
        )
    );

-- Policy: Prevent deletion of processed billing periods
CREATE POLICY "Prevent deletion of processed billing periods" ON billing_periods
    FOR DELETE USING (
        status IN ('draft', 'cancelled') AND
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('Administrator', 'HR', 'Finance')
        )
    );

-- Grant necessary permissions
GRANT ALL ON billing_periods TO authenticated;
GRANT USAGE ON SEQUENCE billing_periods_id_seq TO authenticated;

-- Comments for documentation
COMMENT ON TABLE billing_periods IS 'Billing periods for payroll deductions and charges';
COMMENT ON COLUMN billing_periods.id IS 'Unique identifier for the billing period';
COMMENT ON COLUMN billing_periods.start_date IS 'Start date of the billing period';
COMMENT ON COLUMN billing_periods.end_date IS 'End date of the billing period';
COMMENT ON COLUMN billing_periods.status IS 'Current status of the billing period';
COMMENT ON COLUMN billing_periods.payroll_export_date IS 'Date when data was exported to payroll system';
COMMENT ON COLUMN billing_periods.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN billing_periods.updated_at IS 'Record last update timestamp';
