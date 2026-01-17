import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { LoanFormData, LABEL_ENCODINGS, FEATURE_IMPORTANCE, PredictionResult, FeatureImportance } from '@/types/loan';

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

        // Call Python script for prediction
        const prediction = await runPythonPrediction(data);

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

async function runPythonPrediction(data: LoanFormData): Promise<{ approved: boolean; probability: number; message: string }> {
    return new Promise((resolve, reject) => {
        const pythonScript = path.join(process.cwd(), 'src', 'lib', 'ml', 'predict.py');

        const python = spawn('python', [pythonScript], {
            cwd: process.cwd(),
        });

        let stdout = '';
        let stderr = '';

        python.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        python.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        python.on('close', (code) => {
            if (code !== 0) {
                console.error('Python stderr:', stderr);
                reject(new Error(`Python script exited with code ${code}: ${stderr}`));
                return;
            }

            try {
                const result = JSON.parse(stdout);
                resolve(result);
            } catch (e) {
                reject(new Error(`Failed to parse Python output: ${stdout}`));
            }
        });

        python.on('error', (err) => {
            reject(err);
        });

        // Send data to Python script
        python.stdin.write(JSON.stringify(data));
        python.stdin.end();
    });
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
