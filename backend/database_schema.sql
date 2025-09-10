-- Krishi Jyoti Database Schema for Supabase (Anonymous Queries)
-- Run these SQL commands in your Supabase SQL editor

-- Queries table (no user references)
CREATE TABLE queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_text TEXT,
    query_type VARCHAR NOT NULL CHECK (query_type IN ('voice', 'text', 'image')),
    language VARCHAR DEFAULT 'english',
    farmer_name VARCHAR, -- Optional farmer name
    phone VARCHAR, -- Optional phone for follow-up
    location VARCHAR,
    district VARCHAR,
    state VARCHAR,
    crop_type VARCHAR,
    season VARCHAR,
    farm_size VARCHAR,
    farming_type VARCHAR, -- organic, conventional, etc.
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'escalated', 'failed')),
    response_text TEXT,
    confidence_score FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback table (simplified)
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_id UUID REFERENCES queries(id) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    is_helpful BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Escalations table (simplified)
CREATE TABLE escalations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_id UUID REFERENCES queries(id) NOT NULL,
    reason TEXT NOT NULL,
    priority VARCHAR DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    agri_officer_notes TEXT,
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Notifications table (anonymous system)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR DEFAULT 'info' CHECK (notification_type IN ('info', 'warning', 'alert')),
    farmer_phone VARCHAR, -- Optional for anonymous notifications
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_queries_status ON queries(status);
CREATE INDEX idx_queries_created_at ON queries(created_at);
CREATE INDEX idx_queries_phone ON queries(phone); -- For optional phone lookup
CREATE INDEX idx_feedback_query_id ON feedback(query_id);
CREATE INDEX idx_escalations_status ON escalations(status);
CREATE INDEX idx_notifications_farmer_phone ON notifications(farmer_phone);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_queries_updated_at BEFORE UPDATE ON queries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
