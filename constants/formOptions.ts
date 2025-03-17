import { ActivityLevel, Gender, MedicalCondition } from '@/types/patient';

export const GENDER_OPTIONS: { label: string; value: Gender }[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

export const ACTIVITY_LEVEL_OPTIONS: { label: string; value: ActivityLevel; description: string }[] = [
  { 
    label: 'Very Active', 
    value: 'very_active', 
    description: 'Regular intense exercise or sports (5-7 days per week)'
  },
  { 
    label: 'Moderately Active', 
    value: 'moderately_active', 
    description: 'Regular moderate exercise (3-5 days per week)'
  },
  { 
    label: 'Sedentary', 
    value: 'sedentary', 
    description: 'Little to no regular exercise, mostly sitting activities'
  },
];

export const MEDICAL_CONDITIONS: { label: string; value: MedicalCondition; hasDetails: boolean }[] = [
  { label: 'Diabetes', value: 'diabetes', hasDetails: true },
  { label: 'Hypertension', value: 'hypertension', hasDetails: false },
  { label: 'Dyslipidemia', value: 'dyslipidemia', hasDetails: false },
  { label: 'Chronic Kidney Disease', value: 'chronic_kidney_disease', hasDetails: true },
  { label: 'Obesity', value: 'obesity', hasDetails: false },
  { label: 'None of the above', value: 'none', hasDetails: false },
];

export const DIABETES_TYPES = [
  { label: 'Type 1', value: 'type1' },
  { label: 'Type 2', value: 'type2' },
  { label: 'Prediabetes', value: 'prediabetes' },
];

export const CKD_STAGES = [
  { label: 'Stage 1 (GFR ≥ 90)', value: '1' },
  { label: 'Stage 2 (GFR 60-89)', value: '2' },
  { label: 'Stage 3a (GFR 45-59)', value: '3a' },
  { label: 'Stage 3b (GFR 30-44)', value: '3b' },
  { label: 'Stage 4 (GFR 15-29)', value: '4' },
  { label: 'Stage 5 (GFR < 15)', value: '5' },
];