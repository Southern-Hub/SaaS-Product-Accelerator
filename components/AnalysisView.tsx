import { AnalysisResult } from "@/lib/analyzer";
import { cn } from "@/lib/utils";
import { Code2, Globe2, TrendingUp } from "lucide-react";

interface AnalysisViewProps {
    analysis: AnalysisResult;
}

export function AnalysisView({ analysis }: AnalysisViewProps) {
    return (
        <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                    Analysis Breakdown
                </h3>

                <div className="space-y-8">
                    {/* Feasibility */}
                    <ScoreRow
                        icon={<Code2 className="w-5 h-5 text-blue-600" />}
                        label="Technical Feasibility"
                        score={analysis.feasibility.score}
                        reasoning={analysis.feasibility.reasoning}
                        color="bg-blue-600"
                    />

                    {/* Desirability */}
                    <ScoreRow
                        icon={<Globe2 className="w-5 h-5 text-purple-600" />}
                        label="Market Desirability"
                        score={analysis.desirability.score}
                        reasoning={analysis.desirability.reasoning}
                        color="bg-purple-600"
                    />

                    {/* Viability */}
                    <ScoreRow
                        icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
                        label="Business Viability"
                        score={analysis.viability.score}
                        reasoning={analysis.viability.reasoning}
                        color="bg-emerald-600"
                    />
                </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm">
                <h4 className="text-lg font-semibold text-slate-900 mb-2">Executive Summary</h4>
                <p className="text-slate-600 leading-relaxed">
                    {analysis.summary}
                </p>
            </div>
        </div>
    );
}

function ScoreRow({ icon, label, score, reasoning, color }: { icon: React.ReactNode, label: string, score: number, reasoning: string, color: string }) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg border border-slate-200">
                        {icon}
                    </div>
                    <span className="font-medium text-slate-700">{label}</span>
                </div>
                <span className="font-bold text-slate-900">{score}/100</span>
            </div>

            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={cn("h-full rounded-full transition-all duration-1000 ease-out", color)}
                    style={{ width: `${score}%` }}
                ></div>
            </div>

            <p className="text-sm text-slate-500 pl-12">
                {reasoning}
            </p>
        </div>
    );
}
