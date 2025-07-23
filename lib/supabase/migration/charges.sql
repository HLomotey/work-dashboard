-- Charges Table Schema
-- This table manages billing charges for staff members

-- Create the charges table
CREATE TABLE IF NOT EXISTS charges (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign keys
  billing_period_id UUID NOT NULL REFERENCES billing_periods(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  
  -- Charge details
  charge_type VARCHAR(50) NOT NULL CHECK (charge_type IN ('housing', 'meal', 'transport', 'other')),
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  
  -- Optional reference data
  reference_id UUID NULL, -- Can reference room_assignments, meal plans, etc.
  reference_type VARCHAR(50) NULL,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'disputed', 'cancelled', 'processed')),
  
  -- Dates
  charge_date DATE NOT NULL,
  due_date DATE NULL,
  
  -- Processing information
  processed_at TIMESTAMPTZ NULL,
  processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Notes
  notes TEXT NULL,
  
  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_charges_billing_period ON charges(billing_period_id);
CREATE INDEX IF NOT EXISTS idx_charges_staff_id ON charges(staff_id);
CREATE INDEX IF NOT EXISTS idx_charges_type ON charges(charge_type);
CREATE INDEX IF NOT EXISTS idx_charges_status ON charges(status);
CREATE INDEX IF NOT EXISTS idx_charges_date ON charges(charge_date);
CREATE INDEX IF NOT EXISTS idx_charges_reference ON charges(reference_id, reference_type);
CREATE INDEX IF NOT EXISTS idx_charges_processed_by ON charges(processed_by);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_charges_staff_period ON charges(staff_id, billing_period_id);
CREATE INDEX IF NOT EXISTS idx_charges_period_status ON charges(billing_period_id, status);

-- Business rule constraints
ALTER TABLE charges 
ADD CONSTRAINT IF NOT EXISTS chk_due_date_after_charge 
CHECK (due_date IS NULL OR due_date >= charge_date);

ALTER TABLE charges 
ADD CONSTRAINT IF NOT EXISTS chk_processed_fields_consistency 
CHECK (
  (processed_at IS NULL AND processed_by IS NULL) OR 
  (processed_at IS NOT NULL AND processed_by IS NOT NULL)
);

-- Update trigger function
CREATE OR REPLACE FUNCTION update_charges_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create trigger
DROP TRIGGER IF EXISTS update_charges_updated_at ON charges;
CREATE TRIGGER update_charges_updated_at 
    BEFORE UPDATE ON charges 
    FOR EACH ROW 
    EXECUTE FUNCTION update_charges_updated_at();

-- Trigger to set processed_at when status changes to processed
CREATE OR REPLACE FUNCTION set_charge_processed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'processed' AND OLD.status != 'processed' THEN
        NEW.processed_at = NOW();
        IF NEW.processed_by IS NULL THEN
            NEW.processed_by = auth.uid();
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS set_charge_processed_at ON charges;
CREATE TRIGGER set_charge_processed_at 
    BEFORE UPDATE ON charges 
    FOR EACH ROW 
    EXECUTE FUNCTION set_charge_processed_at();

-- Enable Row Level Security
ALTER TABLE charges ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Policy: Allow administrators to manage all charges
CREATE POLICY "Administrators can manage all charges" ON charges
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'Administrator'
        )
    );

-- Policy: Allow HR and Finance staff to manage all charges
CREATE POLICY "HR and Finance can manage all charges" ON charges
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('HR', 'Finance', 'Payroll')
        )
    );

-- Policy: Allow Housing Managers to manage housing charges
CREATE POLICY "Housing Managers can manage housing charges" ON charges
    FOR ALL USING (
        charge_type = 'housing' AND
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'Housing Manager'
        )
    );

-- Policy: Allow managers to view charges for their department staff
CREATE POLICY "Managers can view department charges" ON charges
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM staff s1
            JOIN staff s2 ON s2.department = s1.department
            WHERE s1.user_id = auth.uid()
            AND s2.id = charges.staff_id
            AND EXISTS (
                SELECT 1 FROM auth.users 
                WHERE auth.users.id = auth.uid() 
                AND auth.users.raw_user_meta_data->>'role' IN ('Manager', 'Department Head')
            )
        )
    );

-- Policy: Allow staff to view their own charges
CREATE POLICY "Staff can view their own charges" ON charges
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM staff 
            WHERE staff.id = charges.staff_id 
            AND staff.user_id = auth.uid()
        )
    );

-- Policy: Allow staff to dispute their own charges (update status only)
CREATE POLICY "Staff can dispute their own charges" ON charges
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM staff 
            WHERE staff.id = charges.staff_id 
            AND staff.user_id = auth.uid()
        )
    )
    WITH CHECK (
        -- Staff can only change status to disputed and add notes
        OLD.billing_period_id = NEW.billing_period_id AND
        OLD.staff_id = NEW.staff_id AND
        OLD.charge_type = NEW.charge_type AND
        OLD.description = NEW.description AND
        OLD.amount = NEW.amount AND
        OLD.reference_id = NEW.reference_id AND
        OLD.reference_type = NEW.reference_type AND
        OLD.charge_date = NEW.charge_date AND
        OLD.due_date = NEW.due_date AND
        (NEW.status = 'disputed' OR NEW.status = OLD.status) AND
        OLD.processed_at = NEW.processed_at AND
        OLD.processed_by = NEW.processed_by
    );

-- Policy: Prevent deletion of processed charges
CREATE POLICY "Prevent deletion of processed charges" ON charges
    FOR DELETE USING (
        status != 'processed' AND
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('Administrator', 'HR', 'Finance')
        )
    );

-- Grant necessary permissions
GRANT ALL ON charges TO authenticated;
GRANT USAGE ON SEQUENCE charges_id_seq TO authenticated;

-- Comments for documentation
COMMENT ON TABLE charges IS 'Billing charges for staff members across different categories';
COMMENT ON COLUMN charges.id IS 'Unique identifier for the charge';
COMMENT ON COLUMN charges.billing_period_id IS 'Reference to the billing period';
COMMENT ON COLUMN charges.staff_id IS 'Reference to the staff member being charged';
COMMENT ON COLUMN charges.charge_type IS 'Type of charge (housing, meal, transport, other)';
COMMENT ON COLUMN charges.description IS 'Description of the charge';
COMMENT ON COLUMN charges.amount IS 'Charge amount in currency';
COMMENT ON COLUMN charges.reference_id IS 'Optional reference to related record';
COMMENT ON COLUMN charges.reference_type IS 'Type of referenced record';
COMMENT ON COLUMN charges.status IS 'Current status of the charge';
COMMENT ON COLUMN charges.charge_date IS 'Date when the charge was incurred';
COMMENT ON COLUMN charges.due_date IS 'Optional due date for payment';
COMMENT ON COLUMN charges.processed_at IS 'Timestamp when charge was processed';
COMMENT ON COLUMN charges.processed_by IS 'User who processed the charge';
COMMENT ON COLUMN charges.notes IS 'Additional notes or comments';
COMMENT ON COLUMN charges.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN charges.updated_at IS 'Record last update timestamp';
