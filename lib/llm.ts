import { callDeepSeekReasoner } from './deepseek';
import { StartupData } from './betalist';

export async function generateStrategyReport(startup: StartupData): Promise<string> {
    // Check if we have a real API key
    if (!process.env.DEEPSEEK_API_KEY) {
        console.log("No DeepSeek API key found, returning mock strategy report");
        return getMockStrategyReport(startup);
    }

    try {
        const systemPrompt = `
You are an expert SaaS strategist and AI product architect. Generate a **Product-Side Executive Summary** for a new SaaS idea based on the startup data provided by the user.

**Default Context:**
Solo founder, 2–5 hrs/week, $1000 budget, based in Australia, prefers AWS + GitHub + Copilot + OpenAI for development, wants maximum GTM speed, and builds products in healthcare, real estate or professional services. Uses agents for research, analysis, and coding.

**SYSTEM INSTRUCTIONS**
Your output must be concise, structured, practical, and decision-ready. Use markdown formatting with clear headings.

Generate a comprehensive executive summary with the following 9 sections:

### 1. Problem Summary
- What core problem does the product solve?
- Who experiences it most urgently?
- Why now?
- Severity of pain (score 1–5)

### 2. Target Segment Definition
- Primary niche (choose only one)
- Why this segment over others
- Economic buyer vs. end user
- Urgency + willingness-to-pay score (1–5)

### 3. Market Snapshot
- Market size (use realistic ranges)
- Competitor landscape (direct, indirect, alternatives)
- Competitive gap opportunities
- Risk of incumbents copying the idea

### 4. GTM Feasibility for Solo Founder (Critical)
- Time-to-GTM estimate
- Simplicity score (1–5)
- Required distribution channels
- Early customer acquisition pathway
- Expected time to first revenue

### 5. Technical Feasibility
- Engineering complexity (score 1–5)
- Required components (frontend, backend, AI, scrapers, automation, infra)
- Data sources + scraping viability
- Core integration risk
- Regulatory concerns (especially healthcare/pro services)

### 6. Monetisation Model
- Recommended pricing model
- Early pricing tiers
- Margin and automation potential
- Risks and constraints

### 7. Risks & Constraints Assessment
Evaluate across:
- Market risk
- Execution risk
- Reliability risk (scraping, APIs, uptime)
- Legal/compliance risk (esp. healthcare)
- AI dependency risk
Score each from 1 (low) to 5 (high).

### 8. Build Path Recommendations
- What to build first (MVP scope)
- What to defer
- Realistic 4–6 week roadmap
- Where agents should be used vs. where human judgement is required

### 9. Go/No-Go Recommendation
- Clear recommendation based on constraints: Build / Pivot / Park
- Short rationale
- Pre-revenue KPIs to validate

Return your answer as a clean, concise **executive summary** with markdown headings matching the sections above.
`;

        const userPrompt = `
**Startup Name:** ${startup.name}
**Tagline:** ${startup.tagline}
**Description:** ${startup.description}
**Topics:** ${startup.topics.join(', ')}
**Website:** ${startup.website}
**Featured Date:** ${startup.featuredDate}

Based on this startup idea, generate a comprehensive Product-Side Executive Summary following the structure outlined in the system instructions.
`;

        const { content, reasoning } = await callDeepSeekReasoner(systemPrompt, userPrompt);

        // Log reasoning if available (Chain of Thought from DeepSeek Reasoner)
        if (reasoning) {
            console.log("DeepSeek Reasoning Process:", reasoning.substring(0, 500) + "...");
        }

        return content;

    } catch (error) {
        console.error("Error generating strategy report:", error);
        return getMockStrategyReport(startup);
    }
}

function getMockStrategyReport(startup: StartupData): string {
    return `
# Product-Side Executive Summary: ${startup.name}

> **Note:** This is a mock report. Configure \`DEEPSEEK_API_KEY\` in \`.env.local\` for AI-powered analysis.

## 1. Problem Summary
**Core Problem:** ${startup.description.substring(0, 150)}...

Users in this space struggle with inefficient workflows and lack of specialized tools that understand their unique needs.

**Who Experiences It:** Freelancers, small agencies, and boutique service providers in Australia.

**Why Now:** Increasing pressure to automate administrative tasks and maintain competitive margins in a tight labor market.

**Severity of Pain:** 4/5 - High pain point due to lost billable hours and administrative overhead.

---

## 2. Target Segment Definition
**Primary Niche:** Boutique Digital Agencies (5-20 employees)

**Why This Segment:** 
- High willingness to pay for productivity tools
- Clear decision makers (agency owners/operations directors)
- Immediate need for efficiency improvements
- Underserved by enterprise solutions that are too complex

**Economic Buyer vs. End User:** Agency Owner (buyer) / Project Managers & Team Leads (end users)

**Urgency + Willingness-to-Pay Score:** 4/5

---

## 3. Market Snapshot
**Market Size:** $50M - $100M TAM in Australia for this specific niche, with potential for $500M+ expansion to ANZ region.

**Competitor Landscape:**
- **Direct:** Global giants (Salesforce, HubSpot) - overly complex and expensive
- **Indirect:** Niche tools - often outdated UI/UX, poor Australian market fit
- **Alternatives:** Spreadsheets, manual processes

**Competitive Gap:** A "lite" AI-first alternative specifically designed for Australian compliance requirements and workflows.

**Copy Risk:** Medium - Incumbents have resources but move slowly due to enterprise focus.

---

## 4. GTM Feasibility for Solo Founder
**Time-to-GTM:** 4-6 weeks for functional MVP

**Simplicity Score:** 4/5 - Core value proposition can be delivered via straightforward web application

**Required Distribution Channels:**
- LinkedIn outreach and content marketing
- Local agency meetups and industry events
- Cold email campaigns to warm leads
- Product Hunt launch for initial traction

**Early Customer Acquisition Pathway:**
1. Build in public on LinkedIn/Twitter
2. Offer free beta to 5-10 agencies
3. Gather testimonials and case studies
4. Launch on Product Hunt
5. Paid customer conversion from beta users

**Expected Time to First Revenue:** Month 2-3

---

## 5. Technical Feasibility
**Engineering Complexity:** 3/5 - Moderate complexity, manageable for solo founder with AI assistance

**Required Components:**
- **Frontend:** Next.js + React + Tailwind CSS
- **Backend:** Next.js API Routes + Serverless Functions
- **Database:** Supabase or PostgreSQL on Railway
- **AI:** OpenAI API for text processing and automation
- **Infrastructure:** Vercel for hosting, AWS S3 for file storage

**Data Sources:** 
- User-generated input
- Optional integrations with public business registers
- API integrations with common tools (Slack, Gmail, etc.)

**Core Integration Risk:** Low to Medium - Most integrations have well-documented APIs

**Regulatory Concerns:** 
- Privacy Act compliance (Australia)
- GDPR if expanding to EU
- Data residency considerations for Australian customers

---

## 6. Monetisation Model
**Recommended Pricing Model:** Tiered SaaS Subscription

**Early Pricing Tiers:**
- **Starter:** $29/month (Solo freelancers, 1 user)
- **Team:** $99/month (Small agencies, up to 5 users)
- **Agency:** $249/month (Mid-size agencies, up to 20 users)

**Margin Potential:** 80%+ gross margin (typical for SaaS)

**Automation Potential:** High - Minimal customer support needed with good onboarding

**Risks and Constraints:**
- Price sensitivity in smaller market segments
- Need to demonstrate clear ROI quickly
- Potential for churn if value isn't immediately obvious

---

## 7. Risks & Constraints Assessment

| Risk Category | Score | Notes |
|--------------|-------|-------|
| **Market Risk** | 3/5 | Medium - Niche is proven but competitive |
| **Execution Risk** | 2/5 | Low - Solo founder with AI tools can execute MVP |
| **Reliability Risk** | 2/5 | Low - Modern stack is stable |
| **Legal/Compliance Risk** | 3/5 | Medium - Privacy compliance required |
| **AI Dependency Risk** | 4/5 | High - Core features rely on LLM quality |

---

## 8. Build Path Recommendations

**MVP Scope (Weeks 1-4):**
- User authentication and onboarding
- Core dashboard with 1-2 key automation workflows
- Basic analytics and reporting
- Payment integration (Stripe)

**Defer to v2:**
- Advanced analytics and insights
- Multi-team support and permissions
- Mobile application
- Third-party integrations beyond the essentials

**Realistic 4-6 Week Roadmap:**
- **Week 1:** Design system, auth flow, database schema
- **Week 2:** Core workflow logic and AI integration
- **Week 3:** UI polish, testing, and bug fixes
- **Week 4:** Beta launch with 5-10 customers

**Agent Usage:**
- **Use Agents For:** Code generation, testing, documentation, UI components
- **Human Judgment Required For:** UX decisions, customer conversations, pricing strategy, feature prioritization

---

## 9. Go/No-Go Recommendation

**Verdict:** ✅ **BUILD**

**Rationale:**
This opportunity offers a strong fit for solo founder constraints. The technical complexity is manageable with modern AI-assisted development tools. There's a clear, urgent pain point in a reachable niche market. The path to first revenue is realistic (2-3 months), and the business model supports sustainable growth with high margins.

**Pre-Revenue KPIs to Validate:**
- **Week 1:** 10+ beta signup requests from target segment
- **Week 2:** 5 customer discovery calls completed
- **Week 3:** Build-in-public content engagement (50+ LinkedIn interactions)
- **Week 4:** 3-5 active beta users providing feedback

**Next Immediate Steps:**
1. Validate the pain point with 10 customer interviews
2. Build landing page and start collecting waitlist signups
3. Create minimal clickable prototype for demos
4. Set up infrastructure (Vercel, Supabase, Stripe)

---

*Report generated by SaaS Viability Analyzer (Mock Mode)*
`;
}
