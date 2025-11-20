import { AnalysisResult } from "./analyzer";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

interface DeepSeekMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface DeepSeekResponse {
    id: string;
    choices: {
        index: number;
        message: {
            role: string;
            content: string;
            reasoning_content?: string; // Chain of Thought
        };
        finish_reason: string;
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

export interface DeepSeekResult {
    content: string;
    reasoning?: string;
    tokenUsage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    processingTimeMs: number;
}

export async function callDeepSeekReasoner(
    systemPrompt: string,
    userPrompt: string
): Promise<DeepSeekResult> {
    const startTime = Date.now();
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
        throw new Error("DEEPSEEK_API_KEY is not set in environment variables");
    }

    try {
        const response = await fetch(DEEPSEEK_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "deepseek-reasoner",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                stream: false,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                `DeepSeek API Error: ${response.status} ${response.statusText} - ${JSON.stringify(
                    errorData
                )}`
            );
        }

        const data: DeepSeekResponse = await response.json();
        const choice = data.choices[0];

        if (!choice || !choice.message) {
            throw new Error("Invalid response format from DeepSeek API");
        }

        const processingTime = Date.now() - startTime;

        return {
            content: choice.message.content,
            reasoning: choice.message.reasoning_content,
            tokenUsage: data.usage ? {
                promptTokens: data.usage.prompt_tokens,
                completionTokens: data.usage.completion_tokens,
                totalTokens: data.usage.total_tokens,
            } : undefined,
            processingTimeMs: processingTime,
        };
    } catch (error) {
        console.error("DeepSeek API Call Failed:", error);
        throw error;
    }
}
