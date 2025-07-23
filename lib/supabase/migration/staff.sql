-- Staff Table Schema
-- This table manages staff members in the system

-- Create the staff table
CREATE TABLE IF NOT EXISTS staff (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign key to auth.users
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Staff information
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  
  -- Employment details
  department VARCHAR(100),
  position VARCHAR(100),
  hire_date DATE,
  employment_status VARCHAR(20) DEFAULT 'active' CHECK (employment_status IN ('active', 'inactive', 'terminated', 'on_leave')),
  
  -- Hierarchy
  supervisor_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  
  -- Housing eligibility
  housing_eligible BOOLEAN DEFAULT false,
  
  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_employee_id ON staff(employee_id);
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);
CREATE INDEX IF NOT EXISTS idx_staff_department ON staff(department);
CREATE INDEX IF NOT EXISTS idx_staff_supervisor_id ON staff(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_staff_employment_status ON staff(employment_status);
CREATE INDEX IF NOT EXISTS idx_staff_housing_eligible ON staff(housing_eligible);

-- Update trigger function
CREATE OR REPLACE FUNCTION update_staff_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create trigger
DROP TRIGGER IF EXISTS update_staff_updated_at ON staff;
CREATE TRIGGER update_staff_updated_at 
    BEFORE UPDATE ON staff 
    FOR EACH ROW 
    EXECUTE FUNCTION update_staff_updated_at();

-- Enable Row Level Security
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Policy: Allow administrators to manage all staff
CREATE POLICY "Administrators can manage all staff" ON staff
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'Administrator'
        )
    );

-- Policy: Allow HR staff to manage all staff
CREATE POLICY "HR staff can manage all staff" ON staff
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'HR'
        )
    );

-- Policy: Allow staff to view their own record
CREATE POLICY "Staff can view their own record" ON staff
    FOR SELECT USING (user_id = auth.uid());

-- Policy: Allow staff to update limited fields in their own record
CREATE POLICY "Staff can update their own limited fields" ON staff
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (
        -- Staff can only update phone and emergency contact info
        OLD.employee_id = NEW.employee_id AND
        OLD.first_name = NEW.first_name AND
        OLD.last_name = NEW.last_name AND
        OLD.email = NEW.email AND
        OLD.department = NEW.department AND
        OLD.position = NEW.position AND
        OLD.hire_date = NEW.hire_date AND
        OLD.employment_status = NEW.employment_status AND
        OLD.supervisor_id = NEW.supervisor_id AND
        OLD.housing_eligible = NEW.housing_eligible
    );

-- Policy: Allow supervisors to view their direct reports
CREATE POLICY "Supervisors can view direct reports" ON staff
    FOR SELECT USING (
        supervisor_id IN (
            SELECT id FROM staff WHERE user_id = auth.uid()
        )
    );

-- Policy: Allow managers to view staff in their department
CREATE POLICY "Managers can view department staff" ON staff
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM staff s
            WHERE s.user_id = auth.uid()
            AND s.department = staff.department
            AND EXISTS (
                SELECT 1 FROM auth.users 
                WHERE auth.users.id = auth.uid() 
                AND auth.users.raw_user_meta_data->>'role' IN ('Manager', 'Department Head')
            )
        )
    );

-- Grant necessary permissions
GRANT ALL ON staff TO authenticated;
GRANT USAGE ON SEQUENCE staff_id_seq TO authenticated;

-- Comments for documentation
COMMENT ON TABLE staff IS 'Staff members and their employment information';
COMMENT ON COLUMN staff.id IS 'Unique identifier for the staff member';
COMMENT ON COLUMN staff.user_id IS 'Reference to auth.users for authentication';
COMMENT ON COLUMN staff.employee_id IS 'Unique employee identifier';
COMMENT ON COLUMN staff.first_name IS 'Staff member first name';
COMMENT ON COLUMN staff.last_name IS 'Staff member last name';
COMMENT ON COLUMN staff.email IS 'Staff member email address';
COMMENT ON COLUMN staff.phone IS 'Staff member phone number';
COMMENT ON COLUMN staff.department IS 'Department the staff member belongs to';
COMMENT ON COLUMN staff.position IS 'Job position/title';
COMMENT ON COLUMN staff.hire_date IS 'Date when staff member was hired';
COMMENT ON COLUMN staff.employment_status IS 'Current employment status';
COMMENT ON COLUMN staff.supervisor_id IS 'Reference to supervisor (another staff member)';
COMMENT ON COLUMN staff.housing_eligible IS 'Whether staff member is eligible for company housing';
COMMENT ON COLUMN staff.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN staff.updated_at IS 'Record last update timestamp';
