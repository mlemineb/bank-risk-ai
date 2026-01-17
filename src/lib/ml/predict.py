import sys
import json
import joblib
import numpy as np
import os

# Get the directory where this script is located
script_dir = os.path.dirname(os.path.abspath(__file__))

# Load model and encoders
model = joblib.load(os.path.join(script_dir, 'loan_approval_model.joblib'))
label_encoders = joblib.load(os.path.join(script_dir, 'label_encoders.joblib'))

# Categorical columns that need encoding
CATEGORICAL_COLS = [
    'person_gender',
    'person_education', 
    'person_home_ownership',
    'loan_intent',
    'previous_loan_defaults_on_file'
]

# Feature order as expected by the model
FEATURE_ORDER = [
    'person_age',
    'person_gender',
    'person_education',
    'person_income',
    'person_emp_exp',
    'person_home_ownership',
    'loan_amnt',
    'loan_intent',
    'loan_int_rate',
    'loan_percent_income',
    'cb_person_cred_hist_length',
    'credit_score',
    'previous_loan_defaults_on_file'
]

def predict(data: dict) -> dict:
    """Make a prediction using the trained model"""
    try:
        # Encode categorical variables
        for col in CATEGORICAL_COLS:
            if col in data and col in label_encoders:
                le = label_encoders[col]
                data[col] = int(le.transform([data[col]])[0])
        
        # Create feature array in correct order
        features = np.array([[data[col] for col in FEATURE_ORDER]])
        
        # Make prediction
        prediction = model.predict(features)[0]
        probability = model.predict_proba(features)[0][1]
        
        return {
            'approved': bool(prediction),
            'probability': float(probability),
            'message': 'Prêt approuvé ✅' if prediction else 'Prêt refusé ❌'
        }
    except Exception as e:
        return {
            'error': str(e),
            'approved': False,
            'probability': 0.0,
            'message': f'Erreur: {str(e)}'
        }

if __name__ == '__main__':
    # Read input from stdin
    input_data = json.loads(sys.stdin.read())
    result = predict(input_data)
    print(json.dumps(result))
