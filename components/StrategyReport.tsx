import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, Download, Mail, ChevronDown } from 'lucide-react';
import { generatePDFFromHTML } from '@/lib/exportUtils';

interface StrategyReportProps {
    report: string;
    startupName: string;
    onEmailClick: () => void;
}

export function StrategyReport({ report, startupName, onEmailClick }: StrategyReportProps) {
    const [showExportMenu, setShowExportMenu] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    const handleExportMarkdown = () => {
        const blob = new Blob([report], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${startupName.replace(/\s+/g, '-').toLowerCase()}-strategy-report.md`;
        a.click();
        URL.revokeObjectURL(url);
        setShowExportMenu(false);
    };

    const handleExportPDF = async () => {
        if (!reportRef.current) {
            alert('Report not ready for export. Please try again.');
            return;
        }

        const filename = `${startupName.replace(/\s+/g, '-').toLowerCase()}-strategy-report.pdf`;
        await generatePDFFromHTML(reportRef.current, filename);
        setShowExportMenu(false);
    };

    return (
        <div ref={reportRef} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-slate-800">AI Product Strategy Report</h3>
                </div>
                <div className="flex items-center gap-2">
                    {/* Email Button */}
                    <button
                        onClick={onEmailClick}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <Mail className="w-4 h-4" />
                        Email
                    </button>

                    {/* Export Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export
                            <ChevronDown className="w-3 h-3" />
                        </button>

                        {showExportMenu && (
                            <>
                                {/* Backdrop to close menu */}
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowExportMenu(false)}
                                />

                                {/* Dropdown Menu */}
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                                    <button
                                        onClick={handleExportMarkdown}
                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        Download as Markdown
                                    </button>
                                    <button
                                        onClick={handleExportPDF}
                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        Download as PDF
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className="p-8 prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8 prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-6 prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-4 prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4 prose-li:text-slate-700 prose-ul:my-4 prose-ol:my-4 prose-strong:text-slate-900 prose-strong:font-semibold prose-code:text-violet-600 prose-code:bg-violet-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm prose-code:before:content-[''] prose-code:after:content-[''] prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-600">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown>
            </div>
        </div>
    );
}
