# SaaS Viability Analyzer - Product Overview

## Product Purpose
AI-powered SaaS viability analyzer that scrapes US-based startups and evaluates their potential for replication/sale in non-US markets (starting with Australia). Provides founders with data-driven go/no-go recommendations.

## Core Functionality

### 1. Product Discovery
- **BetaList Integration**: Scrapes weekly top 5 products
- **Gallery Display**: Main page shows trending SaaS products
- **Click-to-Analyze**: One-click analysis from gallery cards
- **Auto-Refresh**: 24-hour cache for fresh data

### 2. Analysis Modes
User can analyze via 4 entry points:
- "I have an idea" → Generate product strategy report
- "I have a product" → Analyze existing product
- "I have a competitor" → Competitive analysis with positioning
- "I want product inspirations" → Category-based recommendations

### 3. AI-Powered Analysis
**Primary AI**: DeepSeek Reasoner (consolidated, replaced OpenAI)
- **Strategy Reports**: Comprehensive 9-section executive summaries
- **Sections Generated**:
  1. Problem Summary
  2. Target Segment Definition
  3. Market Snapshot
  4. GTM Feasibility (scored)
  5. Technical Feasibility (scored)
  6. Monetization Model
  7. Risks & Constraints (scored)
  8. Build Path Recommendations
  9. Go/No-Go Recommendation

### 4. Export & Distribution
- **Formats**: Markdown, PDF (jsPDF + html2canvas)
- **CSV Export**: Structured data with scores and reasoning
- **Email Delivery**: Resend API integration with HTML templates

## Target User Profile
- **Solo founder**
- **Time commitment**: 2-5 hours/week
- **Budget**: ~$1,000
- **Location**: Australia (AU market focus)
- **Tech Stack Preference**: AWS, GitHub, Copilot, OpenAI/DeepSeek
- **Goals**: Maximum GTM speed, minimal technical complexity
- **Verticals**: Healthcare, real estate, professional services
- **Development Style**: Agent-driven (research, analysis, coding)

## Technical Architecture

### Frontend
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: React (AnalysisView, StrategyReport, EmailModal, Gallery)

### Backend
- **API Routes**: Next.js API routes (`/app/api/`)
- **Scrapers**: Custom web scrapers for BetaList, future platforms
- **AI Integration**: DeepSeek Reasoner API (previously OpenAI)
- **Email**: Resend API

### Infrastructure
- **Hosting**: AWS S3 + CloudFront (static deployment)
- **CI/CD**: GitHub Actions
- **Database**: PostgreSQL (recently set up for persistent storage)
  - Tables: `products`, `product_analyses`, `product_changes`
  - Indexes optimized for URL and timestamp queries

### Key Libraries
- `cheerio` - HTML parsing
- `jsPDF`, `html2canvas` - PDF generation
- `resend` - Email delivery
- `react-markdown` - Markdown rendering

## Project Status
- **Status**: Active Development (Deployed to Production)
- **Deployment**: AWS CloudFront distribution live
- **Latest Updates**:
  - Database setup completed (PostgreSQL with schema)
  - DeepSeek AI consolidation
  - Unified analysis architecture
  - Export/email functionality fully operational

## Development Context

### Recent Major Changes
1. **AI Consolidation**: Moved from OpenAI to DeepSeek Reasoner exclusively
2. **Database Integration**: PostgreSQL with product tracking and analysis history
3. **Unified Analysis**: Single analysis endpoint with complete data model
4. **Export Enhancements**: Comprehensive CSV with full analysis data

### Active Priorities (from ISSUES.md)
- Multi-platform scrapers (Indie Hackers, AlternativeTo, Hacker News)
- Product Hunt integration (backlogged due to licensing)
- Database-backed CSV export enhancements
- Integration tests for scraping

### Known Technical Debt
- TypeScript metadata export in layout.tsx
- Rate limiting for external API calls
- Monitoring and logging setup
- Integration tests for scraping functionality

## File Structure (Key Locations)
- **API Endpoints**: `/app/api/`
  - `/analyze/route.ts` - Main unified analysis endpoint
  - `/weekly/route.ts` - BetaList weekly products
  - `/email/route.ts` - Email delivery
- **Components**: `/components/`
  - `AnalysisView.tsx` - Analysis results display
  - `StrategyReport.tsx` - AI report rendering
  - `EmailModal.tsx` - Email sending UI
  - `Gallery.tsx` - Weekly products gallery
- **Core Logic**: `/lib/`
  - `deepseek.ts` - AI integration
  - `scraper.ts` - BetaList scraper
  - `exportUtils.ts` - PDF/CSV generation
  - `database.ts` - PostgreSQL client
- **Database**: `/db/schema.sql`
- **Documentation**: `/docs/`
  - `ISSUES.md` - Task/bug tracking
  - `PRODUCT_OVERVIEW` - Agent prompts (this file's source)
  - `DATABASE_SETUP.md` - DB configuration
  - `AWS_DEPLOYMENT.md` - Deployment guide

## Design Principles
1. **Speed to Market**: Prioritize MVP features over perfection
2. **AI-First**: Leverage agents for research, analysis, coding
3. **Data-Driven Decisions**: Provide actionable insights with scoring
4. **Australian First**: Focus on AU market viability
5. **Scrappy Bootstrapping**: Solo founder constraints inform architecture
6. **Iterative Development**: Ship fast, gather feedback, iterate

## Future Vision
- Multi-market analysis (beyond AU)
- Enhanced data sources (Product Hunt, Indie Hackers, paid APIs)
- Historical tracking and comparison dashboards
- Chrome extension for quick analysis
- Team collaboration features (Slack/Discord bot)
