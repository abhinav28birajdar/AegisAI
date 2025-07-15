-- =============================================
-- CIVICCHAIN - COMPREHENSIVE DATABASE SCHEMA
-- Decentralized Urban Governance Platform
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geospatial data

-- =============================================
-- 1. CORE USER MANAGEMENT TABLES
-- =============================================

-- Enhanced profiles table with CARV integration
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    
    -- Basic Profile Information
    email TEXT UNIQUE,
    full_name TEXT,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    preferred_language TEXT DEFAULT 'en',
    
    -- Identity & Verification (CARV Integration)
    carv_id TEXT UNIQUE, -- CARV decentralized identifier
    wallet_address TEXT UNIQUE,
    is_carv_verified BOOLEAN DEFAULT FALSE,
    carv_credentials JSONB DEFAULT '[]', -- Array of verifiable credentials
    is_verified BOOLEAN DEFAULT FALSE,
    verification_type TEXT CHECK (verification_type IN ('email', 'carv', 'wallet', 'government', 'phone')) DEFAULT 'email',
    verification_data JSONB DEFAULT '{}', -- Additional verification metadata
    
    -- Role & Permissions
    role TEXT CHECK (role IN ('citizen', 'employee', 'admin', 'auditor')) DEFAULT 'citizen',
    department TEXT, -- For employees/admins
    jurisdiction JSONB, -- Geographic area of responsibility
    permissions JSONB DEFAULT '[]', -- Granular permissions array
    
    -- Location & Preferences
    home_location GEOMETRY(POINT, 4326), -- PostGIS point for home location
    preferred_locations JSONB DEFAULT '[]', -- Array of preferred notification areas
    notification_preferences JSONB DEFAULT '{
        "email": true,
        "push": true,
        "sms": false,
        "emergency_only": false
    }',
    privacy_settings JSONB DEFAULT '{
        "profile_visibility": "public",
        "location_sharing": "always",
        "activity_visibility": "public"
    }',
    
    -- Reputation & Gamification
    reputation_score INTEGER DEFAULT 0,
    reputation_tier TEXT CHECK (reputation_tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond', 'legend')) DEFAULT 'bronze',
    civic_tokens_balance DECIMAL(18, 8) DEFAULT 0, -- $CIVIC token balance
    nft_badges JSONB DEFAULT '[]', -- Array of earned NFT badges
    achievements JSONB DEFAULT '[]', -- Achievement system
    
    -- Activity Metrics
    total_complaints INTEGER DEFAULT 0,
    resolved_complaints INTEGER DEFAULT 0,
    helpful_votes INTEGER DEFAULT 0,
    dao_votes_cast INTEGER DEFAULT 0,
    volunteer_hours DECIMAL(10, 2) DEFAULT 0,
    community_contributions INTEGER DEFAULT 0,
    
    -- Platform Engagement
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    platform_usage_stats JSONB DEFAULT '{}', -- Track feature usage
    onboarding_completed BOOLEAN DEFAULT FALSE,
    tutorial_progress JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CARV data sharing consent management
CREATE TABLE public.carv_data_sharing (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    data_type TEXT NOT NULL, -- 'complaints', 'voting_patterns', 'location_data', etc.
    sharing_consent BOOLEAN DEFAULT FALSE,
    consent_level TEXT CHECK (consent_level IN ('none', 'anonymized', 'aggregated', 'full')) DEFAULT 'none',
    purpose TEXT, -- Research, governance, etc.
    expiry_date TIMESTAMP WITH TIME ZONE,
    
    -- CARV Protocol metadata
    carv_consent_id TEXT UNIQUE, -- Reference to CARV consent record
    consent_signature TEXT, -- Cryptographic proof of consent
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. COMPLAINT MANAGEMENT SYSTEM
-- =============================================

-- Enhanced complaints table
CREATE TABLE public.complaints (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    complaint_number TEXT UNIQUE NOT NULL, -- Human-readable ID (e.g., CIV-2025-001234)
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    -- Basic Information
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    tags TEXT[] DEFAULT '{}', -- Array of tags for better categorization
    
    -- Location Data (Enhanced)
    location GEOMETRY(POINT, 4326), -- Precise GPS coordinates
    address TEXT,
    neighborhood TEXT,
    postal_code TEXT,
    landmark_description TEXT,
    location_accuracy DECIMAL(10, 2), -- GPS accuracy in meters
    
    -- AI Analysis (Comprehensive Gemini Integration)
    ai_analysis JSONB DEFAULT '{}', -- Complete AI analysis results
    ai_classification JSONB DEFAULT '{}', -- Category, confidence, reasoning
    ai_severity_assessment JSONB DEFAULT '{}', -- Risk level, urgency, impact
    ai_resource_suggestions JSONB DEFAULT '{}', -- Recommended resources, timeline
    ai_similar_cases JSONB DEFAULT '[]', -- References to similar resolved cases
    gemini_model_version TEXT, -- Track which Gemini model was used
    
    -- Priority & Urgency
    priority INTEGER CHECK (priority BETWEEN 1 AND 5) DEFAULT 3,
    urgency_level TEXT CHECK (urgency_level IN ('low', 'medium', 'high', 'critical', 'emergency')) DEFAULT 'medium',
    severity_score DECIMAL(5, 2), -- AI-calculated severity (0-100)
    estimated_resolution_days INTEGER,
    sla_deadline TIMESTAMP WITH TIME ZONE, -- Service Level Agreement deadline
    
    -- Status & Workflow
    status TEXT CHECK (status IN ('draft', 'submitted', 'in_review', 'assigned', 'in_progress', 'escalated', 'resolved', 'closed', 'rejected', 'cancelled')) DEFAULT 'submitted',
    sub_status TEXT, -- More granular status tracking
    assigned_to UUID REFERENCES public.profiles(id),
    assigned_department TEXT,
    assigned_team TEXT,
    assignment_history JSONB DEFAULT '[]', -- Track reassignments
    
    -- Privacy & Blockchain
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    anonymity_level TEXT CHECK (anonymity_level IN ('none', 'partial', 'full')) DEFAULT 'none',
    blockchain_tx_hash TEXT, -- Transaction hash on Polygon
    ipfs_hash TEXT, -- IPFS hash for media/documents
    arweave_tx_id TEXT, -- Permanent storage reference
    
    -- Media & Evidence
    media_files JSONB DEFAULT '[]', -- Array of uploaded files with metadata
    evidence_chain JSONB DEFAULT '[]', -- Chronological evidence updates
    supporting_documents JSONB DEFAULT '[]', -- Official documents, reports
    
    -- Community Engagement
    view_count INTEGER DEFAULT 0,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    community_interest_score DECIMAL(5, 2) DEFAULT 0,
    social_impact_score DECIMAL(5, 2) DEFAULT 0,
    
    -- Resolution & Feedback
    resolution_notes TEXT,
    resolution_media JSONB DEFAULT '[]', -- Before/after photos, completion evidence
    citizen_satisfaction_rating INTEGER CHECK (citizen_satisfaction_rating BETWEEN 1 AND 5),
    citizen_feedback TEXT,
    resolution_quality_score DECIMAL(5, 2),
    
    -- Financial & Resource Tracking
    estimated_cost DECIMAL(12, 2),
    actual_cost DECIMAL(12, 2),
    budget_code TEXT,
    resource_allocation JSONB DEFAULT '{}', -- Personnel, equipment, materials
    
    -- Dates & Timeline
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES public.profiles(id),
    escalated_at TIMESTAMP WITH TIME ZONE,
    first_response_at TIMESTAMP WITH TIME ZONE,
    deadline_missed BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    source_channel TEXT DEFAULT 'web_app', -- web_app, mobile_app, api, phone, email
    duplicate_of UUID REFERENCES public.complaints(id), -- Link to original if duplicate
    related_complaints UUID[] DEFAULT '{}', -- Array of related complaint IDs
    external_ticket_id TEXT, -- Integration with existing city systems
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Complaint status history
CREATE TABLE public.complaint_status_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
    updated_by UUID REFERENCES public.profiles(id),
    
    old_status TEXT,
    new_status TEXT NOT NULL,
    old_assigned_to UUID REFERENCES public.profiles(id),
    new_assigned_to UUID REFERENCES public.profiles(id),
    
    update_message TEXT,
    internal_notes TEXT, -- Private notes for staff
    citizen_notification_sent BOOLEAN DEFAULT FALSE,
    
    -- Blockchain integration
    blockchain_tx_hash TEXT,
    gas_used BIGINT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Complaint media and documents
CREATE TABLE public.complaint_media (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES public.profiles(id),
    
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    
    -- Storage references
    ipfs_hash TEXT,
    arweave_tx_id TEXT,
    local_url TEXT, -- Backup local storage
    
    -- AI analysis of media
    ai_analysis JSONB DEFAULT '{}', -- Gemini Vision analysis results
    contains_sensitive_info BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    description TEXT,
    is_evidence BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT TRUE,
    gps_coordinates GEOMETRY(POINT, 4326),
    timestamp_taken TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. COMMUNITY ENGAGEMENT & VOTING
-- =============================================

-- Community voting on complaints
CREATE TABLE public.complaint_votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
    voter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    vote_type TEXT CHECK (vote_type IN ('upvote', 'downvote', 'urgent', 'not_urgent', 'duplicate', 'spam')) NOT NULL,
    vote_weight DECIMAL(10, 4) DEFAULT 1.0, -- Based on reputation or token holdings
    reasoning TEXT, -- Optional explanation for the vote
    
    -- Blockchain verification
    blockchain_tx_hash TEXT,
    carv_signature TEXT, -- CARV-verified vote signature
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(complaint_id, voter_id, vote_type)
);

-- Comment and discussion system
CREATE TABLE public.complaint_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
    commenter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES public.complaint_comments(id),
    
    content TEXT NOT NULL,
    comment_type TEXT CHECK (comment_type IN ('public', 'official', 'internal', 'resolution_update')) DEFAULT 'public',
    
    -- Moderation & Quality
    is_official BOOLEAN DEFAULT FALSE, -- Authority response
    is_verified BOOLEAN DEFAULT FALSE, -- Expert opinion
    is_solution BOOLEAN DEFAULT FALSE, -- Marked as solution by authorities
    moderation_status TEXT CHECK (moderation_status IN ('pending', 'approved', 'flagged', 'removed')) DEFAULT 'approved',
    
    -- AI analysis
    ai_sentiment TEXT, -- positive, negative, neutral
    ai_helpfulness_score DECIMAL(5, 2),
    ai_toxicity_score DECIMAL(5, 2),
    
    -- Engagement
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    helpful_votes INTEGER DEFAULT 0,
    
    -- Media attachments
    attachments JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. DAO GOVERNANCE SYSTEM
-- =============================================

-- DAO proposals
CREATE TABLE public.dao_proposals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    proposal_number TEXT UNIQUE NOT NULL, -- DAO-2025-001
    proposer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    -- Proposal Content
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT CHECK (category IN ('budget', 'policy', 'infrastructure', 'service_improvement', 'emergency', 'constitutional')) NOT NULL,
    
    -- Proposal Details
    proposed_budget DECIMAL(15, 2),
    implementation_timeline TEXT,
    success_criteria TEXT,
    risk_assessment TEXT,
    
    -- AI-Enhanced Analysis
    ai_impact_analysis JSONB DEFAULT '{}', -- Gemini analysis of potential impact
    ai_feasibility_score DECIMAL(5, 2), -- AI assessment of feasibility
    ai_cost_estimate JSONB DEFAULT '{}', -- AI-generated cost breakdown
    similar_proposals JSONB DEFAULT '[]', -- References to similar past proposals
    
    -- Voting Configuration
    voting_start_date TIMESTAMP WITH TIME ZONE,
    voting_end_date TIMESTAMP WITH TIME ZONE,
    required_quorum INTEGER, -- Minimum votes needed
    passing_threshold DECIMAL(5, 2), -- Percentage needed to pass
    token_threshold DECIMAL(18, 8), -- Minimum tokens to participate
    
    -- Voting Results
    total_votes_cast INTEGER DEFAULT 0,
    total_tokens_voted DECIMAL(18, 8) DEFAULT 0,
    yes_votes INTEGER DEFAULT 0,
    no_votes INTEGER DEFAULT 0,
    abstain_votes INTEGER DEFAULT 0,
    yes_token_weight DECIMAL(18, 8) DEFAULT 0,
    no_token_weight DECIMAL(18, 8) DEFAULT 0,
    
    -- Status & Results
    status TEXT CHECK (status IN ('draft', 'submitted', 'voting', 'passed', 'rejected', 'implemented', 'cancelled', 'expired')) DEFAULT 'draft',
    execution_status TEXT CHECK (execution_status IN ('not_started', 'in_progress', 'completed', 'failed')) DEFAULT 'not_started',
    
    -- Blockchain Integration
    blockchain_proposal_id BIGINT, -- On-chain proposal ID
    smart_contract_address TEXT,
    execution_tx_hash TEXT,
    
    -- Implementation Tracking
    implementation_progress DECIMAL(5, 2) DEFAULT 0, -- Percentage complete
    implementation_notes TEXT,
    completion_evidence JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DAO votes
CREATE TABLE public.dao_votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    proposal_id UUID REFERENCES public.dao_proposals(id) ON DELETE CASCADE,
    voter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    vote_choice TEXT CHECK (vote_choice IN ('yes', 'no', 'abstain')) NOT NULL,
    token_amount DECIMAL(18, 8) NOT NULL, -- Tokens used for voting
    vote_weight DECIMAL(18, 8) NOT NULL, -- Calculated voting power
    
    -- Verification & Privacy
    carv_signature TEXT, -- CARV-verified vote
    vote_hash TEXT, -- Hash for privacy while maintaining verifiability
    is_delegated BOOLEAN DEFAULT FALSE,
    delegated_from UUID REFERENCES public.profiles(id),
    
    -- Reasoning & Analysis
    reasoning TEXT, -- Optional voter explanation
    ai_vote_analysis JSONB DEFAULT '{}', -- AI analysis of voting patterns
    
    -- Blockchain
    blockchain_tx_hash TEXT NOT NULL,
    block_number BIGINT,
    gas_used BIGINT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(proposal_id, voter_id)
);

-- =============================================
-- 5. CIVIC TOKEN & REPUTATION SYSTEM
-- =============================================

-- Comprehensive token transaction tracking
CREATE TABLE public.civic_token_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Transaction Details
    transaction_type TEXT CHECK (transaction_type IN ('earned', 'spent', 'staked', 'unstaked', 'rewarded', 'penalized', 'delegated', 'transferred')) NOT NULL,
    amount DECIMAL(18, 8) NOT NULL,
    balance_after DECIMAL(18, 8) NOT NULL,
    
    -- Transaction Context
    reason TEXT NOT NULL,
    activity_type TEXT, -- 'complaint_submitted', 'vote_cast', 'volunteer_hours', etc.
    activity_reference_id UUID, -- Reference to related complaint, proposal, etc.
    
    -- Reputation Impact
    reputation_change INTEGER DEFAULT 0,
    reputation_reason TEXT,
    
    -- Blockchain Integration
    blockchain_tx_hash TEXT,
    from_address TEXT,
    to_address TEXT,
    block_number BIGINT,
    gas_used BIGINT,
    gas_price DECIMAL(20, 0),
    
    -- Administrative
    awarded_by UUID REFERENCES public.profiles(id),
    authorized_by UUID REFERENCES public.profiles(id),
    audit_trail JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reputation system detailed tracking
CREATE TABLE public.reputation_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    activity_type TEXT NOT NULL,
    activity_description TEXT NOT NULL,
    points_earned INTEGER NOT NULL,
    multiplier DECIMAL(5, 2) DEFAULT 1.0,
    
    -- Context
    related_complaint_id UUID REFERENCES public.complaints(id),
    related_proposal_id UUID REFERENCES public.dao_proposals(id),
    related_user_id UUID REFERENCES public.profiles(id), -- For peer ratings
    
    -- Verification
    verified_by UUID REFERENCES public.profiles(id),
    verification_method TEXT,
    carv_attestation_id TEXT,
    
    -- Blockchain
    blockchain_tx_hash TEXT,
    nft_badge_id TEXT, -- If NFT badge was minted
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. VOLUNTEER & COMMUNITY ENGAGEMENT
-- =============================================

-- Volunteer opportunities
CREATE TABLE public.volunteer_opportunities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_by UUID REFERENCES public.profiles(id),
    
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    skills_required TEXT[],
    location GEOMETRY(POINT, 4326),
    location_description TEXT,
    
    -- Scheduling
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    time_commitment TEXT, -- "2 hours", "1 day", "ongoing"
    max_volunteers INTEGER,
    current_volunteers INTEGER DEFAULT 0,
    
    -- Rewards
    civic_tokens_reward DECIMAL(18, 8) DEFAULT 0,
    reputation_points INTEGER DEFAULT 0,
    nft_badge_eligible BOOLEAN DEFAULT FALSE,
    
    -- Status
    status TEXT CHECK (status IN ('draft', 'published', 'in_progress', 'completed', 'cancelled')) DEFAULT 'draft',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Volunteer participation tracking
CREATE TABLE public.volunteer_participation (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    opportunity_id UUID REFERENCES public.volunteer_opportunities(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    status TEXT CHECK (status IN ('applied', 'accepted', 'rejected', 'completed', 'no_show', 'cancelled')) DEFAULT 'applied',
    hours_committed DECIMAL(5, 2),
    hours_completed DECIMAL(5, 2) DEFAULT 0,
    
    -- Performance & Feedback
    performance_rating INTEGER CHECK (performance_rating BETWEEN 1 AND 5),
    organizer_feedback TEXT,
    volunteer_feedback TEXT,
    
    -- Verification
    verified_by UUID REFERENCES public.profiles(id),
    completion_evidence JSONB DEFAULT '[]',
    
    -- Rewards Issued
    tokens_earned DECIMAL(18, 8) DEFAULT 0,
    reputation_earned INTEGER DEFAULT 0,
    badges_earned TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(opportunity_id, volunteer_id)
);

-- =============================================
-- 7. SURVEYS, POLLS & CIVIC ENGAGEMENT
-- =============================================

-- Survey/Poll system
CREATE TABLE public.surveys (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_by UUID REFERENCES public.profiles(id),
    
    title TEXT NOT NULL,
    description TEXT,
    survey_type TEXT CHECK (survey_type IN ('survey', 'poll', 'petition', 'feedback')) NOT NULL,
    category TEXT,
    
    -- Configuration
    is_public BOOLEAN DEFAULT TRUE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    allow_multiple_responses BOOLEAN DEFAULT FALSE,
    target_demographic JSONB DEFAULT '{}',
    geographic_scope JSONB DEFAULT '{}',
    
    -- Scheduling
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    
    -- Questions/Options
    questions JSONB NOT NULL, -- Array of question objects
    
    -- Results
    total_responses INTEGER DEFAULT 0,
    response_rate DECIMAL(5, 2) DEFAULT 0,
    demographic_breakdown JSONB DEFAULT '{}',
    ai_analysis_results JSONB DEFAULT '{}', -- Gemini analysis of responses
    
    -- Status
    status TEXT CHECK (status IN ('draft', 'active', 'closed', 'archived')) DEFAULT 'draft',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Survey responses
CREATE TABLE public.survey_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE,
    respondent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    responses JSONB NOT NULL, -- Answer data
    completion_time DECIMAL(10, 2), -- Time taken in seconds
    
    -- Demographics (if collecting)
    demographic_data JSONB DEFAULT '{}',
    location GEOMETRY(POINT, 4326),
    
    -- Quality & Verification
    quality_score DECIMAL(5, 2), -- AI assessment of response quality
    is_verified BOOLEAN DEFAULT FALSE,
    flagged_as_spam BOOLEAN DEFAULT FALSE,
    
    -- Privacy
    anonymized BOOLEAN DEFAULT FALSE,
    carv_signature TEXT, -- For verified anonymous responses
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 8. EVENTS & COMMUNITY CALENDAR
-- =============================================

-- Community events
CREATE TABLE public.community_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organizer_id UUID REFERENCES public.profiles(id),
    
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT CHECK (event_type IN ('meeting', 'workshop', 'town_hall', 'volunteer', 'social', 'emergency_response')) NOT NULL,
    category TEXT,
    
    -- Location & Time
    location GEOMETRY(POINT, 4326),
    location_name TEXT,
    location_address TEXT,
    is_virtual BOOLEAN DEFAULT FALSE,
    virtual_link TEXT,
    
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone TEXT DEFAULT 'UTC',
    
    -- Capacity & Registration
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    requires_registration BOOLEAN DEFAULT FALSE,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    
    -- Costs & Rewards
    cost DECIMAL(10, 2) DEFAULT 0,
    civic_tokens_reward DECIMAL(18, 8) DEFAULT 0,
    reputation_reward INTEGER DEFAULT 0,
    
    -- Content & Materials
    agenda JSONB DEFAULT '[]',
    materials JSONB DEFAULT '[]',
    recordings JSONB DEFAULT '[]',
    
    -- Status
    status TEXT CHECK (status IN ('draft', 'published', 'ongoing', 'completed', 'cancelled', 'postponed')) DEFAULT 'draft',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event attendance tracking
CREATE TABLE public.event_attendance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES public.community_events(id) ON DELETE CASCADE,
    attendee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    registration_status TEXT CHECK (registration_status IN ('registered', 'waitlisted', 'attended', 'no_show', 'cancelled')) DEFAULT 'registered',
    attendance_verified BOOLEAN DEFAULT FALSE,
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    
    -- Feedback
    event_rating INTEGER CHECK (event_rating BETWEEN 1 AND 5),
    feedback TEXT,
    
    -- Rewards
    tokens_earned DECIMAL(18, 8) DEFAULT 0,
    reputation_earned INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, attendee_id)
);

-- =============================================
-- 9. AI ANALYSIS & SYSTEM INTELLIGENCE
-- =============================================

-- Comprehensive AI analysis logs
CREATE TABLE public.ai_analysis_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Source & Context
    entity_type TEXT NOT NULL, -- 'complaint', 'proposal', 'survey', 'comment'
    entity_id UUID NOT NULL,
    analysis_type TEXT NOT NULL, -- 'classification', 'sentiment', 'priority', 'fraud_detection'
    
    -- AI Model Information
    model_name TEXT NOT NULL, -- 'gemini-1.5-pro', 'gemini-1.5-flash'
    model_version TEXT,
    api_endpoint TEXT,
    
    -- Input & Output
    input_data JSONB NOT NULL,
    output_data JSONB NOT NULL,
    confidence_score DECIMAL(5, 4),
    
    -- Performance Metrics
    processing_time_ms INTEGER,
    tokens_used INTEGER,
    cost_usd DECIMAL(10, 6),
    
    -- Quality & Validation
    human_validation BOOLEAN,
    validation_accuracy DECIMAL(5, 4),
    feedback_score INTEGER,
    
    -- Error Handling
    error_occurred BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    fallback_used BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Predictive analytics & insights
CREATE TABLE public.predictive_insights (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    insight_type TEXT NOT NULL, -- 'infrastructure_risk', 'budget_forecast', 'resource_optimization'
    geographic_scope JSONB, -- Areas this insight applies to
    time_horizon TEXT, -- '1_week', '1_month', '1_year'
    
    -- Prediction Data
    prediction_data JSONB NOT NULL,
    confidence_level DECIMAL(5, 2),
    risk_score DECIMAL(5, 2),
    
    -- Recommendations
    recommended_actions JSONB DEFAULT '[]',
    estimated_impact JSONB DEFAULT '{}',
    resource_requirements JSONB DEFAULT '{}',
    
    -- Validation
    validation_status TEXT CHECK (validation_status IN ('pending', 'validated', 'partially_correct', 'incorrect')) DEFAULT 'pending',
    actual_outcome JSONB,
    accuracy_score DECIMAL(5, 4),
    
    -- AI Model
    generated_by_model TEXT,
    model_version TEXT,
    training_data_period DATERANGE,
    
    -- Lifecycle
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    status TEXT CHECK (status IN ('active', 'superseded', 'invalidated')) DEFAULT 'active',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 10. SYSTEM METRICS & ANALYTICS
-- =============================================

-- Comprehensive system metrics
CREATE TABLE public.system_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    metric_category TEXT NOT NULL, -- 'performance', 'engagement', 'governance', 'economics'
    metric_name TEXT NOT NULL,
    metric_type TEXT CHECK (metric_type IN ('counter', 'gauge', 'histogram', 'summary')) NOT NULL,
    
    -- Metric Value & Context
    metric_value DECIMAL(20, 8) NOT NULL,
    metric_unit TEXT, -- 'count', 'percentage', 'seconds', 'tokens'
    aggregation_period TEXT, -- 'minute', 'hour', 'day', 'week', 'month'
    
    -- Dimensions & Segmentation
    dimensions JSONB DEFAULT '{}', -- Geographic, demographic, temporal breakdowns
    tags TEXT[] DEFAULT '{}',
    
    -- Metadata
    description TEXT,
    calculation_method TEXT,
    data_sources TEXT[],
    
    -- Quality
    data_quality_score DECIMAL(5, 2),
    confidence_interval JSONB,
    
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance and health monitoring
CREATE TABLE public.system_health (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    component_name TEXT NOT NULL, -- 'api', 'database', 'blockchain', 'ai_service'
    health_status TEXT CHECK (health_status IN ('healthy', 'degraded', 'unhealthy', 'unknown')) NOT NULL,
    
    -- Performance Metrics
    response_time_avg_ms DECIMAL(10, 2),
    response_time_p95_ms DECIMAL(10, 2),
    error_rate DECIMAL(5, 4),
    throughput_per_minute DECIMAL(10, 2),
    
    -- Resource Utilization
    cpu_usage_percent DECIMAL(5, 2),
    memory_usage_percent DECIMAL(5, 2),
    disk_usage_percent DECIMAL(5, 2),
    network_io_mbps DECIMAL(10, 2),
    
    -- Blockchain Specific
    gas_price_gwei DECIMAL(15, 6),
    block_confirmation_time_sec DECIMAL(10, 2),
    pending_transactions INTEGER,
    
    -- AI Service Specific
    ai_model_availability BOOLEAN,
    ai_average_processing_time_ms DECIMAL(10, 2),
    ai_rate_limit_remaining INTEGER,
    
    -- Issues & Incidents
    active_alerts INTEGER DEFAULT 0,
    incident_severity TEXT CHECK (incident_severity IN ('low', 'medium', 'high', 'critical')),
    incident_description TEXT,
    
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 11. INDEXES FOR PERFORMANCE
-- =============================================

-- Profile indexes
CREATE INDEX idx_profiles_carv_id ON public.profiles(carv_id);
CREATE INDEX idx_profiles_wallet_address ON public.profiles(wallet_address);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_reputation_score ON public.profiles(reputation_score DESC);
CREATE INDEX idx_profiles_location ON public.profiles USING GIST(home_location);
CREATE INDEX idx_profiles_last_active ON public.profiles(last_active DESC);

-- Complaint indexes
CREATE INDEX idx_complaints_status ON public.complaints(status);
CREATE INDEX idx_complaints_category ON public.complaints(category);
CREATE INDEX idx_complaints_priority ON public.complaints(priority DESC);
CREATE INDEX idx_complaints_created_at ON public.complaints(created_at DESC);
CREATE INDEX idx_complaints_assigned_to ON public.complaints(assigned_to);
CREATE INDEX idx_complaints_reporter_id ON public.complaints(reporter_id);
CREATE INDEX idx_complaints_location ON public.complaints USING GIST(location);
CREATE INDEX idx_complaints_urgency ON public.complaints(urgency_level);
CREATE INDEX idx_complaints_neighborhood ON public.complaints(neighborhood);

-- AI analysis indexes
CREATE INDEX idx_ai_logs_entity ON public.ai_analysis_logs(entity_type, entity_id);
CREATE INDEX idx_ai_logs_created_at ON public.ai_analysis_logs(created_at DESC);
CREATE INDEX idx_ai_logs_model ON public.ai_analysis_logs(model_name);

-- DAO indexes
CREATE INDEX idx_dao_proposals_status ON public.dao_proposals(status);
CREATE INDEX idx_dao_proposals_voting_dates ON public.dao_proposals(voting_start_date, voting_end_date);
CREATE INDEX idx_dao_votes_proposal ON public.dao_votes(proposal_id);
CREATE INDEX idx_dao_votes_voter ON public.dao_votes(voter_id);

-- Token transaction indexes
CREATE INDEX idx_token_transactions_user ON public.civic_token_transactions(user_id);
CREATE INDEX idx_token_transactions_type ON public.civic_token_transactions(transaction_type);
CREATE INDEX idx_token_transactions_created_at ON public.civic_token_transactions(created_at DESC);
CREATE INDEX idx_token_transactions_blockchain ON public.civic_token_transactions(blockchain_tx_hash);

-- System metrics indexes
CREATE INDEX idx_system_metrics_category ON public.system_metrics(metric_category, metric_name);
CREATE INDEX idx_system_metrics_recorded_at ON public.system_metrics(recorded_at DESC);
CREATE INDEX idx_system_health_component ON public.system_health(component_name);
CREATE INDEX idx_system_health_recorded_at ON public.system_health(recorded_at DESC);

-- =============================================
-- 12. ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carv_data_sharing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dao_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dao_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_participation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendance ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Public profiles viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Complaint policies
CREATE POLICY "Public complaints viewable by everyone" ON public.complaints
    FOR SELECT USING (is_public = true OR auth.uid() = reporter_id OR 
                     EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('employee', 'admin')));

CREATE POLICY "Users can create complaints" ON public.complaints
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own complaints" ON public.complaints
    FOR UPDATE USING (auth.uid() = reporter_id OR auth.uid() = assigned_to OR
                     EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('employee', 'admin')));

-- DAO policies
CREATE POLICY "Everyone can view active proposals" ON public.dao_proposals
    FOR SELECT USING (status NOT IN ('draft') OR proposer_id = auth.uid());

CREATE POLICY "Token holders can create proposals" ON public.dao_proposals
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND civic_tokens_balance > 0));

-- Voting policies
CREATE POLICY "Users can view their own votes" ON public.dao_votes
    FOR SELECT USING (voter_id = auth.uid());

CREATE POLICY "Users can cast their own votes" ON public.dao_votes
    FOR INSERT WITH CHECK (voter_id = auth.uid());

-- Token transaction policies
CREATE POLICY "Users can view their own transactions" ON public.civic_token_transactions
    FOR SELECT USING (user_id = auth.uid() OR 
                     EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin')));

-- =============================================
-- 13. FUNCTIONS & TRIGGERS
-- =============================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.complaints FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.dao_proposals FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.volunteer_opportunities FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.surveys FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.community_events FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update complaint vote counts
CREATE OR REPLACE FUNCTION public.update_complaint_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.vote_type = 'upvote' THEN
            UPDATE public.complaints SET upvotes = upvotes + 1 WHERE id = NEW.complaint_id;
        ELSIF NEW.vote_type = 'downvote' THEN
            UPDATE public.complaints SET downvotes = downvotes + 1 WHERE id = NEW.complaint_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.vote_type = 'upvote' THEN
            UPDATE public.complaints SET upvotes = upvotes - 1 WHERE id = OLD.complaint_id;
        ELSIF OLD.vote_type = 'downvote' THEN
            UPDATE public.complaints SET downvotes = downvotes - 1 WHERE id = OLD.complaint_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_complaint_vote_counts_trigger
    AFTER INSERT OR DELETE ON public.complaint_votes
    FOR EACH ROW EXECUTE FUNCTION public.update_complaint_vote_counts();

-- Generate complaint numbers
CREATE OR REPLACE FUNCTION public.generate_complaint_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.complaint_number := 'CIV-' || EXTRACT(YEAR FROM NOW()) || '-' || 
                           LPAD(NEXTVAL('complaint_sequence')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE complaint_sequence START 1;

CREATE TRIGGER generate_complaint_number_trigger
    BEFORE INSERT ON public.complaints
    FOR EACH ROW EXECUTE FUNCTION public.generate_complaint_number();

-- =============================================
-- 14. VIEWS FOR ANALYTICS
-- =============================================

-- Comprehensive complaint analytics
CREATE VIEW public.complaint_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    category,
    status,
    urgency_level,
    neighborhood,
    COUNT(*) as complaint_count,
    AVG(priority) as avg_priority,
    AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) as avg_resolution_hours,
    AVG(citizen_satisfaction_rating) as avg_satisfaction,
    COUNT(CASE WHEN deadline_missed THEN 1 END) as sla_violations
FROM public.complaints
GROUP BY DATE_TRUNC('day', created_at), category, status, urgency_level, neighborhood;

-- User engagement analytics
CREATE VIEW public.user_engagement_analytics AS
SELECT 
    p.id,
    p.display_name,
    p.role,
    p.reputation_score,
    p.civic_tokens_balance,
    p.total_complaints,
    p.dao_votes_cast,
    p.volunteer_hours,
    COUNT(DISTINCT cv.id) as community_votes,
    COUNT(DISTINCT cc.id) as comments_made,
    AVG(sr.quality_score) as avg_response_quality
FROM public.profiles p
LEFT JOIN public.complaint_votes cv ON p.id = cv.voter_id
LEFT JOIN public.complaint_comments cc ON p.id = cc.commenter_id
LEFT JOIN public.survey_responses sr ON p.id = sr.respondent_id
GROUP BY p.id, p.display_name, p.role, p.reputation_score, p.civic_tokens_balance, 
         p.total_complaints, p.dao_votes_cast, p.volunteer_hours;

-- DAO governance metrics
CREATE VIEW public.dao_governance_metrics AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    category,
    COUNT(*) as proposals_count,
    COUNT(CASE WHEN status = 'passed' THEN 1 END) as passed_count,
    AVG(total_tokens_voted) as avg_participation,
    AVG(CASE WHEN status = 'passed' THEN yes_token_weight / NULLIF(yes_token_weight + no_token_weight, 0) END) as avg_support_ratio
FROM public.dao_proposals
WHERE status IN ('passed', 'rejected')
GROUP BY DATE_TRUNC('month', created_at), category;

-- =============================================
-- 15. INITIAL DATA & CONFIGURATION
-- =============================================

-- Insert default complaint categories
INSERT INTO public.complaints (id, complaint_number, title, description, category, status, is_public, reporter_id) 
VALUES 
    (uuid_generate_v4(), 'CIV-2025-000001', 'Sample Infrastructure Issue', 'Street pothole causing vehicle damage', 'Infrastructure', 'resolved', true, NULL),
    (uuid_generate_v4(), 'CIV-2025-000002', 'Sample Public Safety Issue', 'Broken streetlight creating safety hazard', 'Public Safety', 'in_progress', true, NULL),
    (uuid_generate_v4(), 'CIV-2025-000003', 'Sample Environmental Issue', 'Illegal dumping in community park', 'Environment', 'assigned', true, NULL)
ON CONFLICT DO NOTHING;

-- Insert sample DAO proposal
INSERT INTO public.dao_proposals (id, proposal_number, title, description, category, status, proposer_id)
VALUES 
    (uuid_generate_v4(), 'DAO-2025-001', 'Community Park Improvement Initiative', 'Proposal to allocate funds for upgrading local park facilities', 'infrastructure', 'draft', NULL)
ON CONFLICT DO NOTHING;

-- Insert sample volunteer opportunity
INSERT INTO public.volunteer_opportunities (id, title, description, category, civic_tokens_reward, reputation_points)
VALUES 
    (uuid_generate_v4(), 'Community Clean-up Day', 'Help clean and beautify our neighborhood park', 'Environment', 50.0, 100)
ON CONFLICT DO NOTHING;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

SELECT 'CivicChain Database Schema Created Successfully! 🚀' as message,
       'Tables: ' || COUNT(*) || ' created with comprehensive features' as stats,
       'Ready for Phase 1 Hackathon MVP deployment! 🎯' as next_step
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name NOT LIKE 'auth_%';
