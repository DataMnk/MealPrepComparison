import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Dimensions, 
  Platform,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, RefreshCw } from 'lucide-react-native';

import ResponseCard from '@/components/ResponseCard';
import Button from '@/components/Button';
import { usePatientStore } from '@/store/patientStore';
import colors from '@/constants/colors';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function ResultsScreen() {
  const router = useRouter();
  const { comparisonResult, resetPatientInfo } = usePatientStore();
  
  const handleNewComparison = () => {
    resetPatientInfo();
    router.replace('/');
  };
  
  if (!comparisonResult) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Comparison Results</Text>
          <Text style={styles.emptySubtitle}>
            Complete the patient form to see AI response comparisons
          </Text>
          <Button
            title="Go to Patient Form"
            onPress={() => router.replace('/')}
            icon={<ArrowLeft size={20} color="#fff" />}
          />
        </View>
      </SafeAreaView>
    );
  }
  
  const { patientInfo, chatGptResponse, perplexityResponse } = comparisonResult;
  
  // Format patient info for display
  const formatPatientInfo = () => {
    const info = [];
    
    info.push(`${patientInfo.age} years old, ${patientInfo.gender}`);
    
    if (patientInfo.height && patientInfo.weight) {
      info.push(`Height: ${patientInfo.height} cm, Weight: ${patientInfo.weight} kg`);
    }
    
    if (patientInfo.bmi) {
      info.push(`BMI: ${patientInfo.bmi.toFixed(1)}`);
    }
    
    const conditions = patientInfo.medicalConditions.includes('none') 
      ? ['No chronic conditions'] 
      : patientInfo.medicalConditions;
      
    info.push(`Conditions: ${conditions.join(', ')}`);
    
    const activityMap: Record<string, string> = {
      very_active: 'Very Active',
      moderately_active: 'Moderately Active',
      sedentary: 'Sedentary'
    };
    
    info.push(`Activity: ${activityMap[patientInfo.activityLevel]}`);
    
    return info;
  };
  
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>AI Response Comparison</Text>
            <Text style={styles.subtitle}>
              Compare responses from different AI models
            </Text>
          </View>
          
          {/* Patient Summary */}
          <View style={styles.patientSummary}>
            <Text style={styles.patientSummaryTitle}>Patient Summary</Text>
            {formatPatientInfo().map((info, index) => (
              <Text key={index} style={styles.patientSummaryText}>{info}</Text>
            ))}
          </View>
          
          {/* Responses */}
          <View style={[
            styles.responsesContainer,
            isTablet && Platform.OS !== 'web' ? styles.responsesRow : styles.responsesColumn
          ]}>
            <View style={[
              styles.responseWrapper,
              isTablet && Platform.OS !== 'web' ? styles.responseHalf : styles.responseFull
            ]}>
              <ResponseCard
                title="ChatGPT Response"
                content={chatGptResponse}
                source="chatgpt"
              />
            </View>
            
            <View style={[
              styles.responseWrapper,
              isTablet && Platform.OS !== 'web' ? styles.responseHalf : styles.responseFull
            ]}>
              <ResponseCard
                title="Perplexity Response"
                content={perplexityResponse}
                source="perplexity"
              />
            </View>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title="New Comparison"
              onPress={handleNewComparison}
              variant="outline"
              fullWidth
              icon={<RefreshCw size={20} color={colors.primary} />}
            />
          </View>
        </ScrollView>
      </View>
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
  patientSummary: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  patientSummaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  patientSummaryText: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 8,
  },
  responsesContainer: {
    marginBottom: 24,
  },
  responsesRow: {
    flexDirection: 'row',
    marginHorizontal: -8,
  },
  responsesColumn: {
    flexDirection: 'column',
  },
  responseWrapper: {
    marginBottom: 16,
    height: 400,
  },
  responseHalf: {
    flex: 1,
    paddingHorizontal: 8,
  },
  responseFull: {
    width: '100%',
  },
  buttonContainer: {
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 24,
    textAlign: 'center',
  },
});