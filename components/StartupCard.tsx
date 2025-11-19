import { StartupData } from "@/lib/betalist";
import { AnalysisResult } from "@/lib/analyzer";
import { ExternalLink, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface StartupCardProps {
    startup: StartupData;
    analysis: AnalysisResult;
    isMock?: boolean;
}

export function StartupCard({ startup, analysis, isMock }: StartupCardProps) {
    const scoreColor =
        analysis.overallScore >= 80 ? "text-green-600 border-green-200 bg-green-50" :
            analysis.overallScore >= 60 ? "text-yellow-600 border-yellow-200 bg-yellow-50" :
                "text-red-600 border-red-200 bg-red-50";

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-slate-900">{startup.name}</h2>
                        {isMock && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                                Demo Data
                            </span>
                        )}
                    </div>
                    <p className="text-lg text-slate-600 font-medium">{startup.tagline}</p>
                </div>
                <div className={cn("flex flex-col items-center justify-center p-4 rounded-xl border-2", scoreColor)}>
                    <span className="text-3xl font-bold">{analysis.overallScore}</span>
                    <span className="text-xs uppercase tracking-wider font-semibold opacity-80">Viability</span>
                </div>
            </div>

            <p className="text-slate-600 mb-6 leading-relaxed">
                {startup.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
                {startup.topics.map((topic) => (
                    <span key={topic} className="px-3 py-1 bg-slate-50 text-slate-600 text-sm rounded-full border border-slate-200 font-medium">
                        {topic}
                    </span>
                ))}
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-500 border-t border-slate-100 pt-4">
                {startup.featuredDate && (
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Featured {startup.featuredDate}</span>
                    </div>
                )}
                {startup.website && (
                    <a
                        href={startup.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors font-medium"
                    >
                        <span>Visit Website</span>
                        <ExternalLink className="w-3 h-3" />
                    </a>
                )}
                {startup.betalistUrl && (
                    <a
                        href={startup.betalistUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-700 transition-colors"
                    >
                        <span>View on BetaList</span>
                        <ExternalLink className="w-3 h-3" />
                    </a>
                )}
            </div>
        </div>
    );
}
