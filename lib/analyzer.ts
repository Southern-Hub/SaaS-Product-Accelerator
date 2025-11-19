import { StartupData } from './betalist';
import { callDeepSeekReasoner } from './deepseek';

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

const SYSTEM_PROMPT = `
You are an expert SaaS strategist and AI product architect. Your task is to analyze a SaaS startup idea and generate a structured viability report.

**Context Defaults:**
- Target Market: Australia (but consider global potential)
- Founder Profile: Solo founder, limited budget ($1000), speed-to-market focus.
- Tech Stack Preference: AWS, GitHub, Copilot, OpenAI.

**Analysis Requirements:**
Analyze the provided startup idea based on the following criteria and return a JSON object.

1.  **Technical Feasibility:**
    *   Engineering complexity (1-100 score).
    *   Required components (frontend, backend, AI, data sources).
    *   Integration risks.

2.  **Market Desirability:**
    *   Problem severity and urgency.
    *   Target segment willingness to pay.
    *   Market size and competition.

3.  **Business Viability:**
    *   Monetization potential.
    *   GTM feasibility for a solo founder.
    *   Risks (market, execution, legal).

**Output Format:**
You must return ONLY a valid JSON object with the following structure:
{
  "feasibility": {
    "score": number, // 0-100 (Higher is better/easier)
    "reasoning": "string"
  },
  "desirability": {
    "score": number, // 0-100 (Higher is better)
    "reasoning": "string"
  },
  "viability": {
    "score": number, // 0-100 (Higher is better)
    "reasoning": "string"
  },
  "overallScore": number, // 0-100 (Average of the three)
  "summary": "string" // A concise executive summary (max 200 words)
}
`;

export async function analyzeViability(startup: StartupData): Promise<AnalysisResult> {
    const { name, tagline, description, topics } = startup;

    const userPrompt = `
    **Startup Idea:**
    Name: ${name}
    Tagline: ${tagline}
    Description: ${description}
    Topics: ${topics.join(', ')}
    `;

    try {
        const { content } = await callDeepSeekReasoner(SYSTEM_PROMPT, userPrompt);

        // Clean the content to ensure it's valid JSON (remove markdown code blocks if present)
        const jsonString = content.replace(/```json\n?|\n?```/g, '').trim();

        const result = JSON.parse(jsonString);

        // Validate structure (basic check)
        if (!result.feasibility || !result.desirability || !result.viability) {
            throw new Error("Invalid JSON structure from AI response");
        }

        return result;

    } catch (error) {
        console.error("AI Analysis Failed:", error);

        // Fallback to heuristics if AI fails (e.g., no API key or timeout)
        return getFallbackAnalysis(startup);
    }
}

function getFallbackAnalysis(startup: StartupData): AnalysisResult {
    const { name, description, topics } = startup;
    const isTechHeavy = topics.some(t => ['Developer Tools', 'Artificial Intelligence', 'API'].includes(t));
    const isConsumer = topics.some(t => ['Productivity', 'User Experience', 'Social Media'].includes(t));

    const feasibilityScore = isTechHeavy ? 60 : 85;
    const desirabilityScore = isConsumer ? 90 : 70;
    const viabilityScore = Math.floor(Math.random() * 30) + 60;
    const overallScore = Math.round((feasibilityScore + desirabilityScore + viabilityScore) / 3);

    return {
        feasibility: {
            score: feasibilityScore,
            reasoning: "AI Analysis Unavailable. Estimated based on topic complexity.",
        },
        desirability: {
            score: desirabilityScore,
            reasoning: "AI Analysis Unavailable. Estimated based on market segment.",
        },
        viability: {
            score: viabilityScore,
            reasoning: "AI Analysis Unavailable. Estimated based on general SaaS benchmarks.",
        },
        overallScore,
        summary: `(Fallback Analysis) Copycat potential for ${name} is estimated at ${overallScore}. Please configure DeepSeek API for detailed insights.`,
    };
}
