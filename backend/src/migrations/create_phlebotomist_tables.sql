-- Phlebotomists table (if not exists in main schema)
CREATE TABLE IF NOT EXISTS phlebotomists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(100),
    vehicle_type VARCHAR(50),
    current_location_lat DECIMAL(10, 8),
    current_location_lng DECIMAL(11, 8),
    availability_status VARCHAR(50) CHECK (availability_status IN ('available', 'busy', 'offline', 'on_break')) DEFAULT 'offline',
    max_bookings_per_day INTEGER DEFAULT 10,
    current_bookings_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock items table
CREATE TABLE IF NOT EXISTS stock_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_name VARCHAR(255) NOT NULL,
    item_type VARCHAR(50) CHECK (item_type IN ('syringe', 'needle', 'tube', 'bandage', 'alcohol_swab', 'other')),
    unit VARCHAR(50) DEFAULT 'piece',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Phlebotomist stock table (using existing schema structure)
-- Note: The schema already has phlebotomist_stock table, this is for reference
-- If using existing schema, stock table has: phlebotomist_id, item_name, item_type, quantity

-- Phlebotomist assignments table
CREATE TABLE IF NOT EXISTS phlebotomist_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    phlebotomist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id),
    status VARCHAR(50) CHECK (status IN ('assigned', 'accepted', 'rejected', 'completed')) DEFAULT 'assigned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Booking status logs
CREATE TABLE IF NOT EXISTS booking_status_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    updated_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_phlebotomists_user_id ON phlebotomists(user_id);
CREATE INDEX idx_phlebotomists_status ON phlebotomists(availability_status);
CREATE INDEX idx_phlebotomist_stock_phleb_id ON phlebotomist_stock(phlebotomist_id);
CREATE INDEX idx_phlebotomist_assignments_booking_id ON phlebotomist_assignments(booking_id);
CREATE INDEX idx_phlebotomist_assignments_phleb_id ON phlebotomist_assignments(phlebotomist_id);
CREATE INDEX idx_booking_status_logs_booking_id ON booking_status_logs(booking_id);

-- Triggers
CREATE TRIGGER update_phlebotomists_updated_at 
BEFORE UPDATE ON phlebotomists 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_phlebotomist_stock_updated_at 
BEFORE UPDATE ON phlebotomist_stock 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_phlebotomist_assignments_updated_at 
BEFORE UPDATE ON phlebotomist_assignments 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
