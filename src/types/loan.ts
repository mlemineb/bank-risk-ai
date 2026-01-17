export interface LoanFormData {
    person_age: number;
    person_gender: 'female' | 'male';
    person_education: 'Associate' | 'Bachelor' | 'Doctorate' | 'High School' | 'Master';
    person_income: number;
    person_emp_exp: number;
    person_home_ownership: 'MORTGAGE' | 'OTHER' | 'OWN' | 'RENT';
    loan_amnt: number;
    loan_intent: 'DEBTCONSOLIDATION' | 'EDUCATION' | 'HOMEIMPROVEMENT' | 'MEDICAL' | 'PERSONAL' | 'VENTURE';
    loan_int_rate: number;
    loan_percent_income: number;
    cb_person_cred_hist_length: number;
    credit_score: number;
    previous_loan_defaults_on_file: 'No' | 'Yes';
}

export interface PredictionResult {
    approved: boolean;
    probability: number;
    message: string;
    factors: FeatureImportance[];
}

export interface FeatureImportance {
    feature: string;
    importance: number;
    value: string | number;
    impact: 'positive' | 'negative' | 'neutral';
}

export const GENDER_OPTIONS = ['female', 'male'] as const;
export const EDUCATION_OPTIONS = ['Associate', 'Bachelor', 'Doctorate', 'High School', 'Master'] as const;
export const HOME_OWNERSHIP_OPTIONS = ['MORTGAGE', 'OTHER', 'OWN', 'RENT'] as const;
export const LOAN_INTENT_OPTIONS = ['DEBTCONSOLIDATION', 'EDUCATION', 'HOMEIMPROVEMENT', 'MEDICAL', 'PERSONAL', 'VENTURE'] as const;
export const DEFAULTS_OPTIONS = ['No', 'Yes'] as const;

// Label encoder mappings (from the trained model)
export const LABEL_ENCODINGS = {
    person_gender: { female: 0, male: 1 },
    person_education: { Associate: 0, Bachelor: 1, Doctorate: 2, 'High School': 3, Master: 4 },
    person_home_ownership: { MORTGAGE: 0, OTHER: 1, OWN: 2, RENT: 3 },
    loan_intent: { DEBTCONSOLIDATION: 0, EDUCATION: 1, HOMEIMPROVEMENT: 2, MEDICAL: 3, PERSONAL: 4, VENTURE: 5 },
    previous_loan_defaults_on_file: { No: 0, Yes: 1 },
} as const;

// Feature importance from Random Forest model
export const FEATURE_IMPORTANCE: Record<string, number> = {
    loan_percent_income: 0.25,
    person_income: 0.15,
    credit_score: 0.12,
    loan_int_rate: 0.10,
    loan_amnt: 0.09,
    person_age: 0.07,
    cb_person_cred_hist_length: 0.06,
    person_emp_exp: 0.05,
    previous_loan_defaults_on_file: 0.04,
    person_home_ownership: 0.03,
    loan_intent: 0.02,
    person_education: 0.01,
    person_gender: 0.01,
};
