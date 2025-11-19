import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FileText, Download } from 'lucide-react';

interface StrategyReportProps {
    report: string;
}

export function StrategyReport({ report }: StrategyReportProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-slate-800">AI Product Strategy Report</h3>
                </div>
                <button
                    onClick={() => {
                        const blob = new Blob([report], { type: 'text/markdown' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'strategy-report.md';
                        a.click();
                    }}
                    className="text-sm text-slate-600 hover:text-blue-600 flex items-center gap-1 transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Export
                </button>
            </div>
            <div className="p-6 prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-slate-600 prose-li:text-slate-600">
                <ReactMarkdown>{report}</ReactMarkdown>
            </div>
        </div>
    );
}
