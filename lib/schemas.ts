import { z } from 'zod';

// ============================================================================
// Zod Schemas for Runtime Validation
// ============================================================================

const ProductInfoSchema = z.object({
    name: z.string(),
    tagline: z.string(),
    description: z.string(),
    topics: z.array(z.string()),
    website: z.string(),
    featuredDate: z.string(),
    screenshotUrls: z.array(z.string()),
});

const ScoresSchema = z.object({
    feasibility: z.number().min(0).max(100),
    desirability: z.number().min(0).max(100),
    viability: z.number().min(0).max(100),
    overall: z.number().min(0).max(100),
});

const ProblemAnalysisSchema = z.object({
    coreProblem: z.string(),
    whoExperiencesIt: z.string(),
    whyNow: z.string(),
    severityScore: z.number().min(1).max(5),
    marketGap: z.string(),
});

const TargetMarketSchema = z.object({
    primaryNiche: z.string(),
    segmentSize: z.string(),
    whyThisSegment: z.string(),
    economicBuyer: z.string(),
    endUser: z.string(),
    urgencyScore: z.number().min(1).max(5),
    willingnessToPayScore: z.number().min(1).max(5),
});

const SimilarProductSchema = z.object({
    name: z.string(),
    description: z.string(),
    differentiator: z.string(),
});

const CompetitionSchema = z.object({
    competitionLevel: z.enum(['Low', 'Medium', 'High']),
    similarProducts: z.array(SimilarProductSchema),
    directCompetitors: z.array(z.string()),
    indirectCompetitors: z.array(z.string()),
    alternatives: z.array(z.string()),
    competitiveGap: z.string(),
    copyRisk: z.enum(['Low', 'Medium', 'High']),
});

const RequiredComponentsSchema = z.object({
    frontend: z.string(),
    backend: z.string(),
    database: z.string(),
    ai: z.string(),
    infrastructure: z.string(),
    integrations: z.array(z.string()),
});

const TechnicalFeasibilitySchema = z.object({
    engineeringComplexity: z.number().min(1).max(5),
    estimatedDevTime: z.string(),
    requiredComponents: RequiredComponentsSchema,
    dataSources: z.array(z.string()),
    integrationRisk: z.enum(['Low', 'Medium', 'High']),
    primaryRisks: z.array(z.string()),
    regulatoryConcerns: z.array(z.string()),
});

const GTMStrategySchema = z.object({
    timeToGTM: z.string(),
    simplicityScore: z.number().min(1).max(5),
    distributionChannels: z.array(z.string()),
    acquisitionPathway: z.array(z.string()),
    timeToFirstRevenue: z.string(),
});

const PricingTierSchema = z.object({
    name: z.string(),
    price: z.number(),
    currency: z.string(),
    billingPeriod: z.enum(['month', 'year']),
    targetCustomer: z.string(),
    keyFeatures: z.array(z.string()),
});

const BusinessModelSchema = z.object({
    pricingModel: z.string(),
    pricingTiers: z.array(PricingTierSchema),
    marginPotential: z.string(),
    automationPotential: z.enum(['Low', 'Medium', 'High']),
    monetizationRisks: z.array(z.string()),
});

const RiskItemSchema = z.object({
    score: z.number().min(1).max(5),
    notes: z.string(),
});

const RisksSchema = z.object({
    market: RiskItemSchema,
    execution: RiskItemSchema,
    reliability: RiskItemSchema,
    legal: RiskItemSchema,
    aiDependency: RiskItemSchema,
});

const WeeklyMilestoneSchema = z.object({
    week: z.number(),
    milestones: z.array(z.string()),
});

const AgentRecommendationsSchema = z.object({
    useAgentsFor: z.array(z.string()),
    humanJudgmentFor: z.array(z.string()),
});

const BuildPathSchema = z.object({
    mvpScope: z.array(z.string()),
    deferToV2: z.array(z.string()),
    weeklyRoadmap: z.array(WeeklyMilestoneSchema),
    agentRecommendations: AgentRecommendationsSchema,
});

const PreRevenueKPISchema = z.object({
    timeframe: z.string(),
    metric: z.string(),
});

const RecommendationSchema = z.object({
    verdict: z.enum(['BUILD', 'PIVOT', 'PARK']),
    confidence: z.number().min(0).max(100),
    rationale: z.string(),
    alternativeApproaches: z.array(z.string()).optional(),
    preRevenueKPIs: z.array(PreRevenueKPISchema),
    nextSteps: z.array(z.string()),
});

const TokenUsageSchema = z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number(),
    estimatedCostUSD: z.number(),
}).optional();

const MetadataSchema = z.object({
    schemaVersion: z.string(),
    modelUsed: z.string(),
    analyzedAt: z.string(),
    analyzedBy: z.string(),
    processingTimeMs: z.number(),
    tokenUsage: TokenUsageSchema,
    reasoning: z.string().optional(),
});

export const ProductAnalysisCompleteSchema = z.object({
    id: z.string(),
    productSlug: z.string(),
    sourceUrl: z.string(),
    source: z.string(),
    product: ProductInfoSchema,
    scores: ScoresSchema,
    summary: z.string(),
    problemAnalysis: ProblemAnalysisSchema,
    targetMarket: TargetMarketSchema,
    competition: CompetitionSchema,
    technicalFeasibility: TechnicalFeasibilitySchema,
    gtmStrategy: GTMStrategySchema,
    businessModel: BusinessModelSchema,
    risks: RisksSchema,
    buildPath: BuildPathSchema,
    recommendation: RecommendationSchema,
    markdownReport: z.string(),
    metadata: MetadataSchema,
    createdAt: z.string(),
    updatedAt: z.string(),
    status: z.enum(['completed', 'failed', 'pending']),
    errorMessage: z.string().optional(),
});

// ============================================================================
// TypeScript Types (Inferred from Zod Schemas)
// ============================================================================

export type ProductInfo = z.infer<typeof ProductInfoSchema>;
export type Scores = z.infer<typeof ScoresSchema>;
export type ProblemAnalysis = z.infer<typeof ProblemAnalysisSchema>;
export type TargetMarket = z.infer<typeof TargetMarketSchema>;
export type SimilarProduct = z.infer<typeof SimilarProductSchema>;
export type Competition = z.infer<typeof CompetitionSchema>;
export type RequiredComponents = z.infer<typeof RequiredComponentsSchema>;
export type TechnicalFeasibility = z.infer<typeof TechnicalFeasibilitySchema>;
export type GTMStrategy = z.infer<typeof GTMStrategySchema>;
export type PricingTier = z.infer<typeof PricingTierSchema>;
export type BusinessModel = z.infer<typeof BusinessModelSchema>;
export type RiskItem = z.infer<typeof RiskItemSchema>;
export type Risks = z.infer<typeof RisksSchema>;
export type WeeklyMilestone = z.infer<typeof WeeklyMilestoneSchema>;
export type AgentRecommendations = z.infer<typeof AgentRecommendationsSchema>;
export type BuildPath = z.infer<typeof BuildPathSchema>;
export type PreRevenueKPI = z.infer<typeof PreRevenueKPISchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;
export type TokenUsage = z.infer<typeof TokenUsageSchema>;
export type Metadata = z.infer<typeof MetadataSchema>;
export type ProductAnalysisComplete = z.infer<typeof ProductAnalysisCompleteSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validates and parses an analysis result from AI
 */
export function validateAnalysis(data: unknown): ProductAnalysisComplete {
    return ProductAnalysisCompleteSchema.parse(data);
}

/**
 * Safely validates without throwing, returns error if invalid
 */
export function safeValidateAnalysis(data: unknown): { success: true; data: ProductAnalysisComplete } |
    { success: false; error: z.ZodError } {
    const result = ProductAnalysisCompleteSchema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, error: result.error };
}
