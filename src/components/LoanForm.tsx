'use client';

import { useState, useEffect } from 'react';
import {
    LoanFormData,
    GENDER_OPTIONS,
    EDUCATION_OPTIONS,
    HOME_OWNERSHIP_OPTIONS,
    LOAN_INTENT_OPTIONS,
    DEFAULTS_OPTIONS,
} from '@/types/loan';

interface LoanFormProps {
    onSubmit: (data: LoanFormData) => void;
    loading: boolean;
}

const INTENT_LABELS: Record<string, string> = {
    DEBTCONSOLIDATION: 'Consolidation de dettes',
    EDUCATION: 'Éducation',
    HOMEIMPROVEMENT: 'Amélioration habitat',
    MEDICAL: 'Frais médicaux',
    PERSONAL: 'Personnel',
    VENTURE: 'Entreprise',
};

const OWNERSHIP_LABELS: Record<string, string> = {
    MORTGAGE: 'Hypothèque',
    OTHER: 'Autre',
    OWN: 'Propriétaire',
    RENT: 'Locataire',
};

export default function LoanForm({ onSubmit, loading }: LoanFormProps) {
    const [formData, setFormData] = useState<Partial<LoanFormData>>({
        person_age: 30,
        person_gender: 'male',
        person_education: 'Bachelor',
        person_income: 60000,
        person_emp_exp: 5,
        person_home_ownership: 'RENT',
        loan_amnt: 10000,
        loan_intent: 'PERSONAL',
        loan_int_rate: 11,
        loan_percent_income: 0,
        cb_person_cred_hist_length: 5,
        credit_score: 650,
        previous_loan_defaults_on_file: 'No',
    });

    // Auto-calculate loan_percent_income
    useEffect(() => {
        if (formData.loan_amnt && formData.person_income && formData.person_income > 0) {
            const ratio = formData.loan_amnt / formData.person_income;
            setFormData((prev) => ({ ...prev, loan_percent_income: Math.round(ratio * 100) / 100 }));
        }
    }, [formData.loan_amnt, formData.person_income]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData as LoanFormData);
    };

    const inputClass =
        'w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all';
    const labelClass = 'block text-sm font-medium text-slate-300 mb-1.5';

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Âge</label>
                    <input
                        type="number"
                        name="person_age"
                        value={formData.person_age}
                        onChange={handleChange}
                        min="18"
                        max="100"
                        className={inputClass}
                        required
                    />
                </div>
                <div>
                    <label className={labelClass}>Genre</label>
                    <select name="person_gender" value={formData.person_gender} onChange={handleChange} className={inputClass}>
                        {GENDER_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt === 'female' ? 'Femme' : 'Homme'}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Niveau d&apos;études</label>
                    <select
                        name="person_education"
                        value={formData.person_education}
                        onChange={handleChange}
                        className={inputClass}
                    >
                        {EDUCATION_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Situation logement</label>
                    <select
                        name="person_home_ownership"
                        value={formData.person_home_ownership}
                        onChange={handleChange}
                        className={inputClass}
                    >
                        {HOME_OWNERSHIP_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                                {OWNERSHIP_LABELS[opt]}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Revenu annuel (€)</label>
                    <input
                        type="number"
                        name="person_income"
                        value={formData.person_income}
                        onChange={handleChange}
                        min="0"
                        step="1000"
                        className={inputClass}
                        required
                    />
                </div>
                <div>
                    <label className={labelClass}>Expérience pro (années)</label>
                    <input
                        type="number"
                        name="person_emp_exp"
                        value={formData.person_emp_exp}
                        onChange={handleChange}
                        min="0"
                        max="50"
                        className={inputClass}
                        required
                    />
                </div>
            </div>

            {/* Credit Information */}
            <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-medium text-amber-400 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Informations de Crédit
                </h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Score de crédit</label>
                        <input
                            type="number"
                            name="credit_score"
                            value={formData.credit_score}
                            onChange={handleChange}
                            min="300"
                            max="850"
                            className={inputClass}
                            required
                        />
                        <p className="text-xs text-slate-500 mt-1">300-850</p>
                    </div>
                    <div>
                        <label className={labelClass}>Historique crédit (années)</label>
                        <input
                            type="number"
                            name="cb_person_cred_hist_length"
                            value={formData.cb_person_cred_hist_length}
                            onChange={handleChange}
                            min="0"
                            max="30"
                            className={inputClass}
                            required
                        />
                    </div>
                </div>
                <div className="mt-4">
                    <label className={labelClass}>Défauts de paiement antérieurs</label>
                    <select
                        name="previous_loan_defaults_on_file"
                        value={formData.previous_loan_defaults_on_file}
                        onChange={handleChange}
                        className={inputClass}
                    >
                        {DEFAULTS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt === 'No' ? 'Non' : 'Oui'}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Loan Information */}
            <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-medium text-amber-400 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Informations du Prêt
                </h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Montant demandé (€)</label>
                        <input
                            type="number"
                            name="loan_amnt"
                            value={formData.loan_amnt}
                            onChange={handleChange}
                            min="500"
                            max="100000"
                            step="500"
                            className={inputClass}
                            required
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Objet du prêt</label>
                        <select name="loan_intent" value={formData.loan_intent} onChange={handleChange} className={inputClass}>
                            {LOAN_INTENT_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                    {INTENT_LABELS[opt]}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className={labelClass}>Taux d&apos;intérêt (%)</label>
                        <input
                            type="number"
                            name="loan_int_rate"
                            value={formData.loan_int_rate}
                            onChange={handleChange}
                            min="5"
                            max="25"
                            step="0.1"
                            className={inputClass}
                            required
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Ratio prêt/revenu</label>
                        <input
                            type="number"
                            name="loan_percent_income"
                            value={formData.loan_percent_income}
                            onChange={handleChange}
                            step="0.01"
                            className={`${inputClass} bg-slate-600/30`}
                            readOnly
                        />
                        <p className="text-xs text-slate-500 mt-1">Calculé automatiquement</p>
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25"
            >
                {loading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                        Analyse en cours...
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        Analyser ma demande
                    </>
                )}
            </button>
        </form>
    );
}
