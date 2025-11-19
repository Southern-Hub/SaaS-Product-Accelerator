"use client";

import { useState, useEffect } from "react";
import { Flame, Sparkles } from "lucide-react";

interface StartupPreview {
    name: string;
    tagline: string;
    slug: string;
    betalistUrl: string;
}

interface WeeklyGalleryProps {
    onSelectStartup: (url: string) => void;
}

export function WeeklyGallery({ onSelectStartup }: WeeklyGalleryProps) {
    const [startups, setStartups] = useState<StartupPreview[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchWeeklyStartups() {
            try {
                const response = await fetch('/api/weekly');
                const data = await response.json();
                setStartups(data.startups || []);
            } catch (error) {
                console.error('Failed to fetch weekly startups:', error);
                setStartups([]);
            } finally {
                setIsLoading(false);
            }
        }

        fetchWeeklyStartups();
    }, []);

    if (isLoading) {
        return (
            <div className="w-full max-w-5xl mx-auto mb-12">
                <div className="flex items-center gap-2 mb-4">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <h2 className="text-lg font-bold text-slate-900">Featured This Week on BetaList</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="bg-slate-100 rounded-lg p-4 animate-pulse">
                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-slate-200 rounded w-full"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (startups.length === 0) {
        return null;
    }

    return (
        <div className="w-full max-w-5xl mx-auto mb-12">
            <div className="flex items-center gap-2 mb-4">
                <Flame className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-bold text-slate-900">Featured This Week on BetaList</h2>
                <Sparkles className="w-4 h-4 text-orange-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {startups.map((startup) => (
                    <button
                        key={startup.slug}
                        onClick={() => onSelectStartup(startup.betalistUrl)}
                        className="group bg-white border border-slate-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-200 text-left cursor-pointer"
                    >
                        <div className="bg-gradient-to-br from-blue-50 to-violet-50 rounded-t-lg p-4 flex items-center justify-center h-24 group-hover:from-blue-100 group-hover:to-violet-100 transition-colors">
                            <div className="text-3xl">🚀</div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                {startup.name}
                            </h3>
                            <p className="text-xs text-slate-600 line-clamp-2">
                                {startup.tagline}
                            </p>
                        </div>
                    </button>
                ))}
            </div>

            <p className="text-xs text-slate-500 mt-3 text-center">
                Click any startup for instant analysis
            </p>
        </div>
    );
}
