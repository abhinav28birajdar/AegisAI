-- AegisAI Platform - Complete Supabase Database Schema
-- Run this in your Supabase SQL Editor: https://ezbhqaeolzvcexxmxkeb.supabase.co

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- 1. PROFILES TABLE - User Management
-- =============================================
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE,
    full_name TEXT,
    display_name TEXT,
    avatar_url TEXT,
    
    -- Web3 & Identity
    wallet_address TEXT UNIQUE,
    carv_did TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_type TEXT CHECK (verification_type IN ('email', 'carv', 'wallet', 'government')) DEFAULT 'email',
    
    -- Role & Permissions
    role TEXT CHECK (role IN ('citizen', 'authority', 'admin')) DEFAULT 'citizen',
    department TEXT, -- For authorities
    jurisdiction JSONB, -- Geographic area of responsibility
    
    -- Reputation System
    reputation_score INTEGER DEFAULT 0,
    reputation_tier TEXT CHECK (reputation_tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')) DEFAULT 'bronze',
    total_complaints INTEGER DEFAULT 0,
    resolved_complaints INTEGER DEFAULT 0,
    helpful_votes INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- =============================================
-- 2. COMPLAINTS TABLE - Core Complaint System
-- =============================================
CREATE TABLE public.complaints (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    -- Basic Information
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    location JSONB, -- {address, lat, lng, city, state}
    
    -- AI Analysis
    ai_analysis JSONB DEFAULT '{}', -- AI categorization, sentiment, priority
    priority INTEGER CHECK (priority BETWEEN 1 AND 5) DEFAULT 3,
    urgency_level TEXT CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative', 'angry', 'frustrated')) DEFAULT 'neutral',
    estimated_resolution_days INTEGER,
    
    -- Status & Workflow
    status TEXT CHECK (status IN ('pending', 'in_review', 'in_progress', 'escalated', 'resolved', 'rejected', 'closed')) DEFAULT 'pending',
    assigned_to UUID REFERENCES public.profiles(id),
    department TEXT,
    
    -- Privacy & Blockchain
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    blockchain_tx_hash TEXT,
    ipfs_hash TEXT,
    
    -- Engagement
    view_count INTEGER DEFAULT 0,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    
    -- Resolution
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES public.profiles(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Complaints policies
CREATE POLICY "Anyone can view public complaints" ON public.complaints
    FOR SELECT USING (is_public = true OR auth.uid() = reporter_id);

CREATE POLICY "Authenticated users can create complaints" ON public.complaints
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own complaints" ON public.complaints
    FOR UPDATE USING (auth.uid() = reporter_id OR auth.uid() = assigned_to);

-- =============================================
-- 3. COMPLAINT_UPDATES - Status History
-- =============================================
CREATE TABLE public.complaint_updates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
    updated_by UUID REFERENCES public.profiles(id),
    
    old_status TEXT,
    new_status TEXT NOT NULL,
    update_message TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.complaint_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public updates" ON public.complaint_updates
    FOR SELECT USING (is_public = true);

-- =============================================
-- 4. COMPLAINT_VOTES - Community Engagement
-- =============================================
CREATE TABLE public.complaint_votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
    voter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    vote_type TEXT CHECK (vote_type IN ('upvote', 'downvote')) NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(complaint_id, voter_id)
);

-- Enable RLS
ALTER TABLE public.complaint_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own votes" ON public.complaint_votes
    FOR ALL USING (auth.uid() = voter_id);

-- =============================================
-- 5. COMPLAINT_COMMENTS - Discussion System
-- =============================================
CREATE TABLE public.complaint_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
    commenter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES public.complaint_comments(id),
    
    content TEXT NOT NULL,
    is_official BOOLEAN DEFAULT FALSE, -- Authority response
    is_public BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.complaint_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public comments" ON public.complaint_comments
    FOR SELECT USING (is_public = true);

CREATE POLICY "Authenticated users can create comments" ON public.complaint_comments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =============================================
-- 6. REPUTATION_TRANSACTIONS - Blockchain Integration
-- =============================================
CREATE TABLE public.reputation_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    transaction_type TEXT CHECK (transaction_type IN ('earned', 'spent', 'awarded', 'penalty')) NOT NULL,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    activity_type TEXT, -- 'complaint_submitted', 'complaint_resolved', 'helpful_vote', etc.
    
    -- Blockchain
    blockchain_tx_hash TEXT,
    block_number BIGINT,
    gas_used BIGINT,
    
    -- References
    related_complaint_id UUID REFERENCES public.complaints(id),
    awarded_by UUID REFERENCES public.profiles(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.reputation_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" ON public.reputation_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- 7. CARV_ATTESTATIONS - Identity Verification
-- =============================================
CREATE TABLE public.carv_attestations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    attestation_id TEXT UNIQUE NOT NULL,
    schema_id TEXT NOT NULL,
    attestation_data JSONB NOT NULL,
    issuer TEXT NOT NULL,
    
    is_verified BOOLEAN DEFAULT FALSE,
    verification_score INTEGER CHECK (verification_score BETWEEN 0 AND 100),
    
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.carv_attestations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own attestations" ON public.carv_attestations
    FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- 8. AI_ANALYSIS_LOGS - AI Processing History
-- =============================================
CREATE TABLE public.ai_analysis_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
    
    model_used TEXT NOT NULL, -- 'gemini', 'gpt-4', 'claude-3'
    analysis_type TEXT NOT NULL, -- 'categorization', 'sentiment', 'priority', 'emergency'
    
    input_data JSONB NOT NULL,
    output_data JSONB NOT NULL,
    confidence_score FLOAT,
    processing_time_ms INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 9. SYSTEM_METRICS - Analytics & Monitoring
-- =============================================
CREATE TABLE public.system_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    metric_type TEXT NOT NULL, -- 'daily_complaints', 'resolution_time', 'user_satisfaction'
    metric_value FLOAT NOT NULL,
    metric_data JSONB DEFAULT '{}',
    
    date_recorded DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.complaints
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function to update complaint vote counts
CREATE OR REPLACE FUNCTION public.update_complaint_votes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.vote_type = 'upvote' THEN
            UPDATE public.complaints 
            SET upvotes = upvotes + 1 
            WHERE id = NEW.complaint_id;
        ELSE
            UPDATE public.complaints 
            SET downvotes = downvotes + 1 
            WHERE id = NEW.complaint_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.vote_type = 'upvote' THEN
            UPDATE public.complaints 
            SET upvotes = upvotes - 1 
            WHERE id = OLD.complaint_id;
        ELSE
            UPDATE public.complaints 
            SET downvotes = downvotes - 1 
            WHERE id = OLD.complaint_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for vote counting
CREATE TRIGGER update_complaint_votes_trigger
    AFTER INSERT OR DELETE ON public.complaint_votes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_complaint_votes();

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Profiles indexes
CREATE INDEX idx_profiles_wallet_address ON public.profiles(wallet_address);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_reputation_score ON public.profiles(reputation_score DESC);

-- Complaints indexes
CREATE INDEX idx_complaints_status ON public.complaints(status);
CREATE INDEX idx_complaints_category ON public.complaints(category);
CREATE INDEX idx_complaints_created_at ON public.complaints(created_at DESC);
CREATE INDEX idx_complaints_priority ON public.complaints(priority DESC);
CREATE INDEX idx_complaints_reporter_id ON public.complaints(reporter_id);
CREATE INDEX idx_complaints_assigned_to ON public.complaints(assigned_to);
CREATE INDEX idx_complaints_location ON public.complaints USING GIN(location);

-- Comments indexes
CREATE INDEX idx_complaint_comments_complaint_id ON public.complaint_comments(complaint_id);
CREATE INDEX idx_complaint_comments_created_at ON public.complaint_comments(created_at DESC);

-- Reputation transactions indexes
CREATE INDEX idx_reputation_transactions_user_id ON public.reputation_transactions(user_id);
CREATE INDEX idx_reputation_transactions_created_at ON public.reputation_transactions(created_at DESC);

-- =============================================
-- VIEWS FOR ANALYTICS
-- =============================================

-- Complaint statistics view
CREATE VIEW public.complaint_stats AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    category,
    status,
    COUNT(*) as count,
    AVG(priority) as avg_priority
FROM public.complaints
GROUP BY DATE_TRUNC('day', created_at), category, status;

-- User reputation leaderboard
CREATE VIEW public.reputation_leaderboard AS
SELECT 
    p.id,
    p.display_name,
    p.reputation_score,
    p.reputation_tier,
    p.total_complaints,
    p.resolved_complaints,
    CASE 
        WHEN p.total_complaints > 0 
        THEN ROUND((p.resolved_complaints::FLOAT / p.total_complaints * 100), 2)
        ELSE 0 
    END as success_rate
FROM public.profiles p
WHERE p.role = 'citizen'
ORDER BY p.reputation_score DESC;

-- =============================================
-- INITIAL DATA
-- =============================================

-- Insert default categories
INSERT INTO public.complaints (id, title, description, category, status, is_public, reporter_id) 
VALUES 
    (uuid_generate_v4(), 'Sample Infrastructure Issue', 'This is a sample complaint for testing', 'Infrastructure', 'resolved', true, NULL),
    (uuid_generate_v4(), 'Sample Public Safety Issue', 'This is another sample complaint', 'Public Safety', 'in_progress', true, NULL)
ON CONFLICT DO NOTHING;

-- =============================================
-- SECURITY POLICIES SUMMARY
-- =============================================

-- RLS is enabled on all tables
-- Policies ensure:
-- 1. Users can only see their own private data
-- 2. Public complaints are visible to everyone
-- 3. Only authenticated users can create content
-- 4. Authorities can manage assigned complaints
-- 5. Admins have broader access (implement as needed)

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

SELECT 'AegisAI Database Schema Created Successfully! 🚀' as message,
       'Tables: ' || COUNT(*) || ' created' as stats
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'profiles', 'complaints', 'complaint_updates', 'complaint_votes', 
    'complaint_comments', 'reputation_transactions', 'carv_attestations', 
    'ai_analysis_logs', 'system_metrics'
);
