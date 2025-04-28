import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, TouchableOpacity } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:5000/api/investors';

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Energy',
  'Retail',
  'Manufacturing',
  'Real Estate',
  'AI & Machine Learning',
  'E-commerce',
  'Blockchain',
  'Biotech'
];

const areas = [
  'North America',
  'Europe',
  'Asia',
  'South America',
  'Africa',
  'Australia',
];

const startupTypes = [
  'Seed',
  'Early Stage',
  'Growth Stage',
  'Late Stage',
];

function MultiSelectDropdown({
  label,
  options,
  selectedOptions,
  setSelectedOptions,
}: {
  label: string;
  options: string[];
  selectedOptions: string[];
  setSelectedOptions: (selected: string[]) => void;
}) {
  const toggleOption = (option: string) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((item) => item !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  return (
    <View style={styles.multiSelectContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              selectedOptions.includes(option) && styles.optionButtonSelected,
            ]}
            onPress={() => toggleOption(option)}
          >
            <Text
              style={[
                styles.optionText,
                selectedOptions.includes(option) && styles.optionTextSelected,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function ProfileSetting() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [position, setPosition] = useState<string>("");
  const [minInvestment, setMinInvestment] = useState<string>("1000");
  const [maxInvestment, setMaxInvestment] = useState<string>("1000000");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedStartupTypes, setSelectedStartupTypes] = useState<string[]>([]);

  const handleSubmit = async () => {
    const minVal = parseInt(minInvestment, 10);
    const maxVal = parseInt(maxInvestment, 10);

    // Form validation
    if (minVal >= maxVal) {
      Alert.alert("Error", "Minimum investment must be less than maximum investment.");
      return;
    }

    if (!name || !email || !company || !position) {
      Alert.alert("Error", "Please fill all the fields.");
      return;
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    const profileData = {
      full_name: name,
      email: email,
      company,
      position,
      funding_min: minVal,
      funding_max: maxVal,
      industry: selectedIndustries,
      area: selectedAreas,
      type_of_startup: selectedStartupTypes,
    };

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error("Profile submission failed");
      }

      const data = await response.json();
      Alert.alert("Profile Submitted", data.message || "Your profile has been successfully submitted.");
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message || "There was an error submitting your profile.");
      } else {
        Alert.alert("Error", "An unexpected error occurred.");
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profile Settings</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your full name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Company</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your company"
        value={company}
        onChangeText={setCompany}
      />

      <Text style={styles.label}>Position</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your position"
        value={position}
        onChangeText={setPosition}
      />

      <Text style={styles.label}>Investment Range</Text>
      <View style={styles.rangeInputContainer}>
        <Text style={styles.label}>Min:</Text>
        <TextInput
          style={styles.rangeInput}
          placeholder="Min Investment"
          keyboardType="numeric"
          value={minInvestment}
          onChangeText={setMinInvestment}
        />
        <Text style={styles.label}>Max:</Text>
        <TextInput
          style={styles.rangeInput}
          placeholder="Max Investment"
          keyboardType="numeric"
          value={maxInvestment}
          onChangeText={setMaxInvestment}
        />
      </View>

      <MultiSelectDropdown
        label="Industry"
        options={industries}
        selectedOptions={selectedIndustries}
        setSelectedOptions={setSelectedIndustries}
      />

      <MultiSelectDropdown
        label="Area"
        options={areas}
        selectedOptions={selectedAreas}
        setSelectedOptions={setSelectedAreas}
      />

      <MultiSelectDropdown
        label="Type of Startup"
        options={startupTypes}
        selectedOptions={selectedStartupTypes}
        setSelectedOptions={setSelectedStartupTypes}
      />

      <Button title="Save Profile" onPress={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#121212",
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
  },
  label: {
    color: "#AAAAAA",
    marginBottom: 5,
    marginTop: 15,
  },
  input: {
    backgroundColor: "#1E1E1E",
    color: "#FFFFFF",
    padding: 10,
    borderRadius: 8,
  },
  rangeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  rangeInput: {
    backgroundColor: "#1E1E1E",
    color: "#FFFFFF",
    padding: 10,
    borderRadius: 8,
    width: "40%",
  },
  multiSelectContainer: {
    marginTop: 15,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  optionButton: {
    backgroundColor: "#1E1E1E",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  optionButtonSelected: {
    backgroundColor: "#1E90FF",
  },
  optionText: {
    color: "#FFFFFF",
  },
  optionTextSelected: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
