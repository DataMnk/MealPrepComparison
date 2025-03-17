export type Gender = 'male' | 'female' | 'other';

export type ActivityLevel = 'very_active' | 'moderately_active' | 'sedentary';

export type MedicalCondition = 
  | 'diabetes' 
  | 'hypertension' 
  | 'dyslipidemia' 
  | 'chronic_kidney_disease' 
  | 'obesity' 
  | 'none';

export interface DiabetesDetails {
  a1c?: number;
  fastingGlucose?: number;
  type?: 'type1' | 'type2' | 'prediabetes';
}

export interface CKDDetails {
  stage?: '1' | '2' | '3a' | '3b' | '4' | '5';
  gfr?: number;
  creatinine?: number;
}

export interface PatientInfo {
  age: number;
  weight: number; // in kg
  height: number; // in cm
  gender: Gender;
  medicalConditions: MedicalCondition[];
  activityLevel: ActivityLevel;
  diabetesDetails?: DiabetesDetails;
  ckdDetails?: CKDDetails;
  bmi?: number; // calculated field
}

export interface ComparisonResult {
  patientInfo: PatientInfo;
  chatGptResponse: string;
  perplexityResponse: string;
}