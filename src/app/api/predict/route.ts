import { NextRequest, NextResponse } from 'next/server';
import { LoanFormData, FEATURE_IMPORTANCE, PredictionResult, FeatureImportance } from '@/types/loan';

export async function POST(request: NextRequest) {
    try {
        const data: LoanFormData = await request.json();

        // Validate required fields
        const requiredFields = [
            'person_age', 'person_gender', 'person_education', 'person_income',
            'person_emp_exp', 'person_home_ownership', 'loan_amnt', 'loan_intent',
            'loan_int_rate', 'loan_percent_income', 'cb_person_cred_hist_length',
            'credit_score', 'previous_loan_defaults_on_file'
        ];

        for (const field of requiredFields) {
            if (data[field as keyof LoanFormData] === undefined || data[field as keyof LoanFormData] === null) {
                return NextResponse.json(
                    { error: `Missing required field: ${field}` },
                    { status: 400 }
                );
            }
        }

        // Run TypeScript-based prediction (no Python needed)
        const prediction = runPrediction(data);

        // Generate explanation factors
        const factors = generateExplanationFactors(data, prediction.approved);

        const result: PredictionResult = {
            ...prediction,
            factors,
        };

        return NextResponse.json(result);
    } catch (error) {
        console.error('Prediction error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la prédiction', details: String(error) },
            { status: 500 }
        );
    }
}

/**
 * Pure TypeScript prediction function that scores loan applications
 * Based on the Random Forest model's feature importances
 */
function runPrediction(data: LoanFormData): { approved: boolean; probability: number; message: string } {
    let score = 0.5; // Base score

    // 1. Loan percent income (25% importance) - CRITICAL FACTOR
    const loanPercentIncome = data.loan_percent_income;
    if (loanPercentIncome <= 0.1) {
        score += 0.20;
    } else if (loanPercentIncome <= 0.2) {
        score += 0.10;
    } else if (loanPercentIncome <= 0.3) {
        score += 0.0;
    } else if (loanPercentIncome <= 0.4) {
        score -= 0.15;
    } else {
        score -= 0.30;
    }

    // 2. Person income (15% importance)
    const income = data.person_income;
    if (income >= 100000) {
        score += 0.12;
    } else if (income >= 70000) {
        score += 0.08;
    } else if (income >= 50000) {
        score += 0.04;
    } else if (income >= 30000) {
        score -= 0.02;
    } else {
        score -= 0.08;
    }

    // 3. Credit score (12% importance)
    const creditScore = data.credit_score;
    if (creditScore >= 750) {
        score += 0.15;
    } else if (creditScore >= 700) {
        score += 0.10;
    } else if (creditScore >= 650) {
        score += 0.03;
    } else if (creditScore >= 600) {
        score -= 0.05;
    } else {
        score -= 0.20;
    }

    // 4. Interest rate (10% importance)
    const intRate = data.loan_int_rate;
    if (intRate <= 8) {
        score += 0.06;
    } else if (intRate <= 12) {
        score += 0.02;
    } else if (intRate <= 16) {
        score -= 0.04;
    } else {
        score -= 0.10;
    }

    // 5. Loan amount relative to income (9% importance)
    const loanToIncomeRatio = data.loan_amnt / data.person_income;
    if (loanToIncomeRatio <= 0.3) {
        score += 0.06;
    } else if (loanToIncomeRatio <= 0.5) {
        score += 0.02;
    } else if (loanToIncomeRatio <= 0.8) {
        score -= 0.03;
    } else {
        score -= 0.08;
    }

    // 6. Age (7% importance)
    const age = data.person_age;
    if (age >= 30 && age <= 55) {
        score += 0.04;
    } else if (age >= 25 && age < 30) {
        score += 0.02;
    } else if (age < 25) {
        score -= 0.03;
    } else {
        score -= 0.01;
    }

    // 7. Credit history length (6% importance)
    const histLength = data.cb_person_cred_hist_length;
    if (histLength >= 10) {
        score += 0.06;
    } else if (histLength >= 5) {
        score += 0.03;
    } else if (histLength >= 2) {
        score += 0.01;
    } else {
        score -= 0.05;
    }

    // 8. Employment experience (5% importance)
    const empExp = data.person_emp_exp;
    if (empExp >= 10) {
        score += 0.04;
    } else if (empExp >= 5) {
        score += 0.02;
    } else if (empExp >= 2) {
        score += 0.01;
    } else {
        score -= 0.03;
    }

    // 9. Previous defaults (4% importance) - STRONG NEGATIVE
    if (data.previous_loan_defaults_on_file === 'Yes') {
        score -= 0.25;
    } else {
        score += 0.05;
    }

    // 10. Home ownership (3% importance)
    if (data.person_home_ownership === 'OWN') {
        score += 0.04;
    } else if (data.person_home_ownership === 'MORTGAGE') {
        score += 0.02;
    } else if (data.person_home_ownership === 'RENT') {
        score -= 0.01;
    }

    // 11. Loan intent (2% importance)
    if (data.loan_intent === 'EDUCATION' || data.loan_intent === 'HOMEIMPROVEMENT') {
        score += 0.02;
    } else if (data.loan_intent === 'VENTURE') {
        score -= 0.02;
    }

    // 12. Education (1% importance)
    if (data.person_education === 'Doctorate' || data.person_education === 'Master') {
        score += 0.02;
    } else if (data.person_education === 'Bachelor') {
        score += 0.01;
    }

    // Normalize probability between 0 and 1
    const probability = Math.max(0, Math.min(1, score));

    // Decision threshold
    const approved = probability >= 0.5;

    return {
        approved,
        probability: Math.round(probability * 100) / 100,
        message: approved ? 'Prêt approuvé ✅' : 'Prêt refusé ❌'
    };
}

function generateExplanationFactors(data: LoanFormData, approved: boolean): FeatureImportance[] {
    const factors: FeatureImportance[] = [];

    // Ratio prêt/revenu
    const loanPercentIncome = data.loan_percent_income;
    factors.push({
        feature: 'Ratio Prêt/Revenu',
        importance: FEATURE_IMPORTANCE.loan_percent_income,
        value: `${(loanPercentIncome * 100).toFixed(1)}%`,
        impact: loanPercentIncome > 0.3 ? 'negative' : loanPercentIncome < 0.15 ? 'positive' : 'neutral',
    });

    // Score de crédit
    factors.push({
        feature: 'Score de Crédit',
        importance: FEATURE_IMPORTANCE.credit_score,
        value: data.credit_score,
        impact: data.credit_score >= 700 ? 'positive' : data.credit_score < 600 ? 'negative' : 'neutral',
    });

    // Revenu
    factors.push({
        feature: 'Revenu Annuel',
        importance: FEATURE_IMPORTANCE.person_income,
        value: `${data.person_income.toLocaleString('fr-FR')} €`,
        impact: data.person_income >= 80000 ? 'positive' : data.person_income < 40000 ? 'negative' : 'neutral',
    });

    // Défauts antérieurs
    factors.push({
        feature: 'Défauts Antérieurs',
        importance: FEATURE_IMPORTANCE.previous_loan_defaults_on_file,
        value: data.previous_loan_defaults_on_file === 'Yes' ? 'Oui' : 'Non',
        impact: data.previous_loan_defaults_on_file === 'Yes' ? 'negative' : 'positive',
    });

    // Taux d'intérêt
    factors.push({
        feature: "Taux d'Intérêt",
        importance: FEATURE_IMPORTANCE.loan_int_rate,
        value: `${data.loan_int_rate}%`,
        impact: data.loan_int_rate > 15 ? 'negative' : data.loan_int_rate < 10 ? 'positive' : 'neutral',
    });

    // Historique crédit
    factors.push({
        feature: 'Historique de Crédit',
        importance: FEATURE_IMPORTANCE.cb_person_cred_hist_length,
        value: `${data.cb_person_cred_hist_length} ans`,
        impact: data.cb_person_cred_hist_length >= 5 ? 'positive' : data.cb_person_cred_hist_length < 2 ? 'negative' : 'neutral',
    });

    // Sort by importance
    factors.sort((a, b) => b.importance - a.importance);

    return factors;
}
