import { analyzeProductComplete, analyzeViability } from './analyzer';
import { callDeepSeekReasoner } from './deepseek';
import { getMockStartupData } from './betalist';

// Mock database module completely (define mocks before jest.mock)
jest.mock('./deepseek');

jest.mock('./database', () => ({
    saveAnalysis: jest.fn().mockResolvedValue(undefined),
    getAnalysisBySlug: jest.fn().mockResolvedValue(null),
    isFresh: jest.fn().mockReturnValue(false),
    getCacheTTL: jest.fn().mockReturnValue(7 * 24 * 60 * 60 * 1000),
}));

describe('Analyzer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        const { getAnalysisBySlug } = require('./database');
        getAnalysisBySlug.mockResolvedValue(null);
    });

    it('should return analysis from complete function', async () => {
        const mockCompleteResponse = {
            scores: {
                feasibility: 80,
                desirability: 90,
                viability: 85,
                overall: 85,
            },
            summary: 'Excellent startup',
            problemAnalysis: {
                coreProblem: 'Test problem',
                whoExperiencesIt: 'Users',
                whyNow: 'Market timing',
                severityScore: 4,
                marketGap: 'Gap exists',
            },
            targetMarket: {
                primaryNiche: 'Test niche',
                segmentSize: '$50M',
                whyThisSegment: 'Good fit',
                economicBuyer: 'Buyer',
                endUser: 'User',
                urgencyScore: 4,
                willingnessToPayScore: 4,
            },
            competition: {
                competitionLevel: 'Medium',
                similarProducts: [],
                directCompetitors: [],
                indirectCompetitors: [],
                alternatives: [],
                competitiveGap: 'Gap',
                copyRisk: 'Low',
            },
            technicalFeasibility: {
                engineeringComplexity: 3,
                estimatedDevTime: '4-6 weeks',
                requiredComponents: {
                    frontend: 'Next.js',
                    backend: 'API',
                    database: 'PostgreSQL',
                    ai: 'None',
                    infrastructure: 'Vercel',
                    integrations: [],
                },
                dataSources: [],
                integrationRisk: 'Low',
                primaryRisks: [],
                regulatoryConcerns: [],
            },
            gtmStrategy: {
                timeToGTM: '6 weeks',
                simplicityScore: 3,
                distributionChannels: [],
                acquisitionPathway: [],
                timeToFirstRevenue: 'Month 2',
            },
            businessModel: {
                pricingModel: 'Subscription',
                pricingTiers: [],
                marginPotential: '70%',
                automationPotential: 'Medium',
                monetizationRisks: [],
            },
            risks: {
                market: { score: 2, notes: 'Low' },
                execution: { score: 2, notes: 'Low' },
                reliability: { score: 2, notes: 'Low' },
                legal: { score: 2, notes: 'Low' },
                aiDependency: { score: 2, notes: 'Low' },
            },
            buildPath: {
                mvpScope: [],
                deferToV2: [],
                weeklyRoadmap: [],
                agentRecommendations: {
                    useAgentsFor: [],
                    humanJudgmentFor: [],
                },
            },
            recommendation: {
                verdict: 'BUILD',
                confidence: 85,
                rationale: 'Good opportunity',
                preRevenueKPIs: [],
                nextSteps: [],
            },
            markdownReport: '# Test Report',
        };

        (callDeepSeekReasoner as jest.Mock).mockResolvedValue({
            content: JSON.stringify(mockCompleteResponse),
            processingTimeMs: 1000,
        });

        const startupData = getMockStartupData();
        const result = await analyzeViability(startupData);

        expect(result.feasibility.score).toBe(80);
        expect(result.desirability.score).toBe(90);
        expect(result.viability.score).toBe(85);
        expect(result.overallScore).toBe(85);
        expect(callDeepSeekReasoner).toHaveBeenCalled();

        const { saveAnalysis } = require('./database');
        expect(saveAnalysis).toHaveBeenCalled();
    });

    it('should return fallback analysis when API call fails', async () => {
        (callDeepSeekReasoner as jest.Mock).mockRejectedValue(new Error('API Error'));

        const startupData = getMockStartupData();
        const result = await analyzeViability(startupData);

        expect(result.summary).toContain('(Fallback Analysis)');

        const { saveAnalysis } = require('./database');
        expect(saveAnalysis).toHaveBeenCalled();
    });

    it('should return fallback analysis when API returns invalid JSON', async () => {
        (callDeepSeekReasoner as jest.Mock).mockResolvedValue({
            content: 'Invalid JSON',
            processingTimeMs: 1000,
        });

        const startupData = getMockStartupData();
        const result = await analyzeViability(startupData);

        expect(result.summary).toContain('(Fallback Analysis)');

        const { saveAnalysis } = require('./database');
        expect(saveAnalysis).toHaveBeenCalled();
    });
});
