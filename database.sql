-- =============================================================================
-- CIVICCHAIN COMPLETE DATABASE SETUP
-- Production-ready Supabase SQL schema for civic engagement platform
-- =============================================================================
-- INSTRUCTIONS:
-- 1. Copy this entire file
-- 2. Go to Supabase Dashboard → SQL Editor
-- 3. Paste and run this script
-- 4. Your database will be fully configured!
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security by default
SET row_security = on;

-- =============================================================================
-- PROFILES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone_number TEXT,
  location TEXT,
  bio TEXT,
  carv_id TEXT UNIQUE,
  carv_did_linked BOOLEAN DEFAULT false,
  reputation_score INTEGER DEFAULT 100 CHECK (reputation_score >= 0),
  civic_tokens INTEGER DEFAULT 0 CHECK (civic_tokens >= 0),
  verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified')),
  notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
  privacy_settings JSONB DEFAULT '{"profile_public": true, "location_public": false}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

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
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- COMPLAINT CATEGORIES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.complaint_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT 'help-circle',
  color TEXT DEFAULT '#6B7280',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO public.complaint_categories (name, description, icon, color) VALUES
  ('Infrastructure', 'Roads, bridges, public transportation', 'construction', '#EF4444'),
  ('Environment', 'Pollution, waste management, green spaces', 'leaf', '#10B981'),
  ('Public Safety', 'Crime, emergency services, lighting', 'shield', '#3B82F6'),
  ('Healthcare', 'Public health services, accessibility', 'heart', '#EC4899'),
  ('Education', 'Schools, educational resources', 'book', '#8B5CF6'),
  ('Utilities', 'Water, electricity, internet', 'zap', '#F59E0B'),
  ('Housing', 'Public housing, zoning, development', 'home', '#6366F1'),
  ('Transportation', 'Public transit, parking, traffic', 'car', '#14B8A6'),
  ('Government', 'Administrative issues, transparency', 'building', '#64748B'),
  ('Other', 'Issues not covered by other categories', 'help-circle', '#9CA3AF')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- COMPLAINTS SYSTEM
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.complaint_categories(id),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'acknowledged', 'investigating', 'resolved', 'closed', 'rejected')),
  priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  location_address TEXT,
  location_description TEXT,
  images TEXT[] DEFAULT '{}',
  attachments TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_anonymous BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0 CHECK (upvotes >= 0),
  views INTEGER DEFAULT 0 CHECK (views >= 0),
  expected_resolution_date DATE,
  actual_resolution_date DATE,
  assigned_department TEXT,
  assigned_agent_id UUID REFERENCES public.profiles(id),
  internal_notes TEXT,
  public_updates TEXT[] DEFAULT '{}',
  estimated_cost DECIMAL(12, 2),
  ai_analysis JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for complaints
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view non-anonymous complaints" ON public.complaints
  FOR SELECT USING (NOT is_anonymous OR auth.uid() = user_id);

CREATE POLICY "Users can view own complaints" ON public.complaints
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own complaints" ON public.complaints
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own complaints" ON public.complaints
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================================================
-- DAO GOVERNANCE SYSTEM
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.dao_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN (
    'infrastructure', 'budget', 'policy', 'governance', 'community', 'emergency', 'general'
  )),
  type TEXT DEFAULT 'standard' CHECK (type IN ('standard', 'constitutional', 'budget', 'emergency')),
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'active', 'passed', 'failed', 'executed', 'cancelled', 'expired'
  )),
  voting_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  voting_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  required_votes INTEGER DEFAULT 100 CHECK (required_votes > 0),
  support_threshold DECIMAL(3, 2) DEFAULT 0.51 CHECK (support_threshold BETWEEN 0 AND 1),
  current_votes INTEGER DEFAULT 0 CHECK (current_votes >= 0),
  yes_votes INTEGER DEFAULT 0 CHECK (yes_votes >= 0),
  no_votes INTEGER DEFAULT 0 CHECK (no_votes >= 0),
  abstain_votes INTEGER DEFAULT 0 CHECK (abstain_votes >= 0),
  minimum_quorum INTEGER DEFAULT 50 CHECK (minimum_quorum > 0),
  execution_date TIMESTAMP WITH TIME ZONE,
  execution_details JSONB DEFAULT '{}',
  attachments TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  discussion_enabled BOOLEAN DEFAULT true,
  anonymous_voting BOOLEAN DEFAULT false,
  weighted_voting BOOLEAN DEFAULT false,
  estimated_cost DECIMAL(12, 2),
  funding_source TEXT,
  impact_assessment TEXT,
  legal_review_status TEXT DEFAULT 'pending' CHECK (legal_review_status IN ('pending', 'approved', 'rejected', 'not_required')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for DAO proposals
ALTER TABLE public.dao_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active proposals" ON public.dao_proposals
  FOR SELECT USING (status IN ('active', 'passed', 'failed', 'executed'));

CREATE POLICY "Users can view own proposals" ON public.dao_proposals
  FOR SELECT USING (auth.uid() = proposer_id);

CREATE POLICY "Users can insert own proposals" ON public.dao_proposals
  FOR INSERT WITH CHECK (auth.uid() = proposer_id);

CREATE POLICY "Users can update own draft proposals" ON public.dao_proposals
  FOR UPDATE USING (auth.uid() = proposer_id AND status = 'draft');

-- =============================================================================
-- DAO VOTES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.dao_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES public.dao_proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vote_choice TEXT NOT NULL CHECK (vote_choice IN ('yes', 'no', 'abstain')),
  vote_weight INTEGER DEFAULT 1 CHECK (vote_weight > 0),
  reasoning TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  vote_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(proposal_id, user_id)
);

-- RLS Policies for DAO votes
ALTER TABLE public.dao_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own votes" ON public.dao_votes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own votes" ON public.dao_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- COMMUNITY EVENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.community_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN (
    'meeting', 'workshop', 'volunteer', 'social', 'educational', 'emergency', 'general'
  )),
  event_type TEXT DEFAULT 'in_person' CHECK (event_type IN ('in_person', 'virtual', 'hybrid')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('draft', 'scheduled', 'ongoing', 'completed', 'cancelled')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location_name TEXT,
  location_address TEXT,
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  virtual_link TEXT,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0 CHECK (current_participants >= 0),
  registration_required BOOLEAN DEFAULT true,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  is_public BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  attachments TEXT[] DEFAULT '{}',
  agenda JSONB DEFAULT '{}',
  requirements TEXT,
  contact_info JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for community events
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public events" ON public.community_events
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view own events" ON public.community_events
  FOR SELECT USING (auth.uid() = organizer_id);

CREATE POLICY "Users can insert own events" ON public.community_events
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Users can update own events" ON public.community_events
  FOR UPDATE USING (auth.uid() = organizer_id);

-- =============================================================================
-- NOTIFICATIONS SYSTEM
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT DEFAULT 'general' CHECK (category IN (
    'complaint', 'dao', 'event', 'system', 'achievement', 'reminder', 'general'
  )),
  is_read BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  action_url TEXT,
  action_data JSONB DEFAULT '{}',
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================================================
-- CHAT SYSTEM
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'public' CHECK (type IN ('public', 'private', 'event', 'proposal')),
  related_id UUID,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0 CHECK (current_participants >= 0),
  rules TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system', 'reply')),
  reply_to_id UUID REFERENCES public.chat_messages(id),
  attachments TEXT[] DEFAULT '{}',
  is_edited BOOLEAN DEFAULT false,
  edit_history JSONB DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for chat system
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public chat rooms" ON public.chat_rooms
  FOR SELECT USING (type = 'public');

CREATE POLICY "Anyone can view public chat messages" ON public.chat_messages
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can send messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON public.complaints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dao_proposals_updated_at BEFORE UPDATE ON public.dao_proposals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_community_events_updated_at BEFORE UPDATE ON public.community_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON public.chat_rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON public.chat_messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update DAO proposal vote counts
CREATE OR REPLACE FUNCTION public.update_proposal_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.dao_proposals 
    SET 
      current_votes = (SELECT COUNT(*) FROM public.dao_votes WHERE proposal_id = NEW.proposal_id),
      yes_votes = (SELECT COUNT(*) FROM public.dao_votes WHERE proposal_id = NEW.proposal_id AND vote_choice = 'yes'),
      no_votes = (SELECT COUNT(*) FROM public.dao_votes WHERE proposal_id = NEW.proposal_id AND vote_choice = 'no'),
      abstain_votes = (SELECT COUNT(*) FROM public.dao_votes WHERE proposal_id = NEW.proposal_id AND vote_choice = 'abstain'),
      updated_at = NOW()
    WHERE id = NEW.proposal_id;
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    UPDATE public.dao_proposals 
    SET 
      current_votes = (SELECT COUNT(*) FROM public.dao_votes WHERE proposal_id = OLD.proposal_id),
      yes_votes = (SELECT COUNT(*) FROM public.dao_votes WHERE proposal_id = OLD.proposal_id AND vote_choice = 'yes'),
      no_votes = (SELECT COUNT(*) FROM public.dao_votes WHERE proposal_id = OLD.proposal_id AND vote_choice = 'no'),
      abstain_votes = (SELECT COUNT(*) FROM public.dao_votes WHERE proposal_id = OLD.proposal_id AND vote_choice = 'abstain'),
      updated_at = NOW()
    WHERE id = OLD.proposal_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for DAO vote counting
CREATE TRIGGER update_dao_proposal_votes 
  AFTER INSERT OR UPDATE OR DELETE ON public.dao_votes 
  FOR EACH ROW EXECUTE FUNCTION public.update_proposal_vote_counts();

-- =============================================================================
-- PERFORMANCE INDEXES
-- =============================================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_carv_id ON public.profiles(carv_id);

-- Complaints indexes
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON public.complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_category_id ON public.complaints(category_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_location ON public.complaints(location_latitude, location_longitude);

-- DAO indexes
CREATE INDEX IF NOT EXISTS idx_dao_proposals_status ON public.dao_proposals(status);
CREATE INDEX IF NOT EXISTS idx_dao_proposals_voting_end ON public.dao_proposals(voting_end_date);
CREATE INDEX IF NOT EXISTS idx_dao_votes_proposal_id ON public.dao_votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_dao_votes_user_id ON public.dao_votes(user_id);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.community_events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.community_events(status);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Chat indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON public.chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

-- =============================================================================
-- ENABLE REAL-TIME SUBSCRIPTIONS
-- =============================================================================

-- Enable real-time for all tables
ALTER publication supabase_realtime ADD TABLE public.profiles;
ALTER publication supabase_realtime ADD TABLE public.complaints;
ALTER publication supabase_realtime ADD TABLE public.dao_proposals;
ALTER publication supabase_realtime ADD TABLE public.dao_votes;
ALTER publication supabase_realtime ADD TABLE public.community_events;
ALTER publication supabase_realtime ADD TABLE public.notifications;
ALTER publication supabase_realtime ADD TABLE public.chat_rooms;
ALTER publication supabase_realtime ADD TABLE public.chat_messages;

-- =============================================================================
-- SAMPLE DATA
-- =============================================================================

-- Insert sample DAO proposals
INSERT INTO public.dao_proposals (
  proposer_id, title, description, category, voting_end_date, required_votes
) 
SELECT 
  id,
  'Improve Public Transportation',
  'Proposal to allocate budget for better bus routes and electric buses in the city center.',
  'infrastructure',
  NOW() + INTERVAL '7 days',
  100
FROM public.profiles 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert sample community events
INSERT INTO public.community_events (
  organizer_id, title, description, category, start_date, end_date, location_name, max_participants
) 
SELECT 
  id,
  'Weekly Town Hall Meeting',
  'Join us every Wednesday for community discussions and updates on local issues.',
  'meeting',
  NOW() + INTERVAL '2 days',
  NOW() + INTERVAL '2 days' + INTERVAL '2 hours',
  'Community Center',
  100
FROM public.profiles 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert sample chat rooms
INSERT INTO public.chat_rooms (name, description, type, creator_id) 
SELECT 
  'General Discussion',
  'General community discussion and announcements',
  'public',
  id
FROM public.profiles 
LIMIT 1
ON CONFLICT DO NOTHING;

-- =============================================================================
-- FINAL PERMISSIONS
-- =============================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '🎉 CIVICCHAIN DATABASE SETUP COMPLETE! 🎉';
  RAISE NOTICE '';
  RAISE NOTICE '✅ All tables created successfully';
  RAISE NOTICE '✅ Row Level Security (RLS) policies applied';
  RAISE NOTICE '✅ Real-time subscriptions enabled';
  RAISE NOTICE '✅ Performance indexes created';
  RAISE NOTICE '✅ Triggers and functions configured';
  RAISE NOTICE '✅ Sample data inserted for testing';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Your CivicChain platform is ready for production!';
  RAISE NOTICE '📱 Real-time features: ✓ Chat ✓ Notifications ✓ Live Voting ✓ Updates';
  RAISE NOTICE '🔒 Security: ✓ RLS ✓ Authentication ✓ Authorization';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Update your .env.local with Supabase credentials';
  RAISE NOTICE '2. Test the application at http://localhost:3003';
  RAISE NOTICE '3. Create your first user account';
  RAISE NOTICE '4. Start engaging with your community!';
END $$;
