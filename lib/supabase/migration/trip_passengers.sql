-- Trip Passengers Table Schema
-- This table manages passengers assigned to transport trips

-- Create the trip_passengers table
CREATE TABLE IF NOT EXISTS trip_passengers (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign keys
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  
  -- Location details
  pickup_location VARCHAR(255) NULL,
  dropoff_location VARCHAR(255) NULL,
  
  -- Passenger status
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'no_show', 'completed')),
  
  -- Boarding information
  boarded_at TIMESTAMPTZ NULL,
  dropped_off_at TIMESTAMPTZ NULL,
  
  -- Special requirements
  special_requirements TEXT NULL,
  
  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trip_passengers_trip_id ON trip_passengers(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_passengers_staff_id ON trip_passengers(staff_id);
CREATE INDEX IF NOT EXISTS idx_trip_passengers_status ON trip_passengers(status);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_trip_passengers_trip_status ON trip_passengers(trip_id, status);
CREATE INDEX IF NOT EXISTS idx_trip_passengers_staff_status ON trip_passengers(staff_id, status);

-- Unique constraint to prevent duplicate passenger assignments
CREATE UNIQUE INDEX IF NOT EXISTS idx_trip_passengers_unique_assignment 
ON trip_passengers(trip_id, staff_id) 
WHERE status != 'cancelled';

-- Business rule constraints
ALTER TABLE trip_passengers 
ADD CONSTRAINT IF NOT EXISTS chk_dropoff_after_boarding 
CHECK (dropped_off_at IS NULL OR boarded_at IS NULL OR dropped_off_at >= boarded_at);

-- Update trigger function
CREATE OR REPLACE FUNCTION update_trip_passengers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create trigger
DROP TRIGGER IF EXISTS update_trip_passengers_updated_at ON trip_passengers;
CREATE TRIGGER update_trip_passengers_updated_at 
    BEFORE UPDATE ON trip_passengers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_trip_passengers_updated_at();

-- Trigger to automatically set timestamps based on status
CREATE OR REPLACE FUNCTION set_trip_passenger_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    -- Set boarded_at when status changes to completed (if not already set)
    IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.boarded_at IS NULL THEN
        NEW.boarded_at = NOW();
    END IF;
    
    -- Set dropped_off_at when status changes to completed
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.dropped_off_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS set_trip_passenger_timestamps ON trip_passengers;
CREATE TRIGGER set_trip_passenger_timestamps 
    BEFORE UPDATE ON trip_passengers 
    FOR EACH ROW 
    EXECUTE FUNCTION set_trip_passenger_timestamps();

-- Enable Row Level Security
ALTER TABLE trip_passengers ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Policy: Allow administrators to manage all trip passengers
CREATE POLICY "Administrators can manage all trip passengers" ON trip_passengers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'Administrator'
        )
    );

-- Policy: Allow Transport Managers to manage all trip passengers
CREATE POLICY "Transport Managers can manage all trip passengers" ON trip_passengers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'Transport Manager'
        )
    );

-- Policy: Allow HR staff to manage all trip passengers
CREATE POLICY "HR can manage all trip passengers" ON trip_passengers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'HR'
        )
    );

-- Policy: Allow drivers to view and update passengers for their assigned trips
CREATE POLICY "Drivers can manage passengers for their trips" ON trip_passengers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM trips t
            JOIN staff s ON s.id = t.driver_id
            WHERE t.id = trip_passengers.trip_id
            AND s.user_id = auth.uid()
        )
    );

-- Policy: Allow staff to view their own trip passenger records
CREATE POLICY "Staff can view their own trip records" ON trip_passengers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM staff 
            WHERE staff.id = trip_passengers.staff_id 
            AND staff.user_id = auth.uid()
        )
    );

-- Policy: Allow staff to update limited fields in their own records
CREATE POLICY "Staff can update their own trip details" ON trip_passengers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM staff 
            WHERE staff.id = trip_passengers.staff_id 
            AND staff.user_id = auth.uid()
        )
    )
    WITH CHECK (
        -- Staff can only update pickup/dropoff locations and special requirements
        OLD.trip_id = NEW.trip_id AND
        OLD.staff_id = NEW.staff_id AND
        OLD.status = NEW.status AND
        OLD.boarded_at = NEW.boarded_at AND
        OLD.dropped_off_at = NEW.dropped_off_at
    );

-- Policy: Allow managers to view trip passengers for their department staff
CREATE POLICY "Managers can view department trip passengers" ON trip_passengers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM staff s1
            JOIN staff s2 ON s2.department = s1.department
            WHERE s1.user_id = auth.uid()
            AND s2.id = trip_passengers.staff_id
            AND EXISTS (
                SELECT 1 FROM auth.users 
                WHERE auth.users.id = auth.uid() 
                AND auth.users.raw_user_meta_data->>'role' IN ('Manager', 'Department Head')
            )
        )
    );

-- Policy: Prevent deletion of completed trips
CREATE POLICY "Prevent deletion of completed trip passengers" ON trip_passengers
    FOR DELETE USING (
        status != 'completed' AND
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('Administrator', 'Transport Manager', 'HR')
        )
    );

-- Grant necessary permissions
GRANT ALL ON trip_passengers TO authenticated;
GRANT USAGE ON SEQUENCE trip_passengers_id_seq TO authenticated;

-- Comments for documentation
COMMENT ON TABLE trip_passengers IS 'Passengers assigned to transport trips';
COMMENT ON COLUMN trip_passengers.id IS 'Unique identifier for the trip passenger record';
COMMENT ON COLUMN trip_passengers.trip_id IS 'Reference to the transport trip';
COMMENT ON COLUMN trip_passengers.staff_id IS 'Reference to the staff member passenger';
COMMENT ON COLUMN trip_passengers.pickup_location IS 'Specific pickup location for this passenger';
COMMENT ON COLUMN trip_passengers.dropoff_location IS 'Specific dropoff location for this passenger';
COMMENT ON COLUMN trip_passengers.status IS 'Current status of the passenger assignment';
COMMENT ON COLUMN trip_passengers.boarded_at IS 'Timestamp when passenger boarded the vehicle';
COMMENT ON COLUMN trip_passengers.dropped_off_at IS 'Timestamp when passenger was dropped off';
COMMENT ON COLUMN trip_passengers.special_requirements IS 'Any special requirements or notes for this passenger';
COMMENT ON COLUMN trip_passengers.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN trip_passengers.updated_at IS 'Record last update timestamp';
