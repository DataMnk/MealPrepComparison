import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Activity, 
  User, 
  Weight, 
  Ruler, 
  Heart, 
  ArrowRight 
} from 'lucide-react-native';

import FormSection from '@/components/FormSection';
import FormInput from '@/components/FormInput';
import FormSelect from '@/components/FormSelect';
import FormCheckboxGroup from '@/components/FormCheckboxGroup';
import Button from '@/components/Button';

import { usePatientStore } from '@/store/patientStore';
import { 
  GENDER_OPTIONS, 
  ACTIVITY_LEVEL_OPTIONS, 
  MEDICAL_CONDITIONS,
  DIABETES_TYPES,
  CKD_STAGES
} from '@/constants/formOptions';
import colors from '@/constants/colors';
import { MedicalCondition } from '@/types/patient';

export default function PatientFormScreen() {
  const router = useRouter();
  const { patientInfo, updatePatientInfo, calculateBMI, submitForComparison, isLoading } = usePatientStore();
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!patientInfo.age || patientInfo.age <= 0) {
      newErrors.age = 'Please enter a valid age';
    }
    
    if (!patientInfo.weight || patientInfo.weight <= 0) {
      newErrors.weight = 'Please enter a valid weight';
    }
    
    if (!patientInfo.height || patientInfo.height <= 0) {
      newErrors.height = 'Please enter a valid height';
    }
    
    if (!patientInfo.gender) {
      newErrors.gender = 'Please select a gender';
    }
    
    if (!patientInfo.activityLevel) {
      newErrors.activityLevel = 'Please select an activity level';
    }
    
    if (!patientInfo.medicalConditions || patientInfo.medicalConditions.length === 0) {
      newErrors.medicalConditions = 'Please select at least one option';
    }
    
    // Validate diabetes details if diabetes is selected
    if (patientInfo.medicalConditions?.includes('diabetes')) {
      if (!patientInfo.diabetesDetails?.type) {
        newErrors.diabetesType = 'Please select diabetes type';
      }
    }
    
    // Validate CKD details if CKD is selected
    if (patientInfo.medicalConditions?.includes('chronic_kidney_disease')) {
      if (!patientInfo.ckdDetails?.stage) {
        newErrors.ckdStage = 'Please select CKD stage';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        await submitForComparison();
        router.push('/results');
      } catch (error) {
        Alert.alert('Error', 'Failed to submit patient information. Please try again.');
      }
    }
  };
  
  // Update BMI when height or weight changes
  useEffect(() => {
    if (patientInfo.height > 0 && patientInfo.weight > 0) {
      calculateBMI();
    }
  }, [patientInfo.height, patientInfo.weight]);
  
  // Handle medical conditions change
  const handleMedicalConditionsChange = (conditions: string[]) => {
    // If "none" is selected, clear other selections
    if (conditions.includes('none') && conditions.length > 1) {
      conditions = ['none'];
    }
    
    // If another condition is selected while "none" is already selected, remove "none"
    if (conditions.length > 1 && conditions.includes('none')) {
      conditions = conditions.filter(c => c !== 'none');
    }
    
    updatePatientInfo({ medicalConditions: conditions as MedicalCondition[] });
  };
  
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Patient Information</Text>
            <Text style={styles.subtitle}>
              Enter patient details to compare AI responses
            </Text>
          </View>
          
          {/* Basic Information */}
          <FormSection 
            title="Basic Information" 
            subtitle="Enter the patient's demographic information"
          >
            <View style={styles.row}>
              <View style={styles.column}>
                <FormInput
                  label="Age"
                  value={patientInfo.age ? patientInfo.age.toString() : ''}
                  onChangeText={(text) => updatePatientInfo({ age: parseInt(text) || 0 })}
                  keyboardType="numeric"
                  unit="years"
                  error={errors.age}
                  maxLength={3}
                />
              </View>
              <View style={styles.column}>
                <FormSelect
                  label="Gender"
                  options={GENDER_OPTIONS}
                  selectedValue={patientInfo.gender}
                  onSelect={(value) => updatePatientInfo({ gender: value as any })}
                  error={errors.gender}
                />
              </View>
            </View>
            
            <View style={styles.row}>
              <View style={styles.column}>
                <FormInput
                  label="Weight"
                  value={patientInfo.weight ? patientInfo.weight.toString() : ''}
                  onChangeText={(text) => updatePatientInfo({ weight: parseFloat(text) || 0 })}
                  keyboardType="numeric"
                  unit="kg"
                  error={errors.weight}
                />
              </View>
              <View style={styles.column}>
                <FormInput
                  label="Height"
                  value={patientInfo.height ? patientInfo.height.toString() : ''}
                  onChangeText={(text) => updatePatientInfo({ height: parseFloat(text) || 0 })}
                  keyboardType="numeric"
                  unit="cm"
                  error={errors.height}
                />
              </View>
            </View>
            
            {patientInfo.bmi && (
              <View style={styles.bmiContainer}>
                <Text style={styles.bmiLabel}>BMI:</Text>
                <Text style={styles.bmiValue}>{patientInfo.bmi.toFixed(1)}</Text>
                <Text style={styles.bmiCategory}>
                  {patientInfo.bmi < 18.5 ? 'Underweight' :
                   patientInfo.bmi < 25 ? 'Normal weight' :
                   patientInfo.bmi < 30 ? 'Overweight' : 'Obese'}
                </Text>
              </View>
            )}
          </FormSection>
          
          {/* Medical Conditions */}
          <FormSection 
            title="Medical Conditions" 
            subtitle="Select all conditions that apply to the patient"
          >
            <FormCheckboxGroup
              label="Select conditions"
              options={MEDICAL_CONDITIONS}
              selectedValues={patientInfo.medicalConditions || []}
              onChange={handleMedicalConditionsChange}
              error={errors.medicalConditions}
            />
            
            {/* Diabetes Details */}
            {patientInfo.medicalConditions?.includes('diabetes') && (
              <View style={styles.conditionDetails}>
                <Text style={styles.conditionDetailsTitle}>Diabetes Details</Text>
                
                <FormSelect
                  label="Diabetes Type"
                  options={DIABETES_TYPES}
                  selectedValue={patientInfo.diabetesDetails?.type || ''}
                  onSelect={(value) => updatePatientInfo({ 
                    diabetesDetails: { 
                      ...patientInfo.diabetesDetails || {}, 
                      type: value as any 
                    } 
                  })}
                  error={errors.diabetesType}
                />
                
                <View style={styles.row}>
                  <View style={styles.column}>
                    <FormInput
                      label="HbA1c (%)"
                      value={patientInfo.diabetesDetails?.a1c?.toString() || ''}
                      onChangeText={(text) => updatePatientInfo({ 
                        diabetesDetails: { 
                          ...patientInfo.diabetesDetails || {}, 
                          a1c: parseFloat(text) || undefined 
                        } 
                      })}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.column}>
                    <FormInput
                      label="Fasting Glucose"
                      value={patientInfo.diabetesDetails?.fastingGlucose?.toString() || ''}
                      onChangeText={(text) => updatePatientInfo({ 
                        diabetesDetails: { 
                          ...patientInfo.diabetesDetails || {}, 
                          fastingGlucose: parseFloat(text) || undefined 
                        } 
                      })}
                      keyboardType="numeric"
                      unit="mg/dL"
                    />
                  </View>
                </View>
              </View>
            )}
            
            {/* CKD Details */}
            {patientInfo.medicalConditions?.includes('chronic_kidney_disease') && (
              <View style={styles.conditionDetails}>
                <Text style={styles.conditionDetailsTitle}>Chronic Kidney Disease Details</Text>
                
                <FormSelect
                  label="CKD Stage"
                  options={CKD_STAGES}
                  selectedValue={patientInfo.ckdDetails?.stage || ''}
                  onSelect={(value) => updatePatientInfo({ 
                    ckdDetails: { 
                      ...patientInfo.ckdDetails || {}, 
                      stage: value as any 
                    } 
                  })}
                  error={errors.ckdStage}
                />
                
                <View style={styles.row}>
                  <View style={styles.column}>
                    <FormInput
                      label="GFR"
                      value={patientInfo.ckdDetails?.gfr?.toString() || ''}
                      onChangeText={(text) => updatePatientInfo({ 
                        ckdDetails: { 
                          ...patientInfo.ckdDetails || {}, 
                          gfr: parseFloat(text) || undefined 
                        } 
                      })}
                      keyboardType="numeric"
                      unit="mL/min"
                    />
                  </View>
                  <View style={styles.column}>
                    <FormInput
                      label="Creatinine"
                      value={patientInfo.ckdDetails?.creatinine?.toString() || ''}
                      onChangeText={(text) => updatePatientInfo({ 
                        ckdDetails: { 
                          ...patientInfo.ckdDetails || {}, 
                          creatinine: parseFloat(text) || undefined 
                        } 
                      })}
                      keyboardType="numeric"
                      unit="mg/dL"
                    />
                  </View>
                </View>
              </View>
            )}
          </FormSection>
          
          {/* Activity Level */}
          <FormSection 
            title="Physical Activity" 
            subtitle="Assess the patient's typical activity level"
          >
            <FormSelect
              label="Activity Level"
              options={ACTIVITY_LEVEL_OPTIONS}
              selectedValue={patientInfo.activityLevel}
              onSelect={(value) => updatePatientInfo({ activityLevel: value as any })}
              error={errors.activityLevel}
            />
          </FormSection>
          
          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <Button
              title="Compare AI Responses"
              onPress={handleSubmit}
              loading={isLoading}
              fullWidth
              icon={<ArrowRight size={20} color="#fff" />}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -8,
  },
  column: {
    flex: 1,
    paddingHorizontal: 8,
  },
  bmiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 12,
    backgroundColor: `${colors.info}10`,
    borderRadius: 8,
  },
  bmiLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  bmiValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.info,
    marginRight: 8,
  },
  bmiCategory: {
    fontSize: 16,
    color: colors.textLight,
  },
  conditionDetails: {
    marginTop: 16,
    padding: 16,
    backgroundColor: `${colors.primary}05`,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  conditionDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 24,
  },
});