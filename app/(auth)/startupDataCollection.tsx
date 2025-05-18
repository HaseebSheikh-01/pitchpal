import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Link } from "expo-router";

// Color palette constants
const COLORS = {
  primary: '#4361EE',    // Vibrant blue
  secondary: '#3A0CA3',  // Deep purple
  background: '#121212', // Dark background
  surface: '#1E1E1E',    // Card/surface color
  text: '#FFFFFF',       // White text
  accent: '#4CC9F0',     // Light blue accent
  error: '#F72585',      // Pink error
  success: '#4AD66D',    // Green success
  placeholder: '#666666' // Placeholder text
};

import { useState } from 'react';
import { useRouter } from 'expo-router';

export default function StartupDataCollection() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    industry: '',
    companySize: '',
    fundingStage: '',
    fundingAmount: '',
    website: '',
    description: ''
  });

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.name || !formData.location || !formData.industry || 
        !formData.companySize || !formData.fundingStage || !formData.description) {
      alert('Please fill all required fields');
      return;
    }

    // Form is valid - handle submission here
    alert('Form submitted successfully!');
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Startup Information</Text>
        <Link href="/roleSelection" asChild>
          <Text style={styles.backLink}>← Back</Text>
        </Link>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Startup Name*</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your startup name"
            placeholderTextColor={COLORS.placeholder}
            value={formData.name}
            onChangeText={(text) => handleChange('name', text)}
          />

          <Text style={styles.label}>Location*</Text>
          <TextInput
            style={styles.input}
            placeholder="City, Country"
            placeholderTextColor={COLORS.placeholder}
            value={formData.location}
            onChangeText={(text) => handleChange('location', text)}
          />

          <Text style={styles.label}>Industry*</Text>
          <TextInput
            style={styles.input}
            placeholder="What industry are you in?"
            placeholderTextColor={COLORS.placeholder}
            value={formData.industry}
            onChangeText={(text) => handleChange('industry', text)}
          />

          <Text style={styles.label}>Company Size*</Text>
          <TextInput
            style={styles.input}
            placeholder="Number of employees"
            placeholderTextColor={COLORS.placeholder}
            keyboardType="numeric"
            value={formData.companySize}
            onChangeText={(text) => handleChange('companySize', text)}
          />

          <Text style={styles.label}>Funding Stage*</Text>
          <TextInput
            style={styles.input}
            placeholder="Pre-seed, Seed, Series A, etc."
            placeholderTextColor={COLORS.placeholder}
            value={formData.fundingStage}
            onChangeText={(text) => handleChange('fundingStage', text)}
          />

          <Text style={styles.label}>Funding Amount (USD)</Text>
          <TextInput
            style={styles.input}
            placeholder="Amount raised or seeking"
            placeholderTextColor={COLORS.placeholder}
            keyboardType="numeric"
            value={formData.fundingAmount}
            onChangeText={(text) => handleChange('fundingAmount', text)}
          />

          <Text style={styles.label}>Website</Text>
          <TextInput
            style={styles.input}
            placeholder="https://yourstartup.com"
            placeholderTextColor={COLORS.placeholder}
            keyboardType="url"
            value={formData.website}
            onChangeText={(text) => handleChange('website', text)}
          />

          <Text style={styles.label}>Brief Description*</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Describe your startup (max 200 chars)"
            placeholderTextColor={COLORS.placeholder}
            multiline
            maxLength={200}
            value={formData.description}
            onChangeText={(text) => handleChange('description', text)}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.requiredText}>* Required fields</Text>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit Application</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scrollContainer: {
    padding: 24,
    paddingBottom: 120
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 48
  },
  backLink: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16
  },
  formContainer: {
    marginTop: 32
  },
  label: {
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 8,
    marginTop: 16
  },
  input: {
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.surface
  },
  inputFocused: {
    borderColor: COLORS.primary
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top'
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.surface
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600'
  },
  requiredText: {
    color: COLORS.placeholder,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8
  }
});
