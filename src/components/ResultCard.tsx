'use client';

import { PredictionResult } from '@/types/loan';

interface ResultCardProps {
    result: PredictionResult;
}

export default function ResultCard({ result }: ResultCardProps) {
    const approved = result.approved;
    const probability = Math.round(result.probability * 100);

    return (
        <div
            className={`relative overflow-hidden rounded-2xl border shadow-xl ${approved
                    ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30'
                    : 'bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/30'
                }`}
        >
            {/* Animated background effect */}
            <div
                className={`absolute inset-0 opacity-30 ${approved ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                style={{
                    background: approved
                        ? 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)'
                        : 'radial-gradient(circle at 50% 0%, rgba(239, 68, 68, 0.3) 0%, transparent 50%)',
                }}
            />

            <div className="relative p-8 text-center">
                {/* Status Icon */}
                <div
                    className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${approved ? 'bg-emerald-500/20' : 'bg-red-500/20'
                        }`}
                >
                    {approved ? (
                        <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                </div>

                {/* Status Text */}
                <h3
                    className={`text-3xl font-bold mb-2 ${approved ? 'text-emerald-400' : 'text-red-400'
                        }`}
                >
                    {approved ? 'ACCORDÉ' : 'REFUSÉ'}
                </h3>

                {/* Probability */}
                <div className="mt-4">
                    <p className="text-slate-400 text-sm mb-2">Probabilité d&apos;approbation</p>
                    <div className="relative w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ${approved ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-red-500 to-red-400'
                                }`}
                            style={{ width: `${probability}%` }}
                        />
                    </div>
                    <p className={`text-2xl font-bold mt-2 ${approved ? 'text-emerald-400' : 'text-red-400'}`}>
                        {probability}%
                    </p>
                </div>

                {/* Status Badge */}
                <div
                    className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full ${approved ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                        }`}
                >
                    <div className={`w-2 h-2 rounded-full ${approved ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
                    <span className="text-sm font-medium">
                        {approved ? 'Dossier favorable' : 'Dossier à risque'}
                    </span>
                </div>
            </div>
        </div>
    );
}
