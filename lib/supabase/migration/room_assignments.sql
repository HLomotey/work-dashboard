-- Room Assignments Table Schema
-- This table manages staff room assignments in the housing management system

-- Create the room_assignments table
CREATE TABLE IF NOT EXISTS room_assignments (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign keys
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  
  -- Assignment dates
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NULL,
  
  -- Status
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'pending', 'completed', 'cancelled')),
  
  -- Move dates (optional)
  move_in_date TIMESTAMPTZ NULL,
  move_out_date TIMESTAMPTZ NULL,
  
  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_room_assignments_room_id ON room_assignments(room_id);
CREATE INDEX IF NOT EXISTS idx_room_assignments_staff_id ON room_assignments(staff_id);
CREATE INDEX IF NOT EXISTS idx_room_assignments_status ON room_assignments(status);
CREATE INDEX IF NOT EXISTS idx_room_assignments_dates ON room_assignments(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_room_assignments_active ON room_assignments(status, start_date) WHERE status = 'active';

-- Business rule constraints
ALTER TABLE room_assignments 
ADD CONSTRAINT IF NOT EXISTS chk_end_date_after_start 
CHECK (end_date IS NULL OR end_date >= start_date);

ALTER TABLE room_assignments 
ADD CONSTRAINT IF NOT EXISTS chk_move_in_after_start 
CHECK (move_in_date IS NULL OR move_in_date >= start_date);

ALTER TABLE room_assignments 
ADD CONSTRAINT IF NOT EXISTS chk_move_out_before_end 
CHECK (move_out_date IS NULL OR end_date IS NULL OR move_out_date <= end_date);

-- Prevent overlapping active assignments for the same room
CREATE UNIQUE INDEX IF NOT EXISTS idx_room_assignments_no_overlap 
ON room_assignments(room_id, start_date, end_date) 
WHERE status IN ('active', 'pending');

-- Update trigger function
CREATE OR REPLACE FUNCTION update_room_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create trigger
DROP TRIGGER IF EXISTS update_room_assignments_updated_at ON room_assignments;
CREATE TRIGGER update_room_assignments_updated_at 
    BEFORE UPDATE ON room_assignments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_room_assignments_updated_at();

-- Enable Row Level Security
ALTER TABLE room_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Policy: Allow administrators to manage all room assignments
CREATE POLICY "Administrators can manage all room assignments" ON room_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'Administrator'
        )
    );

-- Policy: Allow HR staff to manage all room assignments
CREATE POLICY "HR staff can manage all room assignments" ON room_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'HR'
        )
    );

-- Policy: Allow housing managers to manage all room assignments
CREATE POLICY "Housing managers can manage all room assignments" ON room_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'Housing Manager'
        )
    );

-- Policy: Allow staff to view their own room assignments
CREATE POLICY "Staff can view their own room assignments" ON room_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM staff 
            WHERE staff.id = room_assignments.staff_id 
            AND staff.user_id = auth.uid()
        )
    );

-- Policy: Allow staff to update their own assignment status (limited fields)
CREATE POLICY "Staff can update their own assignment status" ON room_assignments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM staff 
            WHERE staff.id = room_assignments.staff_id 
            AND staff.user_id = auth.uid()
        )
    ) WITH CHECK (
        -- Staff can only update move-in/move-out dates and limited status changes
        (OLD.status = 'pending' AND NEW.status = 'active') OR
        (OLD.status = 'active' AND NEW.status = 'completed') OR
        (OLD.move_in_date IS DISTINCT FROM NEW.move_in_date) OR
        (OLD.move_out_date IS DISTINCT FROM NEW.move_out_date)
    );

-- Policy: Allow supervisors to view assignments of their direct reports
CREATE POLICY "Supervisors can view direct reports assignments" ON room_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM staff s1
            JOIN staff s2 ON s2.supervisor_id = s1.id
            WHERE s1.user_id = auth.uid()
            AND s2.id = room_assignments.staff_id
        )
    );

-- Policy: Prevent deletion of active assignments (only allow status updates)
CREATE POLICY "Prevent deletion of active assignments" ON room_assignments
    FOR DELETE USING (
        status IN ('cancelled', 'completed') AND
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('Administrator', 'HR', 'Housing Manager')
        )
    );

-- Grant necessary permissions
GRANT ALL ON room_assignments TO authenticated;
GRANT USAGE ON SEQUENCE room_assignments_id_seq TO authenticated;

-- Comments for documentation
COMMENT ON TABLE room_assignments IS 'Manages staff room assignments in the housing system';
COMMENT ON COLUMN room_assignments.id IS 'Unique identifier for the room assignment';
COMMENT ON COLUMN room_assignments.room_id IS 'Reference to the assigned room';
COMMENT ON COLUMN room_assignments.staff_id IS 'Reference to the assigned staff member';
COMMENT ON COLUMN room_assignments.start_date IS 'Official assignment start date';
COMMENT ON COLUMN room_assignments.end_date IS 'Official assignment end date (optional for ongoing assignments)';
COMMENT ON COLUMN room_assignments.status IS 'Assignment status: active, pending, completed, cancelled';
COMMENT ON COLUMN room_assignments.move_in_date IS 'Actual move-in date (may differ from start_date)';
COMMENT ON COLUMN room_assignments.move_out_date IS 'Actual move-out date (may differ from end_date)';
COMMENT ON COLUMN room_assignments.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN room_assignments.updated_at IS 'Record last update timestamp';
