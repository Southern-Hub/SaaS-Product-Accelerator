import React, { useState } from 'react';
import { X, Mail, Loader2, CheckCircle } from 'lucide-react';

interface EmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    report: string;
    startupName: string;
}

export function EmailModal({ isOpen, onClose, report, startupName }: EmailModalProps) {
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const validateEmail = (email: string): boolean => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSend = async () => {
        setError(null);

        // Validate email
        if (!email) {
            setError('Please enter an email address');
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsSending(true);

        try {
            const response = await fetch('/api/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    report,
                    startupName,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send email');
            }

            setSent(true);
            setTimeout(() => {
                onClose();
                // Reset state after closing
                setTimeout(() => {
                    setEmail('');
                    setSent(false);
                }, 300);
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send email');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                            <Mail className="w-5 h-5 text-blue-600" />
                            <h3 className="font-bold text-lg text-slate-900">Email Strategy Report</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        {sent ? (
                            <div className="text-center py-8">
                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h4 className="text-lg font-semibold text-slate-900 mb-2">Email Sent!</h4>
                                <p className="text-slate-600">
                                    The strategy report for <span className="font-medium">{startupName}</span> has been sent to{' '}
                                    <span className="font-medium">{email}</span>
                                </p>
                            </div>
                        ) : (
                            <>
                                <p className="text-slate-600 mb-4">
                                    Send the strategy report for <span className="font-semibold">{startupName}</span> to your email.
                                </p>

                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            disabled={isSending}
                                        />
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleSend}
                                        disabled={isSending}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSending ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Mail className="w-4 h-4" />
                                                Send Report
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
