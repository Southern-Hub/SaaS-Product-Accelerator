"use client";

import { useState, useRef } from "react";
import { SearchBar } from "@/components/SearchBar";
import { WeeklyGallery } from "@/components/WeeklyGallery";
import { StartupCard } from "@/components/StartupCard";
import { AnalysisView } from "@/components/AnalysisView";
import { StartupData } from "@/lib/betalist";
import { AnalysisResult } from "@/lib/analyzer";
import { Sparkles } from "lucide-react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [startup, setStartup] = useState<StartupData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setStartup(null);
    setAnalysis(null);
    setIsMock(false);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze startup");
      }

      setStartup(data.startup);
      setAnalysis(data.analysis);
      setIsMock(data.isMock);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectStartup = (url: string) => {
    // Directly trigger analysis instead of just filling search bar
    handleSearch(url);
    // Scroll to results section
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-8 md:p-24">
      <div className="max-w-5xl mx-auto space-y-12">

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-sm font-medium mb-4 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered SaaS Analyzer</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900">
            SaaS Viability Analyzer
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Identify US-based startups and evaluate their "copycat potential" for the Australian market.
          </p>
        </div>

        {/* Weekly Gallery */}
        <WeeklyGallery onSelectStartup={handleSelectStartup} />

        {/* Search Section */}
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {/* Results Section */}
        {startup && analysis && (
          <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="space-y-8">
              <StartupCard startup={startup} analysis={analysis} isMock={isMock} />
            </div>
            <div className="space-y-8">
              <AnalysisView analysis={analysis} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
