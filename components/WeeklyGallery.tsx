"use client";

import { useState, useEffect } from "react";
import { Flame, Sparkles, MessageSquare, TrendingUp } from "lucide-react";

interface UnifiedProduct {
    name: string;
    tagline: string;
    url: string;
    sourceUrl: string;
    source: 'betalist' | 'hackernews' | 'indiehackers' | 'alternativeto';
    metadata?: {
        author?: string;
        comments?: number;
        timeAgo?: string;
        revenue?: string;
        likes?: number;
        category?: string;
    };
}

interface WeeklyGalleryProps {
    onSelectStartup: (url: string) => void;
}

const SOURCE_CONFIG = {
    betalist: {
        icon: '🚀',
        color: 'from-blue-50 to-violet-50',
        hoverColor: 'from-blue-100 to-violet-100',
        badge: 'bg-blue-100 text-blue-700',
        label: 'BetaList',
    },
    hackernews: {
        icon: '⚡',
        color: 'from-orange-50 to-amber-50',
        hoverColor: 'from-orange-100 to-amber-100',
        badge: 'bg-orange-100 text-orange-700',
        label: 'Hacker News',
    },
    indiehackers: {
        icon: '💡',
        color: 'from-emerald-50 to-teal-50',
        hoverColor: 'from-emerald-100 to-teal-100',
        badge: 'bg-emerald-100 text-emerald-700',
        label: 'Indie Hackers',
    },
    alternativeto: {
        icon: '⭐',
        color: 'from-purple-50 to-pink-50',
        hoverColor: 'from-purple-100 to-pink-100',
        badge: 'bg-purple-100 text-purple-700',
        label: 'AlternativeTo',
    },
};

export function WeeklyGallery({ onSelectStartup }: WeeklyGalleryProps) {
    const [products, setProducts] = useState<UnifiedProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchWeeklyProducts() {
            try {
                const response = await fetch('/api/weekly');
                const data = await response.json();
                setProducts(data.products || []);
            } catch (error) {
                console.error('Failed to fetch weekly products:', error);
                setProducts([]);
            } finally {
                setIsLoading(false);
            }
        }

        fetchWeeklyProducts();
    }, []);

    if (isLoading) {
        return (
            <div className="w-full max-w-5xl mx-auto mb-12">
                <div className="flex items-center gap-2 mb-4">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <h2 className="text-lg font-bold text-slate-900">Trending Startups This Week</h2>
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

    if (products.length === 0) {
        return null;
    }

    return (
        <div className="w-full max-w-5xl mx-auto mb-12">
            <div className="flex items-center gap-2 mb-4">
                <Flame className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-bold text-slate-900">Trending Startups This Week</h2>
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-slate-500 ml-auto">
                    From BetaList, Hacker News & Indie Hackers
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {products.map((product, index) => {
                    const config = SOURCE_CONFIG[product.source];
                    return (
                        <button
                            key={`${product.source}-${index}`}
                            onClick={() => onSelectStartup(product.sourceUrl)}
                            className="group bg-white border border-slate-200 rounded-lg hover:shadow-lg hover:border-blue-300 transition-all duration-200 text-left cursor-pointer overflow-hidden"
                        >
                            <div className={`bg-gradient-to-br ${config.color} rounded-t-lg p-4 flex items-center justify-center h-24 group-hover:${config.hoverColor} transition-colors`}>
                                <div className="text-3xl">{config.icon}</div>
                            </div>
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${config.badge} font-medium uppercase`}>
                                        {config.label}
                                    </span>
                                    {product.metadata?.comments !== undefined && product.metadata.comments > 0 && (
                                        <span className="flex items-center gap-1 text-[10px] text-slate-500">
                                            <MessageSquare className="w-3 h-3" />
                                            {product.metadata.comments}
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                    {product.name}
                                </h3>
                                <p className="text-xs text-slate-600 line-clamp-2">
                                    {product.tagline}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>

            <p className="text-xs text-slate-500 mt-3 text-center">
                Click any startup for instant analysis
            </p>
        </div>
    );
}

