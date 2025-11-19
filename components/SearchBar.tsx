"use client";

import { useState } from "react";
import { Search, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
    onSearch: (url: string) => Promise<void>;
    isLoading: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
    const [url, setUrl] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
            onSearch(url);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto relative">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 to-violet-200 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center">
                    <div className="absolute left-4 text-slate-400">
                        <Search className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste BetaList URL (e.g., https://betalist.com/startups/flowbase)"
                        className="w-full pl-12 pr-32 py-4 bg-white text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 shadow-sm"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !url.trim()}
                        className={cn(
                            "absolute right-2 top-2 bottom-2 px-4 rounded-md font-medium text-sm transition-all flex items-center gap-2",
                            isLoading || !url.trim()
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                        )}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Analyzing...</span>
                            </>
                        ) : (
                            <>
                                <span>Analyze</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
            <p className="mt-3 text-center text-slate-500 text-sm">
                Try: <span className="text-slate-400">https://betalist.com/startups/flowbase</span>
            </p>
        </form>
    );
}
