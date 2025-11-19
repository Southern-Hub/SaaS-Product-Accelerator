import { StartupData } from './betalist';

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

export async function analyzeViability(startup: StartupData): Promise<AnalysisResult> {
    // TODO: Integrate with an LLM (e.g., OpenAI/Gemini) for real analysis.
    // For now, we simulate the analysis based on heuristics and random variations 
    // to demonstrate the UI and flow.

    const { name, description, topics } = startup;

    // Heuristic: Tech topics might imply higher feasibility complexity
    const isTechHeavy = topics.some(t => ['Developer Tools', 'Artificial Intelligence', 'API'].includes(t));

    // Heuristic: Consumer topics might imply higher desirability in mass markets
    const isConsumer = topics.some(t => ['Productivity', 'User Experience', 'Social Media'].includes(t));

    // Simulate scores
    const feasibilityScore = isTechHeavy ? 60 : 85; // Harder to copy if tech heavy
    const desirabilityScore = isConsumer ? 90 : 70; // Higher demand for consumer apps (generalization)
    const viabilityScore = Math.floor(Math.random() * 30) + 60; // Random between 60-90

    const overallScore = Math.round((feasibilityScore + desirabilityScore + viabilityScore) / 3);

    return {
        feasibility: {
            score: feasibilityScore,
            reasoning: isTechHeavy
                ? `High technical complexity due to reliance on ${topics.join(', ')}. Reverse engineering will require significant R&D.`
                : "Standard tech stack. Core features can be replicated using off-the-shelf components and modern frameworks.",
        },
        desirability: {
            score: desirabilityScore,
            reasoning: isConsumer
                ? "Strong market demand in Australia for productivity and UX-focused tools. Cultural fit is high."
                : "Niche market appeal. Requires localization of marketing materials to resonate with Australian businesses.",
        },
        viability: {
            score: viabilityScore,
            reasoning: "Moderate competition in the local market. First-mover advantage is possible if launched within 3 months.",
        },
        overallScore,
        summary: `Copycat potential for ${name} is ${overallScore > 75 ? 'High' : 'Moderate'}. The concept addresses a clear pain point (${description.substring(0, 50)}...) and has a viable path to market in Australia.`,
    };
}
