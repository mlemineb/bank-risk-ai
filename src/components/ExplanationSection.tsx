'use client';

import { FeatureImportance } from '@/types/loan';

interface ExplanationSectionProps {
    factors: FeatureImportance[];
    approved: boolean;
}

export default function ExplanationSection({ factors, approved }: ExplanationSectionProps) {
    const getImpactColor = (impact: FeatureImportance['impact']) => {
        switch (impact) {
            case 'positive':
                return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
            case 'negative':
                return 'text-red-400 bg-red-500/20 border-red-500/30';
            default:
                return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
        }
    };

    const getImpactIcon = (impact: FeatureImportance['impact']) => {
        switch (impact) {
            case 'positive':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                );
            case 'negative':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                );
        }
    };

    const getImpactLabel = (impact: FeatureImportance['impact']) => {
        switch (impact) {
            case 'positive':
                return 'Favorable';
            case 'negative':
                return 'Défavorable';
            default:
                return 'Neutre';
        }
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                Pourquoi ?
            </h3>

            <p className="text-slate-400 text-sm mb-6">
                {approved
                    ? 'Voici les facteurs qui ont contribué à l\'approbation de votre demande :'
                    : 'Voici les facteurs qui ont influencé le refus de votre demande :'}
            </p>

            <div className="space-y-3">
                {factors.map((factor, index) => (
                    <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border ${getImpactColor(factor.impact)}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">{getImpactIcon(factor.impact)}</div>
                            <div>
                                <p className="font-medium text-white text-sm">{factor.feature}</p>
                                <p className="text-xs text-slate-400">Valeur: {factor.value}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span
                                className={`inline-block px-2 py-1 rounded text-xs font-medium ${getImpactColor(
                                    factor.impact
                                )}`}
                            >
                                {getImpactLabel(factor.impact)}
                            </span>
                            <p className="text-xs text-slate-500 mt-1">
                                Importance: {Math.round(factor.importance * 100)}%
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recommendation */}
            <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                <h4 className="text-sm font-medium text-amber-400 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    Conseil
                </h4>
                <p className="text-sm text-slate-300">
                    {approved
                        ? 'Votre profil présente des caractéristiques favorables. Nous vous recommandons de maintenir une bonne gestion de vos finances pour préserver votre éligibilité.'
                        : 'Pour améliorer vos chances d\'approbation, nous vous conseillons de travailler sur les facteurs défavorables identifiés ci-dessus, notamment le ratio prêt/revenu et le score de crédit.'}
                </p>
            </div>
        </div>
    );
}
