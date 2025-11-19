import OpenAI from 'openai';
import { StartupData } from './betalist';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'mock-key',
    dangerouslyAllowBrowser: true // Only for demo purposes if needed client-side, but we'll use server-side
});

export async function generateStrategyReport(startup: StartupData): Promise<string> {
    // Check if we have a real API key
    if (!process.env.OPENAI_API_KEY) {
        console.log("No OpenAI API key found, returning mock strategy report");
        return getMockStrategyReport(startup);
    }

    try {
        const prompt = `
You are an expert SaaS strategist and AI product architect. Generate a **Product-Side Executive Summary** for a new SaaS idea based on the following startup data.

**Startup Name:** ${startup.name}
**Tagline:** ${startup.tagline}
**Description:** ${startup.description}
**Topics:** ${startup.topics.join(', ')}

**Default Context:**
Solo founder, 2–5 hrs/week, $1000 budget, based in Australia, prefers AWS + GitHub + Copilot + OpenAI for development, wants maximum GTM speed, and builds products in healthcare, real estate or professional services. Uses agents for research, analysis, and coding.

**Generate the following sections:**

1. Problem Summary
2. Target Segment Definition
3. Market Snapshot
4. GTM Feasibility
5. Technical Feasibility
6. Monetisation Model
7. Risks & Constraints (scored)
8. Build Path Recommendations
9. Go/No-Go Recommendation

**SYSTEM INSTRUCTIONS**
Your output must be concise, structured, practical, and decision-ready. Use markdown formatting with clear headings.

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

Return your answer as a clean, concise **executive summary** with headings matching the sections above.
`;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: prompt }],
            model: "gpt-4o",
        });

        return completion.choices[0].message.content || "Failed to generate report.";

    } catch (error) {
        console.error("Error generating strategy report:", error);
        return "Error generating strategy report. Please check server logs.";
    }
}

function getMockStrategyReport(startup: StartupData): string {
    return `
# Product-Side Executive Summary: ${startup.name}

## 1. Problem Summary
**Core Problem:** ${startup.description.substring(0, 100)}... Users struggle with inefficient workflows in this domain.
**Who:** Freelancers and small agencies in Australia.
**Why Now:** Increasing pressure to automate administrative tasks to maintain margins.
**Severity:** 4/5 - High pain point due to lost billable hours.

## 2. Target Segment Definition
**Primary Niche:** Boutique Digital Agencies (5-20 employees).
**Why:** High willingness to pay, clear decision makers, immediate need for efficiency.
**Buyer:** Agency Owner / Operations Director.
**Urgency Score:** 4/5.

## 3. Market Snapshot
**Market Size:** $50M - $100M TAM in Australia for this specific niche.
**Competitors:** Global giants (Salesforce, HubSpot) - too complex; Niche tools - often outdated.
**Gap:** A "lite" AI-first alternative specifically for Australian compliance/workflows.
**Copy Risk:** Medium - Incumbents move slowly but have resources.

## 4. GTM Feasibility
**Time-to-GTM:** 4 weeks for MVP.
**Simplicity Score:** 4/5 - Core value can be delivered via simple web app.
**Channels:** LinkedIn outreach, local agency meetups, cold email.
**First Revenue:** Month 2.

## 5. Technical Feasibility
**Complexity:** 3/5 - Moderate.
**Components:** Next.js Frontend, Supabase Backend, OpenAI API for text processing.
**Data Sources:** User input + public company registers.
**Regulatory:** GDPR/Privacy Act compliance required.

## 6. Monetisation Model
**Model:** Tiered Subscription (SaaS).
**Pricing:** $29/mo (Solo), $99/mo (Team).
**Margin:** High (80%+).

## 7. Risks & Constraints
- **Market Risk:** 3/5
- **Execution Risk:** 2/5
- **Reliability Risk:** 2/5
- **Legal Risk:** 3/5
- **AI Risk:** 4/5 (Dependency on LLM quality)

## 8. Build Path Recommendations
**MVP:** Core dashboard, 1 key automation workflow, user auth.
**Defer:** Advanced analytics, multi-team support, mobile app.
**Roadmap:**
- Week 1: Design & Auth
- Week 2: Core Workflow Logic
- Week 3: UI Polish & Testing
- Week 4: Soft Launch

## 9. Go/No-Go Recommendation
**Verdict:** **BUILD**
**Rationale:** Strong fit for solo founder constraints. High pain point in a reachable niche. Technical complexity is manageable.
**KPIs:** 10 Beta signups in Week 1.
`;
}
