import { analyzeViability } from './analyzer';
import { callDeepSeekReasoner } from './deepseek';
import { getMockStartupData } from './betalist';

// Mock dependencies
jest.mock('./deepseek');

describe('Analyzer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return AI analysis result when API call succeeds', async () => {
        const mockAnalysis = {
            feasibility: { score: 80, reasoning: 'Good' },
            desirability: { score: 90, reasoning: 'Great' },
            viability: { score: 85, reasoning: 'Solid' },
            overallScore: 85,
            summary: 'Excellent startup',
        };

        (callDeepSeekReasoner as jest.Mock).mockResolvedValue({
            content: JSON.stringify(mockAnalysis),
        });

        const startupData = getMockStartupData();
        const result = await analyzeViability(startupData);

        expect(result).toEqual(mockAnalysis);
        expect(callDeepSeekReasoner).toHaveBeenCalled();
    });

    it('should return fallback analysis when API call fails', async () => {
        (callDeepSeekReasoner as jest.Mock).mockRejectedValue(new Error('API Error'));

        const startupData = getMockStartupData();
        const result = await analyzeViability(startupData);

        expect(result.summary).toContain('(Fallback Analysis)');
        expect(result.feasibility.reasoning).toContain('AI Analysis Unavailable');
    });

    it('should return fallback analysis when API returns invalid JSON', async () => {
        (callDeepSeekReasoner as jest.Mock).mockResolvedValue({
            content: 'Invalid JSON',
        });

        const startupData = getMockStartupData();
        const result = await analyzeViability(startupData);

        expect(result.summary).toContain('(Fallback Analysis)');
    });
});
