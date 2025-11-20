-- ============================================================================
-- SaaS Viability Analyzer - Database Schema
-- Version: 2.0 (Unified Analysis Schema)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Products Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_slug VARCHAR(255) UNIQUE NOT NULL,
    source VARCHAR(50) NOT NULL,
    source_url TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    tagline TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_product_slug UNIQUE (product_slug)
);

-- ============================================================================
-- Product Analyses Table (Unified Schema)
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    product_slug VARCHAR(255) NOT NULL,
    
    -- Full analysis data as JSONB
    analysis_data JSONB NOT NULL,
    
    -- Denormalized scores for fast querying
    score_overall INTEGER,
    score_feasibility INTEGER,
    score_desirability INTEGER,
    score_viability INTEGER,
    verdict VARCHAR(10),
    
    -- Metadata
    schema_version VARCHAR(50) NOT NULL DEFAULT '2.0',
    model_used VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    error_message TEXT,
    processing_time_ms INTEGER,
    
    -- Timestamps
    analyzed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_source ON products(source);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(product_slug);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Analyses table indexes
CREATE INDEX IF NOT EXISTS idx_analyses_product_id ON product_analyses(product_id);
CREATE INDEX IF NOT EXISTS idx_analyses_product_slug ON product_analyses(product_slug);
CREATE INDEX IF NOT EXISTS idx_analyses_status ON product_analyses(status);
CREATE INDEX IF NOT EXISTS idx_analyses_verdict ON product_analyses(verdict);
CREATE INDEX IF NOT EXISTS idx_analyses_overall_score ON product_analyses(score_overall DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON product_analyses(created_at DESC);

-- GIN index for JSONB queries (enables fast JSON field searches)
CREATE INDEX IF NOT EXISTS idx_analysis_data ON product_analyses USING GIN (analysis_data);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_verdict_score ON product_analyses(verdict, score_overall DESC);

-- ============================================================================
-- Triggers for Updated At
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_analyses_updated_at ON product_analyses;
CREATE TRIGGER update_product_analyses_updated_at
    BEFORE UPDATE ON product_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE products IS 'Lightweight product registry with basic identification';
COMMENT ON TABLE product_analyses IS 'Complete product analyses with structured JSONB data';
COMMENT ON COLUMN product_analyses.analysis_data IS 'Full ProductAnalysisComplete schema as JSONB';
COMMENT ON COLUMN product_analyses.score_overall IS 'Denormalized overall score (0-100) for fast filtering';
COMMENT ON INDEX idx_analysis_data IS 'GIN index for efficient JSONB queries on analysis_data';
