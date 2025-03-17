import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PatientInfo, ComparisonResult } from '@/types/patient';

interface PatientState {
  patientInfo: PatientInfo;
  comparisonResult: ComparisonResult | null;
  isLoading: boolean;
  updatePatientInfo: (info: Partial<PatientInfo>) => void;
  resetPatientInfo: () => void;
  calculateBMI: () => void;
  submitForComparison: () => Promise<void>;
}

const initialPatientInfo: PatientInfo = {
  age: 0,
  weight: 0,
  height: 0,
  gender: 'male',
  medicalConditions: [],
  activityLevel: 'sedentary',
};

export const usePatientStore = create<PatientState>()(
  persist(
    (set, get) => ({
      patientInfo: initialPatientInfo,
      comparisonResult: null,
      isLoading: false,
      
      updatePatientInfo: (info) => {
        set((state) => ({
          patientInfo: {
            ...state.patientInfo,
            ...info,
          },
        }));
      },
      
      resetPatientInfo: () => {
        set({ patientInfo: initialPatientInfo, comparisonResult: null });
      },
      
      calculateBMI: () => {
        const { height, weight } = get().patientInfo;
        if (height > 0 && weight > 0) {
          const heightInMeters = height / 100;
          const bmi = weight / (heightInMeters * heightInMeters);
          set((state) => ({
            patientInfo: {
              ...state.patientInfo,
              bmi: parseFloat(bmi.toFixed(1)),
            },
          }));
        }
      },
      
      submitForComparison: async () => {
        set({ isLoading: true });
        
        try {
          const patientInfo = get().patientInfo;
          
          // Call the backend API with patient information
          const response = await fetch('http://localhost:8000/nutrition-recommendation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ patientInfo }),
          });
          
          if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
          }
          
          const data = await response.json();
          
          set({
            comparisonResult: {
              patientInfo,
              chatGptResponse: data.chatGptResponse,
              perplexityResponse: data.perplexityResponse,
            },
            isLoading: false,
          });
        } catch (error) {
          console.error('Error submitting for comparison:', error);
          set({ isLoading: false });
          
          // Fallback to mock responses if the API call fails
          // This is useful for development when the backend might not be running
          const patientInfo = get().patientInfo;
          const chatGptResponse = generateMockChatGptResponse(patientInfo);
          const perplexityResponse = generateMockPerplexityResponse(patientInfo);
          
          set({
            comparisonResult: {
              patientInfo,
              chatGptResponse: `[FALLBACK MODE] ${chatGptResponse}`,
              perplexityResponse: `[FALLBACK MODE] ${perplexityResponse}`,
            },
          });
        }
      },
    }),
    {
      name: 'patient-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Mock response generators
function generateMockChatGptResponse(patientInfo: PatientInfo): string {
  const { age, gender, medicalConditions, activityLevel, bmi } = patientInfo;
  
  let response = `Based on the patient profile (${age} year old ${gender}, BMI: ${bmi?.toFixed(1) || 'N/A'}), `;
  
  if (medicalConditions.includes('none')) {
    response += "the patient appears to be in generally good health with no reported chronic conditions. ";
  } else {
    response += `the patient has the following health considerations: ${medicalConditions.join(', ')}. `;
  }
  
  if (medicalConditions.includes('diabetes')) {
    response += "\n\nFor diabetes management, I recommend monitoring blood glucose levels regularly and maintaining a consistent carbohydrate intake throughout the day. ";
  }
  
  if (medicalConditions.includes('hypertension')) {
    response += "\n\nRegarding hypertension, the DASH diet (rich in fruits, vegetables, whole grains, and low-fat dairy) has shown significant benefits in blood pressure reduction. ";
  }
  
  switch (activityLevel) {
    case 'very_active':
      response += "\n\nGiven the patient's very active lifestyle, ensure adequate protein intake and hydration to support recovery from physical activity. ";
      break;
    case 'moderately_active':
      response += "\n\nWith moderate activity levels, encourage maintaining current exercise habits while focusing on consistency rather than intensity. ";
      break;
    case 'sedentary':
      response += "\n\nThe sedentary lifestyle is a concern. I recommend starting with short, 10-minute walking breaks throughout the day and gradually increasing activity. ";
      break;
  }
  
  response += "\n\nOverall recommendations include:\n- Balanced diet rich in whole foods\n- Regular physical activity appropriate to their condition\n- Adequate sleep (7-9 hours)\n- Stress management techniques\n- Regular medical check-ups";
  
  return response;
}

function generateMockPerplexityResponse(patientInfo: PatientInfo): string {
  const { age, gender, medicalConditions, activityLevel, bmi } = patientInfo;
  
  let response = `# Patient Analysis\n\nPatient profile: ${age} years old, ${gender}, BMI: ${bmi?.toFixed(1) || 'N/A'}\n\n`;
  
  response += "## Health Status\n";
  if (medicalConditions.includes('none')) {
    response += "Patient reports no chronic conditions, suggesting generally good health.\n\n";
  } else {
    response += `Patient reports ${medicalConditions.length} condition(s): ${medicalConditions.join(', ')}.\n\n`;
  }
  
  response += "## Condition-Specific Recommendations\n";
  
  if (medicalConditions.includes('diabetes')) {
    response += "### Diabetes Management\n- Monitor HbA1c quarterly\n- Consider continuous glucose monitoring\n- Limit added sugars and refined carbohydrates\n- Recent research suggests timing of meals may impact glucose control\n\n";
  }
  
  if (medicalConditions.includes('hypertension')) {
    response += "### Hypertension Management\n- Target BP <130/80 mmHg per latest guidelines\n- Reduce sodium intake (<2300mg daily)\n- Consider DASH or Mediterranean diet\n- Recent studies show benefits of isometric exercise for BP reduction\n\n";
  }
  
  response += "## Lifestyle Considerations\n";
  switch (activityLevel) {
    case 'very_active':
      response += "Patient maintains a very active lifestyle. Research indicates this level of activity significantly reduces all-cause mortality. Focus on recovery nutrition and injury prevention.\n\n";
      break;
    case 'moderately_active':
      response += "Patient is moderately active. Recent meta-analyses show this activity level provides most health benefits with diminishing returns at higher levels. Encourage consistency.\n\n";
      break;
    case 'sedentary':
      response += "Patient reports a sedentary lifestyle, which multiple studies link to increased cardiovascular risk. Even small increases in daily movement show measurable health benefits.\n\n";
      break;
  }
  
  response += "## Evidence-Based Recommendations\n1. Implement Mediterranean diet pattern (strong evidence for multiple conditions)\n2. Aim for 150-300 minutes weekly of moderate activity\n3. Prioritize sleep quality (7-9 hours)\n4. Consider stress reduction techniques (mindfulness shows promising results)\n\nReferences: JAMA 2023, Lancet 2022, NEJM 2021";
  
  return response;
}