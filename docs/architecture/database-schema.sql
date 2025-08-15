-- DevbrainAI Database Schema
-- PostgreSQL 15+ with JSON support and advanced indexing

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Users and Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    auth0_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url VARCHAR(500),
    subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'pro', 'enterprise')),
    subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
    stripe_customer_id VARCHAR(255),
    onboarding_completed BOOLEAN DEFAULT FALSE,
    preferences JSONB DEFAULT '{}',
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects (MVI Sessions)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived', 'on_hold')),
    industry VARCHAR(100),
    target_users TEXT[],
    tech_stack JSONB DEFAULT '{}',
    github_repo VARCHAR(255),
    project_type VARCHAR(50) DEFAULT 'web_app' CHECK (project_type IN ('web_app', 'mobile_app', 'saas', 'ecommerce', 'other')),
    estimated_timeline INTEGER, -- in days
    estimated_budget DECIMAL(10,2),
    market_analysis JSONB DEFAULT '{}',
    competitive_landscape JSONB DEFAULT '{}',
    mvp_scope JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived', 'paused')),
    total_messages INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    context_generated BOOLEAN DEFAULT FALSE,
    conversation_stage VARCHAR(50) DEFAULT 'discovery' CHECK (conversation_stage IN ('discovery', 'analysis', 'specification', 'completion')),
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    feedback TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    ai_model VARCHAR(100) CHECK (ai_model IN ('claude', 'qwen', 'deepseek')),
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'visualization')),
    metadata JSONB DEFAULT '{}', -- tokens, processing_time, etc.
    response_time_ms INTEGER,
    quality_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Context Items (MCP Format)
CREATE TABLE context_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL, -- feature_spec, tech_spec, user_story, api_contract, test_scenario
    category VARCHAR(100), -- frontend, backend, database, integration, testing
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content JSONB NOT NULL,
    tags TEXT[],
    priority INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'reviewed', 'approved', 'implemented')),
    implementation_notes TEXT,
    version INTEGER DEFAULT 1,
    parent_id UUID REFERENCES context_items(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team Collaborations
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'developer', 'designer', 'qa', 'viewer')),
    permissions JSONB DEFAULT '{}',
    invitation_token VARCHAR(255),
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    joined_at TIMESTAMP,
    last_active_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'inactive', 'removed')),
    UNIQUE(project_id, user_id)
);

-- Progress Tracking
CREATE TABLE progress_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    event_type VARCHAR(100) NOT NULL, -- commit, feature_complete, test_pass, deployment, milestone
    event_category VARCHAR(50) DEFAULT 'development' CHECK (event_category IN ('development', 'testing', 'deployment', 'business')),
    title VARCHAR(255),
    description TEXT,
    event_data JSONB NOT NULL,
    impact_score INTEGER DEFAULT 0, -- 0-100 scale
    source VARCHAR(100) DEFAULT 'manual' CHECK (source IN ('github', 'manual', 'ai_analysis', 'webhook')),
    source_id VARCHAR(255), -- commit hash, PR number, etc.
    related_context_items UUID[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feature Progress Tracking
CREATE TABLE feature_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    context_item_id UUID REFERENCES context_items(id),
    feature_name VARCHAR(255) NOT NULL,
    feature_type VARCHAR(50) DEFAULT 'feature' CHECK (feature_type IN ('feature', 'bug', 'enhancement', 'refactor')),
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'testing', 'completed', 'blocked')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    estimated_effort INTEGER, -- story points or hours
    actual_effort INTEGER,
    assigned_to UUID REFERENCES users(id),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    test_coverage_percentage DECIMAL(5,2) DEFAULT 0,
    quality_metrics JSONB DEFAULT '{}',
    blockers TEXT[],
    start_date TIMESTAMP,
    target_date TIMESTAMP,
    completion_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Context Library
CREATE TABLE context_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    tags TEXT[],
    content JSONB NOT NULL,
    readme_content TEXT,
    tech_requirements JSONB DEFAULT '{}',
    compatibility_matrix JSONB DEFAULT '{}',
    setup_instructions TEXT,
    demo_url VARCHAR(500),
    github_url VARCHAR(500),
    quality_score DECIMAL(3,2),
    difficulty_level VARCHAR(50) DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_setup_time INTEGER, -- minutes
    download_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2),
    rating_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    premium BOOLEAN DEFAULT FALSE,
    version VARCHAR(50) DEFAULT '1.0.0',
    changelog TEXT,
    created_by VARCHAR(100) DEFAULT 'system', -- system, user_id
    verified BOOLEAN DEFAULT FALSE,
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Context Pack Downloads
CREATE TABLE context_pack_downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_pack_id UUID NOT NULL REFERENCES context_packs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    project_id UUID REFERENCES projects(id),
    download_format VARCHAR(50), -- zip, json, mcp
    implementation_reported BOOLEAN DEFAULT FALSE,
    implementation_success BOOLEAN,
    implementation_feedback TEXT,
    setup_time_minutes INTEGER,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    implemented_at TIMESTAMP
);

-- AI Model Usage Tracking
CREATE TABLE ai_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    project_id UUID REFERENCES projects(id),
    conversation_id UUID REFERENCES conversations(id),
    ai_model VARCHAR(100) NOT NULL,
    request_type VARCHAR(50) DEFAULT 'conversation' CHECK (request_type IN ('conversation', 'analysis', 'generation', 'validation')),
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER,
    cost_usd DECIMAL(10,6),
    response_time_ms INTEGER,
    success BOOLEAN DEFAULT TRUE,
    error_type VARCHAR(100),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics and Usage Tracking
CREATE TABLE usage_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    project_id UUID REFERENCES projects(id),
    session_id VARCHAR(255),
    event_type VARCHAR(100) NOT NULL,
    event_category VARCHAR(50) DEFAULT 'user_action' CHECK (event_category IN ('user_action', 'system_event', 'business_metric')),
    event_data JSONB DEFAULT '{}',
    page_url VARCHAR(500),
    user_agent TEXT,
    ip_address INET,
    referrer VARCHAR(500),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Feedback and Ratings
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    project_id UUID REFERENCES projects(id),
    conversation_id UUID REFERENCES conversations(id),
    context_pack_id UUID REFERENCES context_packs(id),
    feedback_type VARCHAR(50) NOT NULL CHECK (feedback_type IN ('rating', 'review', 'bug_report', 'feature_request')),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT,
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'in_progress', 'resolved', 'closed')),
    response TEXT,
    responded_by UUID REFERENCES users(id),
    responded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Integration Configurations
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    integration_type VARCHAR(50) NOT NULL CHECK (integration_type IN ('github', 'slack', 'discord', 'jira', 'trello')),
    configuration JSONB NOT NULL,
    webhook_secret VARCHAR(255),
    webhook_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
    last_sync_at TIMESTAMP,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, integration_type)
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id),
    notification_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    channel VARCHAR(50) DEFAULT 'in_app' CHECK (channel IN ('in_app', 'email', 'slack', 'webhook')),
    priority VARCHAR(50) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    read BOOLEAN DEFAULT FALSE,
    delivered BOOLEAN DEFAULT FALSE,
    delivery_attempts INTEGER DEFAULT 0,
    scheduled_for TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscription and Billing
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    tier VARCHAR(50) NOT NULL CHECK (tier IN ('free', 'starter', 'pro', 'enterprise')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid')),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP,
    billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    amount_cents INTEGER,
    currency VARCHAR(3) DEFAULT 'USD',
    trial_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usage Quotas and Limits
CREATE TABLE usage_quotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_tier VARCHAR(50) NOT NULL,
    quota_type VARCHAR(50) NOT NULL, -- conversations, context_exports, team_members, ai_requests
    quota_limit INTEGER NOT NULL,
    quota_used INTEGER DEFAULT 0,
    quota_period VARCHAR(20) DEFAULT 'monthly' CHECK (quota_period IN ('daily', 'weekly', 'monthly')),
    period_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    period_end TIMESTAMP,
    auto_reset BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, quota_type, quota_period)
);

-- Performance indexes for optimal query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth0_id ON users(auth0_id);
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_projects_github_repo ON projects(github_repo);

CREATE INDEX idx_conversations_project_id ON conversations(project_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_role ON messages(role);
CREATE INDEX idx_messages_ai_model ON messages(ai_model);
CREATE INDEX idx_messages_created_at ON messages(created_at);

CREATE INDEX idx_context_items_project_id ON context_items(project_id);
CREATE INDEX idx_context_items_type ON context_items(type);
CREATE INDEX idx_context_items_status ON context_items(status);
CREATE INDEX idx_context_items_tags ON context_items USING GIN(tags);

CREATE INDEX idx_team_members_project_id ON team_members(project_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_project_user ON team_members(project_id, user_id);
CREATE INDEX idx_team_members_role ON team_members(role);

CREATE INDEX idx_progress_events_project_id ON progress_events(project_id);
CREATE INDEX idx_progress_events_user_id ON progress_events(user_id);
CREATE INDEX idx_progress_events_type ON progress_events(event_type);
CREATE INDEX idx_progress_events_created_at ON progress_events(created_at);

CREATE INDEX idx_feature_progress_project_id ON feature_progress(project_id);
CREATE INDEX idx_feature_progress_status ON feature_progress(status);
CREATE INDEX idx_feature_progress_assigned_to ON feature_progress(assigned_to);

CREATE INDEX idx_context_packs_category ON context_packs(category);
CREATE INDEX idx_context_packs_tags ON context_packs USING GIN(tags);
CREATE INDEX idx_context_packs_rating ON context_packs(rating);
CREATE INDEX idx_context_packs_featured ON context_packs(featured);
CREATE INDEX idx_context_packs_premium ON context_packs(premium);

CREATE INDEX idx_context_pack_downloads_pack_id ON context_pack_downloads(context_pack_id);
CREATE INDEX idx_context_pack_downloads_user_id ON context_pack_downloads(user_id);
CREATE INDEX idx_context_pack_downloads_downloaded_at ON context_pack_downloads(downloaded_at);

CREATE INDEX idx_ai_usage_user_id ON ai_usage(user_id);
CREATE INDEX idx_ai_usage_project_id ON ai_usage(project_id);
CREATE INDEX idx_ai_usage_model ON ai_usage(ai_model);
CREATE INDEX idx_ai_usage_created_at ON ai_usage(created_at);

CREATE INDEX idx_usage_events_user_id ON usage_events(user_id);
CREATE INDEX idx_usage_events_type ON usage_events(event_type);
CREATE INDEX idx_usage_events_created_at ON usage_events(created_at);
CREATE INDEX idx_usage_events_session_id ON usage_events(session_id);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

CREATE INDEX idx_usage_quotas_user_type ON usage_quotas(user_id, quota_type);
CREATE INDEX idx_usage_quotas_period ON usage_quotas(period_start, period_end);

-- Full-text search indexes
CREATE INDEX idx_projects_name_desc ON projects USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_context_packs_search ON context_packs USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Composite indexes for common query patterns
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at);
CREATE INDEX idx_progress_events_project_created ON progress_events(project_id, created_at);
CREATE INDEX idx_team_members_project_status ON team_members(project_id, status);
CREATE INDEX idx_context_items_project_type ON context_items(project_id, type);

-- Functions and triggers for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_context_items_updated_at BEFORE UPDATE ON context_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_progress_updated_at BEFORE UPDATE ON feature_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_quotas_updated_at BEFORE UPDATE ON usage_quotas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update conversation message count
CREATE OR REPLACE FUNCTION update_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE conversations 
        SET total_messages = total_messages + 1,
            total_tokens = total_tokens + COALESCE((NEW.metadata->>'tokens')::integer, 0)
        WHERE id = NEW.conversation_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE conversations 
        SET total_messages = total_messages - 1,
            total_tokens = total_tokens - COALESCE((OLD.metadata->>'tokens')::integer, 0)
        WHERE id = OLD.conversation_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_counts AFTER INSERT OR DELETE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_message_count();

-- Function to automatically update context pack download count
CREATE OR REPLACE FUNCTION update_context_pack_download_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE context_packs 
        SET download_count = download_count + 1
        WHERE id = NEW.context_pack_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pack_download_count AFTER INSERT ON context_pack_downloads
    FOR EACH ROW EXECUTE FUNCTION update_context_pack_download_count();

-- Views for common queries and analytics
CREATE VIEW user_project_stats AS
SELECT 
    u.id as user_id,
    u.email,
    u.subscription_tier,
    COUNT(p.id) as total_projects,
    COUNT(CASE WHEN p.status = 'active' THEN 1 END) as active_projects,
    COUNT(CASE WHEN p.status = 'completed' THEN 1 END) as completed_projects,
    COUNT(c.id) as total_conversations,
    COUNT(ctx.id) as total_context_items,
    u.created_at as user_since
FROM users u
LEFT JOIN projects p ON u.id = p.user_id
LEFT JOIN conversations c ON p.id = c.project_id
LEFT JOIN context_items ctx ON p.id = ctx.project_id
GROUP BY u.id, u.email, u.subscription_tier, u.created_at;

CREATE VIEW project_progress_summary AS
SELECT 
    p.id as project_id,
    p.name as project_name,
    p.status,
    COUNT(fp.id) as total_features,
    COUNT(CASE WHEN fp.status = 'completed' THEN 1 END) as completed_features,
    COUNT(CASE WHEN fp.status = 'in_progress' THEN 1 END) as in_progress_features,
    ROUND(
        CASE 
            WHEN COUNT(fp.id) > 0 THEN 
                (COUNT(CASE WHEN fp.status = 'completed' THEN 1 END)::decimal / COUNT(fp.id)) * 100
            ELSE 0 
        END, 2
    ) as completion_percentage,
    MAX(pe.created_at) as last_activity
FROM projects p
LEFT JOIN feature_progress fp ON p.id = fp.project_id
LEFT JOIN progress_events pe ON p.id = pe.project_id
GROUP BY p.id, p.name, p.status;

CREATE VIEW ai_usage_summary AS
SELECT 
    DATE_TRUNC('day', created_at) as usage_date,
    ai_model,
    request_type,
    COUNT(*) as request_count,
    SUM(total_tokens) as total_tokens,
    SUM(cost_usd) as total_cost,
    AVG(response_time_ms) as avg_response_time,
    COUNT(CASE WHEN success = false THEN 1 END) as error_count
FROM ai_usage
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), ai_model, request_type
ORDER BY usage_date DESC;

-- Initial data for context pack categories
INSERT INTO context_packs (id, title, slug, description, category, tags, content, quality_score, featured, created_by, verified) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Stripe Payment Integration', 'stripe-payment-integration', 'Complete Stripe payment processing with React components and Node.js backend', 'payments', ARRAY['stripe', 'payments', 'react', 'nodejs'], '{"components": [], "backend": [], "tests": []}', 4.9, true, 'system', true),
('550e8400-e29b-41d4-a716-446655440002', 'User Authentication Flow', 'user-authentication-flow', 'Complete authentication system with JWT, password reset, and social login', 'authentication', ARRAY['auth', 'jwt', 'security', 'oauth'], '{"components": [], "backend": [], "tests": []}', 4.8, true, 'system', true),
('550e8400-e29b-41d4-a716-446655440003', 'Real-time Chat System', 'realtime-chat-system', 'WebSocket-based chat with rooms, typing indicators, and message persistence', 'communication', ARRAY['websocket', 'chat', 'realtime', 'socketio'], '{"components": [], "backend": [], "tests": []}', 4.7, true, 'system', true);

-- Initial quota limits for different subscription tiers
INSERT INTO usage_quotas (user_id, subscription_tier, quota_type, quota_limit) 
SELECT 
    id, 
    subscription_tier,
    'conversations',
    CASE subscription_tier
        WHEN 'free' THEN 1
        WHEN 'starter' THEN 5
        WHEN 'pro' THEN 999999
        WHEN 'enterprise' THEN 999999
    END
FROM users;

-- Materialized view for analytics dashboard (refresh periodically)
CREATE MATERIALIZED VIEW analytics_dashboard AS
SELECT 
    'users' as metric_type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as last_30_days,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as last_7_days
FROM users
UNION ALL
SELECT 
    'projects' as metric_type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as last_30_days,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as last_7_days
FROM projects
UNION ALL
SELECT 
    'conversations' as metric_type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as last_30_days,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as last_7_days
FROM conversations
UNION ALL
SELECT 
    'context_exports' as metric_type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN downloaded_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as last_30_days,
    COUNT(CASE WHEN downloaded_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as last_7_days
FROM context_pack_downloads;

-- Create unique index on materialized view
CREATE UNIQUE INDEX idx_analytics_dashboard_metric_type ON analytics_dashboard(metric_type);

-- Schedule to refresh materialized view (requires pg_cron extension)
-- SELECT cron.schedule('refresh-analytics', '0 */6 * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_dashboard;');

COMMENT ON DATABASE postgres IS 'DevbrainAI - Conversational AI Business Consultant Platform';
COMMENT ON TABLE users IS 'Platform users with subscription and authentication info';
COMMENT ON TABLE projects IS 'User projects representing MVI generation sessions';
COMMENT ON TABLE conversations IS 'AI conversation sessions within projects';
COMMENT ON TABLE messages IS 'Individual messages in conversations';
COMMENT ON TABLE context_items IS 'MCP-compatible context items generated from conversations';
COMMENT ON TABLE team_members IS 'Project collaboration and team member management';
COMMENT ON TABLE progress_events IS 'Development progress tracking from various sources';
COMMENT ON TABLE context_packs IS 'Reusable context packages in the library';
COMMENT ON TABLE ai_usage IS 'AI model usage tracking for billing and analytics';