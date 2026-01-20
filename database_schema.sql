-- =====================================================
-- PICKMYLAB HEALTHCARE PLATFORM - DATABASE SCHEMA
-- PostgreSQL Database Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USER MANAGEMENT & AUTHENTICATION
-- =====================================================

-- Users table (patients, admins, phlebotomists, lab staff)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('patient', 'admin', 'ops', 'support', 'phlebotomist', 'lab_staff', 'rider')),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),
    blood_type VARCHAR(10),
    profile_image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User addresses (for collection points)
CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_type VARCHAR(50) CHECK (address_type IN ('home', 'office', 'other')),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'UAE',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User medical information
CREATE TABLE user_medical_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    allergies TEXT,
    medications TEXT,
    chronic_conditions TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User notification preferences
CREATE TABLE user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    whatsapp_enabled BOOLEAN DEFAULT FALSE,
    booking_confirmation BOOLEAN DEFAULT TRUE,
    phlebotomist_assigned BOOLEAN DEFAULT TRUE,
    sample_collected BOOLEAN DEFAULT TRUE,
    report_ready BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. LAB PARTNERS & TEST CATALOG
-- =====================================================

-- Lab partners (vendors)
CREATE TABLE lab_partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    service_zones TEXT[], -- Array of service zones
    is_active BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3, 2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    commission_percentage DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test categories
CREATE TABLE test_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tests master catalog
CREATE TABLE tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    category_id UUID REFERENCES test_categories(id),
    description TEXT,
    sample_type VARCHAR(50) CHECK (sample_type IN ('blood', 'urine', 'stool', 'saliva', 'other')),
    fasting_required BOOLEAN DEFAULT FALSE,
    special_instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lab partner test pricing
CREATE TABLE lab_test_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lab_partner_id UUID NOT NULL REFERENCES lab_partners(id) ON DELETE CASCADE,
    test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    price DECIMAL(10, 2) NOT NULL,
    turnaround_time_hours INTEGER, -- TAT in hours
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lab_partner_id, test_id)
);

-- Test bundles/packages
CREATE TABLE test_bundles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES test_categories(id),
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bundle test mappings
CREATE TABLE bundle_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bundle_id UUID NOT NULL REFERENCES test_bundles(id) ON DELETE CASCADE,
    test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(bundle_id, test_id)
);

-- =====================================================
-- 3. BOOKINGS & ORDERS
-- =====================================================

-- Bookings
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    collection_address_id UUID REFERENCES user_addresses(id),
    collection_type VARCHAR(50) CHECK (collection_type IN ('home', 'walk_in')),
    preferred_date DATE NOT NULL,
    preferred_time_slot VARCHAR(50),
    special_requirements TEXT,
    total_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    final_amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method VARCHAR(50),
    payment_transaction_id VARCHAR(255),
    booking_status VARCHAR(50) CHECK (booking_status IN ('pending', 'confirmed', 'in_progress', 'sample_collected', 'sample_delivered', 'processing', 'completed', 'cancelled')) DEFAULT 'pending',
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP,
    phlebotomist_id UUID REFERENCES users(id),
    lab_partner_id UUID REFERENCES lab_partners(id),
    assigned_at TIMESTAMP,
    sample_collected_at TIMESTAMP,
    sample_delivered_at TIMESTAMP,
    report_ready_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Booking tests (many-to-many)
CREATE TABLE booking_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    test_id UUID NOT NULL REFERENCES tests(id),
    lab_partner_id UUID NOT NULL REFERENCES lab_partners(id),
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Booking bundles
CREATE TABLE booking_bundles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    bundle_id UUID NOT NULL REFERENCES test_bundles(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. PHLEBOTOMISTS & COLLECTION
-- =====================================================

-- Phlebotomist profiles
CREATE TABLE phlebotomist_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE,
    certification_number VARCHAR(100),
    certification_expiry_date DATE,
    license_number VARCHAR(100),
    license_expiry_date DATE,
    service_zones TEXT[],
    is_available BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3, 2) DEFAULT 0.0,
    total_bookings INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Phlebotomist assignments
CREATE TABLE phlebotomist_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    phlebotomist_id UUID NOT NULL REFERENCES users(id),
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) CHECK (status IN ('assigned', 'accepted', 'in_transit', 'arrived', 'collecting', 'completed', 'cancelled')) DEFAULT 'assigned',
    estimated_arrival_time TIMESTAMP,
    actual_arrival_time TIMESTAMP,
    collection_started_at TIMESTAMP,
    collection_completed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Phlebotomist stock tracking
CREATE TABLE phlebotomist_stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phlebotomist_id UUID NOT NULL REFERENCES users(id),
    item_name VARCHAR(255) NOT NULL,
    item_type VARCHAR(50) CHECK (item_type IN ('needle', 'syringe', 'tube', 'bandage', 'alcohol_swab', 'other')),
    quantity INTEGER NOT NULL,
    unit VARCHAR(50),
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock consumption log
CREATE TABLE stock_consumption_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phlebotomist_id UUID NOT NULL REFERENCES users(id),
    booking_id UUID REFERENCES bookings(id),
    item_id UUID REFERENCES phlebotomist_stock(id),
    quantity_used INTEGER NOT NULL,
    consumed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. SAMPLE DELIVERY & LOGISTICS
-- =====================================================

-- Riders/delivery personnel
CREATE TABLE rider_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE,
    vehicle_type VARCHAR(50),
    vehicle_number VARCHAR(50),
    license_number VARCHAR(100),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample deliveries
CREATE TABLE sample_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    rider_id UUID REFERENCES users(id),
    pickup_location TEXT,
    delivery_location TEXT,
    pickup_time TIMESTAMP,
    delivery_time TIMESTAMP,
    status VARCHAR(50) CHECK (status IN ('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed')) DEFAULT 'pending',
    temperature_maintained BOOLEAN,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 6. LAB REPORTS & RESULTS
-- =====================================================

-- Lab reports
CREATE TABLE lab_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    lab_partner_id UUID NOT NULL REFERENCES lab_partners(id),
    report_number VARCHAR(100) UNIQUE NOT NULL,
    report_file_url TEXT,
    report_date DATE,
    status VARCHAR(50) CHECK (status IN ('pending', 'processing', 'ready', 'delivered')) DEFAULT 'pending',
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Report test results
CREATE TABLE report_test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES lab_reports(id) ON DELETE CASCADE,
    test_id UUID NOT NULL REFERENCES tests(id),
    parameter_name VARCHAR(255) NOT NULL,
    result_value VARCHAR(255),
    unit VARCHAR(50),
    reference_range VARCHAR(255),
    status VARCHAR(50) CHECK (status IN ('normal', 'abnormal', 'critical', 'borderline')) DEFAULT 'normal',
    flagged BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Smart reports (converted reports with insights)
CREATE TABLE smart_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES lab_reports(id) ON DELETE CASCADE,
    body_system_analysis JSONB, -- Interactive body diagram data
    health_insights TEXT,
    recommendations JSONB, -- Dietary, lifestyle, medical recommendations
    trend_analysis JSONB, -- Comparison with previous reports
    organ_system_status JSONB, -- Status of each organ system
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 7. ADMIN & OPERATIONS
-- =====================================================

-- Admin roles and permissions
CREATE TABLE admin_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    permissions JSONB, -- JSON object with permission flags
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User roles assignment
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(id),
    UNIQUE(user_id, role_id)
);

-- Audit logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System notifications
CREATE TABLE system_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id), -- NULL for broadcast notifications
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    channel VARCHAR(50) CHECK (channel IN ('email', 'sms', 'push', 'whatsapp', 'in_app')),
    status VARCHAR(50) CHECK (status IN ('pending', 'sent', 'failed', 'delivered')) DEFAULT 'pending',
    sent_at TIMESTAMP,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 8. CONTENT MANAGEMENT
-- =====================================================

-- FAQs
CREATE TABLE faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Terms and conditions
CREATE TABLE terms_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    effective_from DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 9. RATINGS & FEEDBACK
-- =====================================================

-- Ratings and reviews
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id),
    user_id UUID NOT NULL REFERENCES users(id),
    rated_entity_type VARCHAR(50) CHECK (rated_entity_type IN ('phlebotomist', 'lab_partner', 'rider', 'service')),
    rated_entity_id UUID NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 10. INDEXES FOR PERFORMANCE
-- =====================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Booking indexes
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_bookings_phlebotomist_id ON bookings(phlebotomist_id);
CREATE INDEX idx_bookings_lab_partner_id ON bookings(lab_partner_id);
CREATE INDEX idx_bookings_preferred_date ON bookings(preferred_date);
CREATE INDEX idx_bookings_booking_number ON bookings(booking_number);

-- Test indexes
CREATE INDEX idx_tests_category_id ON tests(category_id);
CREATE INDEX idx_tests_code ON tests(code);
CREATE INDEX idx_lab_test_pricing_lab_id ON lab_test_pricing(lab_partner_id);
CREATE INDEX idx_lab_test_pricing_test_id ON lab_test_pricing(test_id);

-- Report indexes
CREATE INDEX idx_lab_reports_booking_id ON lab_reports(booking_id);
CREATE INDEX idx_lab_reports_lab_partner_id ON lab_reports(lab_partner_id);
CREATE INDEX idx_smart_reports_report_id ON smart_reports(report_id);

-- Notification indexes
CREATE INDEX idx_notifications_user_id ON system_notifications(user_id);
CREATE INDEX idx_notifications_status ON system_notifications(status);

-- Audit log indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- =====================================================
-- 11. TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_addresses_updated_at BEFORE UPDATE ON user_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_medical_info_updated_at BEFORE UPDATE ON user_medical_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_notification_preferences_updated_at BEFORE UPDATE ON user_notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lab_partners_updated_at BEFORE UPDATE ON lab_partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_test_categories_updated_at BEFORE UPDATE ON test_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tests_updated_at BEFORE UPDATE ON tests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lab_test_pricing_updated_at BEFORE UPDATE ON lab_test_pricing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_test_bundles_updated_at BEFORE UPDATE ON test_bundles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_phlebotomist_profiles_updated_at BEFORE UPDATE ON phlebotomist_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_phlebotomist_assignments_updated_at BEFORE UPDATE ON phlebotomist_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_phlebotomist_stock_updated_at BEFORE UPDATE ON phlebotomist_stock FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rider_profiles_updated_at BEFORE UPDATE ON rider_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sample_deliveries_updated_at BEFORE UPDATE ON sample_deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lab_reports_updated_at BEFORE UPDATE ON lab_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_smart_reports_updated_at BEFORE UPDATE ON smart_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_roles_updated_at BEFORE UPDATE ON admin_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
