import { v4 as uuidv4 } from 'uuid';
import { StartupData } from './betalist';
import { callDeepSeekReasoner } from './deepseek';
import { ProductAnalysisComplete, safeValidateAnalysis } from './schemas';
import { saveAnalysis, getAnalysisBySlug, isFresh, getCacheTTL } from './database';

// ============================================================================
// Legacy Interface (for backward compatibility)
// ============================================================================

export interface AnalysisResult {
    feasibility: {
        score: number;
        reasoning: string;
    };
    desirability: {
        score: number;
        reasoning: string;
    };
    viability: {
        score: number;
        reasoning: string;
    };
    overallScore: number;
    summary: string;
}

// ============================================================================
// Unified System Prompt
// ============================================================================

const UNIFIED_SYSTEM_PROMPT = `
You are an expert SaaS strategist and AI product architect specializing in viability analysis for solo founders.

**Default Context:**
- Target Market: Australia (with global potential consideration)
- Founder Profile: Solo founder, $1000 budget, 2-5 hrs/week, speed-to-market focus
- Tech Stack: AWS, GitHub, Copilot, AI tools
- Expertise: Healthcare, real estate, professional services

**Your Task:**
Analyze the provided SaaS product and generate a comprehensive JSON analysis following the EXACT schema structure below.

**CRITICAL REQUIREMENTS:**
1. Return ONLY valid JSON - no markdown, no code blocks, no explanations
2. Include ALL fields from the schema
3. Use realistic, actionable insights
4. Be brutally honest about risks and challenges
5. Provide specific, measurable recommendations

**JSON Schema (YOU MUST MATCH THIS EXACTLY):**

{
  "scores": {
    "feasibility": number (0-100),
    "desirability": number (0-100),
    "viability": number (0-100),
    "overall": number (0-100, weighted average)
  },
  "summary": "string (200 word max executive summary)",
  "problemAnalysis": {
    "coreProblem": "string",
    "whoExperiencesIt": "string",
    "whyNow": "string (market timing)",
    "severityScore": number (1-5),
    "marketGap": "string"
  },
  "targetMarket": {
    "primaryNiche": "string (be specific)",
    "segmentSize": "string (TAM/SAM estimate)",
    "whyThisSegment": "string",
    "economicBuyer": "string",
    "endUser": "string",
    "urgencyScore": number (1-5),
    "willingnessToPayScore": number (1-5)
  },
  "competition": {
    "competitionLevel": "Low" | "Medium" | "High",
    "similarProducts": [
      {
        "name": "string",
        "description": "string",
        "differentiator": "string (how they differ)"
      }
    ],
    "directCompetitors": ["string"],
    "indirectCompetitors": ["string"],
    "alternatives": ["string"],
    "competitiveGap": "string",
    "copyRisk": "Low" | "Medium" | "High"
  },
  "technicalFeasibility": {
    "engineeringComplexity": number (1-5),
    "estimatedDevTime": "string (e.g., '4-6 weeks')",
    "requiredComponents": {
      "frontend": "string",
      "backend": "string",
      "database": "string",
      "ai": "string (or 'None')",
      "infrastructure": "string",
      "integrations": ["string"]
    },
    "dataSources": ["string"],
    "integrationRisk": "Low" | "Medium" | "High",
    "primaryRisks": ["string"],
    "regulatoryConcerns": ["string"]
  },
  "gtmStrategy": {
    "timeToGTM": "string",
    "simplicityScore": number (1-5),
    "distributionChannels": ["string"],
    "acquisitionPathway": ["string"],
    "timeToFirstRevenue": "string"
  },
  "businessModel": {
    "pricingModel": "string",
    "pricingTiers": [
      {
        "name": "string",
        "price": number,
        "currency": "string",
        "billingPeriod": "month" | "year",
        "targetCustomer": "string",
        "keyFeatures": ["string"]
      }
    ],
    "marginPotential": "string",
    "automationPotential": "Low" | "Medium" | "High",
    "monetizationRisks": ["string"]
  },
  "risks": {
    "market": { "score": number (1-5), "notes": "string" },
    "execution": { "score": number (1-5), "notes": "string" },
    "reliability": { "score": number (1-5), "notes": "string" },
    "legal": { "score": number (1-5), "notes": "string" },
    "aiDependency": { "score": number (1-5), "notes": "string" }
  },
  "buildPath": {
    "mvpScope": ["string"],
    "deferToV2": ["string"],
    "weeklyRoadmap": [
      {
        "week": number,
        "milestones": ["string"]
      }
    ],
    "agentRecommendations": {
      "useAgentsFor": ["string"],
      "humanJudgmentFor": ["string"]
    }
  },
  "recommendation": {
    "verdict": "BUILD" | "PIVOT" | "PARK",
    "confidence": number (0-100),
    "rationale": "string",
    "alternativeApproaches": ["string"] (optional),
    "preRevenueKPIs": [
      {
        "timeframe": "string",
        "metric": "string"
      }
    ],
    "nextSteps": ["string"]
  },
  "markdownReport": "string (formatted markdown version of the entire analysis)"
}

**Guidelines:**
- For "similarProducts": List 2-5 actual competing products with honest assessment
- For "markdownReport": Create a well-formatted markdown report with sections, tables, and bullet points
- Be specific with numbers, timelines, and recommendations
- Don't be generic - tailor everything to THIS specific product
`;

// ============================================================================
// Main Analysis Function (Unified)
// ============================================================================

export async function analyzeProductComplete(startup: StartupData): Promise<ProductAnalysisComplete> {
    const productSlug = extractSlugFromUrl(startup.betalistUrl);
    const startTime = Date.now();

    // Check cache first
    const cached = await getAnalysisBySlug(productSlug);
    if (cached && isFresh(cached.createdAt, getCacheTTL())) {
        console.log(`✅ Cache hit for ${productSlug}`);
        return cached;
    }

    console.log(`🔄 Running fresh analysis for ${productSlug}`);

    // Prepare user prompt
    const userPrompt = `
Analyze this SaaS product:

**Product Name:** ${startup.name}
**Tagline:** ${startup.tagline}
**Description:** ${startup.description}
**Topics/Categories:** ${startup.topics.join(', ')}
**Website:** ${startup.website}
**Source:** ${startup.betalistUrl}

Provide a comprehensive analysis following the exact JSON schema structure provided in the system prompt.
`;

    try {
        const { content, reasoning } = await callDeepSeekReasoner(
            UNIFIED_SYSTEM_PROMPT,
            userPrompt
        );

        const processingTime = Date.now() - startTime;

        // Clean JSON response (remove markdown code blocks if present)
        const jsonString = content
            .replace(/```json\n?|\n?```/g, '')
            .trim();

        const parsed = JSON.parse(jsonString);

        // Build complete analysis object
        const analysis: ProductAnalysisComplete = {
            id: uuidv4(),
            productSlug,
            sourceUrl: startup.betalistUrl,
            source: 'betalist', // TODO: Make this dynamic when adding more sources
            product: {
                name: startup.name,
                tagline: startup.tagline,
                description: startup.description,
                topics: startup.topics,
                website: startup.website,
                featuredDate: startup.featuredDate,
                screenshotUrls: startup.screenshotUrls,
            },
            scores: parsed.scores,
            summary: parsed.summary,
            problemAnalysis: parsed.problemAnalysis,
            targetMarket: parsed.targetMarket,
            competition: parsed.competition,
            technicalFeasibility: parsed.technicalFeasibility,
            gtmStrategy: parsed.gtmStrategy,
            businessModel: parsed.businessModel,
            risks: parsed.risks,
            buildPath: parsed.buildPath,
            recommendation: parsed.recommendation,
            markdownReport: parsed.markdownReport,
            metadata: {
                schemaVersion: '2.0',
                modelUsed: 'deepseek-reasoner',
                analyzedAt: new Date().toISOString(),
                analyzedBy: 'system',
                processingTimeMs: processingTime,
                tokenUsage: {
                    promptTokens: 0, // Will be updated when DeepSeek API returns this
                    completionTokens: 0,
                    totalTokens: 0,
                    estimatedCostUSD: 0,
                },
                reasoning: reasoning?.substring(0, 1000), // Store first 1000 chars of reasoning
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'completed',
        };

        // Validate the complete analysis
        const validationResult = safeValidateAnalysis(analysis);
        if (!validationResult.success) {
            console.error('Validation failed:', validationResult.error);
            throw new Error(`Schema validation failed: ${validationResult.error.message}`);
        }

        // Save to database
        await saveAnalysis(validationResult.data);

        console.log(`✅ Analysis complete for ${productSlug} (${processingTime}ms)`);

        return validationResult.data;

    } catch (error) {
        console.error('Analysis failed:', error);

        // Save failed analysis to database
        const failedAnalysis = getFallbackAnalysis(startup, productSlug, error);
        await saveAnalysis(failedAnalysis);

        return failedAnalysis;
    }
}

// ============================================================================
// Legacy Compatibility Function
// ============================================================================

/**
 * @deprecated Use analyzeProductComplete() instead
 */
export async function analyzeViability(startup: StartupData): Promise<AnalysisResult> {
    const complete = await analyzeProductComplete(startup);

    return {
        feasibility: {
            score: complete.scores.feasibility,
            reasoning: `Complexity: ${complete.technicalFeasibility.engineeringComplexity}/5. ${complete.technicalFeasibility.estimatedDevTime}`,
        },
        desirability: {
            score: complete.scores.desirability,
            reasoning: complete.problemAnalysis.coreProblem,
        },
        viability: {
            score: complete.scores.viability,
            reasoning: complete.businessModel.pricingModel,
        },
        overallScore: complete.scores.overall,
        summary: complete.summary,
    };
}

// ============================================================================
// Helper Functions
// ============================================================================

function extractSlugFromUrl(url: string): string {
    // Extract slug from URL like https://betalist.com/startups/product-name
    const match = url.match(/\/startups\/([^\/]+)/);
    return match ? match[1] : url.replace(/[^a-z0-9]/gi, '-').toLowerCase();
}

function getFallbackAnalysis(startup: StartupData, slug: string, error: unknown): ProductAnalysisComplete {
    const { name, description, topics } = startup;
    const isTechHeavy = topics.some(t => ['Developer Tools', 'Artificial Intelligence', 'API'].includes(t));
    const isConsumer = topics.some(t => ['Productivity', 'User Experience', 'Social Media'].includes(t));

    const feasibilityScore = isTechHeavy ? 60 : 75;
    const desirabilityScore = isConsumer ? 80 : 65;
    const viabilityScore = 70;
    const overallScore = Math.round((feasibilityScore + desirabilityScore + viabilityScore) / 3);

    return {
        id: uuidv4(),
        productSlug: slug,
        sourceUrl: startup.betalistUrl,
        source: 'betalist',
        product: {
            name: startup.name,
            tagline: startup.tagline,
            description: startup.description,
            topics: startup.topics,
            website: startup.website,
            featuredDate: startup.featuredDate,
            screenshotUrls: startup.screenshotUrls,
        },
        scores: {
            feasibility: feasibilityScore,
            desirability: desirabilityScore,
            viability: viabilityScore,
            overall: overallScore,
        },
        summary: `(Fallback Analysis) AI analysis unavailable. Estimated viability: ${overallScore}/100. Configure DEEPSEEK_API_KEY for detailed insights.`,
        problemAnalysis: {
            coreProblem: description.substring(0, 200),
            whoExperiencesIt: 'Unknown - requires AI analysis',
            whyNow: 'Unknown - requires AI analysis',
            severityScore: 3,
            marketGap: 'Unknown - requires AI analysis',
        },
        targetMarket: {
            primaryNiche: 'General market',
            segmentSize: 'Unknown',
            whyThisSegment: 'Unknown - requires AI analysis',
            economicBuyer: 'Unknown',
            endUser: 'Unknown',
            urgencyScore: 3,
            willingnessToPayScore: 3,
        },
        competition: {
            competitionLevel: 'Medium',
            similarProducts: [],
            directCompetitors: [],
            indirectCompetitors: [],
            alternatives: ['Manual processes'],
            competitiveGap: 'Unknown - requires AI analysis',
            copyRisk: 'Medium',
        },
        technicalFeasibility: {
            engineeringComplexity: isTechHeavy ? 4 : 2,
            estimatedDevTime: isTechHeavy ? '8-12 weeks' : '4-6 weeks',
            requiredComponents: {
                frontend: 'Next.js + React',
                backend: 'Next.js API Routes',
                database: 'PostgreSQL',
                ai: 'Unknown',
                infrastructure: 'Vercel',
                integrations: [],
            },
            dataSources: [],
            integrationRisk: 'Medium',
            primaryRisks: ['AI analysis unavailable'],
            regulatoryConcerns: [],
        },
        gtmStrategy: {
            timeToGTM: '4-8 weeks',
            simplicityScore: 3,
            distributionChannels: ['Product Hunt', 'Social Media'],
            acquisitionPathway: ['Build in public', 'Launch', 'Iterate'],
            timeToFirstRevenue: 'Month 2-3',
        },
        businessModel: {
            pricingModel: 'SaaS Subscription',
            pricingTiers: [{
                name: 'Starter',
                price: 29,
                currency: 'USD',
                billingPeriod: 'month',
                targetCustomer: 'Individual users',
                keyFeatures: ['Core features'],
            }],
            marginPotential: '70-80%',
            automationPotential: 'Medium',
            monetizationRisks: ['Unknown - requires AI analysis'],
        },
        risks: {
            market: { score: 3, notes: 'Unknown - requires AI analysis' },
            execution: { score: 3, notes: 'Unknown - requires AI analysis' },
            reliability: { score: 3, notes: 'Unknown - requires AI analysis' },
            legal: { score: 2, notes: 'Low risk for general SaaS' },
            aiDependency: { score: 2, notes: 'Unknown - requires AI analysis' },
        },
        buildPath: {
            mvpScope: ['Core features', 'User authentication', 'Basic analytics'],
            deferToV2: ['Advanced features', 'Integrations', 'Mobile app'],
            weeklyRoadmap: [{
                week: 1,
                milestones: ['Setup infrastructure', 'Design system'],
            }],
            agentRecommendations: {
                useAgentsFor: ['Code generation', 'Testing'],
                humanJudgmentFor: ['Product decisions', 'Customer conversations'],
            },
        },
        recommendation: {
            verdict: 'PARK',
            confidence: 30,
            rationale: 'AI analysis failed. Cannot provide reliable recommendation. Please configure DEEPSEEK_API_KEY and retry.',
            alternativeApproaches: [],
            preRevenueKPIs: [],
            nextSteps: ['Configure DEEPSEEK_API_KEY', 'Retry analysis'],
        },
        markdownReport: '# Fallback Analysis\n\nAI analysis unavailable. Please configure your DEEPSEEK_API_KEY environment variable and try again.',
        metadata: {
            schemaVersion: '2.0',
            modelUsed: 'fallback',
            analyzedAt: new Date().toISOString(),
            analyzedBy: 'system',
            processingTimeMs: 0,
            reasoning: `Fallback analysis due to error: ${error}`,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : String(error),
    };
}
