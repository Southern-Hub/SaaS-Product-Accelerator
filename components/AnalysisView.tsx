import { ProductAnalysisComplete } from "@/lib/schemas";
import { StartupData } from "@/lib/betalist";
import { cn } from "@/lib/utils";
import { Code2, Globe2, TrendingUp, Download } from "lucide-react";
import { generateCSVFromAnalysis } from "@/lib/exportUtils";

interface AnalysisViewProps {
    analysis: ProductAnalysisComplete;
    startup: StartupData;
}

export function AnalysisView({ analysis, startup }: AnalysisViewProps) {

    const handleExportCSV = () => {
        const filename = `${startup.name.replace(/\s+/g, '-').toLowerCase()}-analysis.csv`;
        generateCSVFromAnalysis(startup, analysis, filename);
    };

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
                        score={analysis.scores.feasibility}
                        reasoning={`Complexity: ${analysis.technicalFeasibility.engineeringComplexity}/5. ${analysis.technicalFeasibility.estimatedDevTime}`}
                        color="bg-blue-600"
                    />

                    {/* Desirability */}
                    <ScoreRow
                        icon={<Globe2 className="w-5 h-5 text-purple-600" />}
                        label="Market Desirability"
                        score={analysis.scores.desirability}
                        reasoning={analysis.problemAnalysis.coreProblem}
                        color="bg-purple-600"
                    />

                    {/* Viability */}
                    <ScoreRow
                        icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
                        label="Business Viability"
                        score={analysis.scores.viability}
                        reasoning={analysis.businessModel.pricingModel}
                        color="bg-emerald-600"
                    />
                </div>
            </div>

            {/* CSV Export Button */}
            <button
                onClick={handleExportCSV}
                className="w-full py-3 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl font-medium shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
                <Download className="w-4 h-4" />
                Export Analysis as CSV
            </button>
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
