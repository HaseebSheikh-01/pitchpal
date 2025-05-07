import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_IP from '../../constants/apiConfig';
import { useRouter } from 'expo-router';

const API_URL = `${API_IP}/api/investors`;

const industries = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Energy', 'Retail', 'Manufacturing', 'Real Estate', 'AI & Machine Learning', 'E-commerce', 'Blockchain', 'Biotech'
] as const;

const areas = [
  'North America', 'Europe', 'Asia', 'South America', 'Africa', 'Australia'
] as const;

const startupTypes = [
  'Seed', 'Early Stage', 'Growth Stage', 'Late Stage'
] as const;

type Industry = typeof industries[number];
type Area = typeof areas[number];
type StartupType = typeof startupTypes[number];

interface MultiSelectDropdownProps {
  label: string;
  options: readonly string[];
  selectedOptions: string[];
  setSelectedOptions: React.Dispatch<React.SetStateAction<string[]>>;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

function MultiSelectDropdown({
  label,
  options,
  selectedOptions,
  setSelectedOptions,
}: MultiSelectDropdownProps) {
  const toggleOption = (option: string) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((item: string) => item !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  return (
    <View style={styles.multiSelectContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option: string) => (
          <TouchableOpacity
            key={option}
            style={[styles.optionButton, selectedOptions.includes(option) && styles.optionButtonSelected]}
            onPress={() => toggleOption(option)}
          >
            <Text style={[styles.optionText, selectedOptions.includes(option) && styles.optionTextSelected]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function ProfileSetting() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [minInvestment, setMinInvestment] = useState("1000");
  const [maxInvestment, setMaxInvestment] = useState("1000000");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedStartupTypes, setSelectedStartupTypes] = useState<string[]>([]);

  const router = useRouter();

  useEffect(() => {
    const fetchInvestorData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        const token = await AsyncStorage.getItem("token");

        if (userId && token) {
          const response = await fetch(`${API_URL}/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch investor data: ${response.statusText}`);
          }

          const data = await response.json();
          const investor = data.investor;

          setName(investor.full_name);
          setEmail(investor.email);
          setCompany(investor.company);
          setPosition(investor.position);
          setMinInvestment(investor.funding_min.toString());
          setMaxInvestment(investor.funding_max.toString());
          setSelectedIndustries(
            investor.industry
              ? investor.industry.split(",").map((i: string) => i.trim()).filter((i: string) => i.length > 0)
              : []
          );
          setSelectedAreas(
            investor.area
              ? investor.area.split(",").map((i: string) => i.trim()).filter((i: string) => i.length > 0)
              : []
          );
          setSelectedStartupTypes(
            investor.type_of_startup
              ? investor.type_of_startup.split(",").map((i: string) => i.trim()).filter((i: string) => i.length > 0)
              : []
          );
        } else {
          console.log("User ID or Token is missing");
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error fetching investor data:", error.message);
          Alert.alert("Error", `Failed to fetch investor data: ${error.message}`);
        } else {
          console.error("Unexpected error:", error);
          Alert.alert("Error", "An unexpected error occurred.");
        }
      }
    };

    fetchInvestorData();
  }, []);

  const handleSubmit = async () => {
    const minVal = parseInt(minInvestment, 10);
    const maxVal = parseInt(maxInvestment, 10);

    if (minVal >= maxVal) {
      Alert.alert("Error", "Minimum investment must be less than maximum investment.");
      return;
    }

    if (!name || !email || !company || !position) {
      Alert.alert("Error", "Please fill all the fields.");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    // Join into a string with commas (no spaces)
    const profileData = {
      full_name: name,
      email: email,
      company,
      position,
      funding_min: minVal,
      funding_max: maxVal,
      industry: selectedIndustries.join(","),
      area: selectedAreas.join(","),
      type_of_startup: selectedStartupTypes.join(","),
    };

    console.log("Profile Data to Send:", profileData);

    try {
      const userId = await AsyncStorage.getItem('userId');
      console.log("Updating profile for userId:", userId);
      const token = await AsyncStorage.getItem('token');

      const response = await fetch(`${API_IP}/api/investors/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Profile update failed with status:", response.status, "and message:", errorText);
        throw new Error("Profile submission failed");
      }

      const data = await response.json();
      console.log("Profile updated successfully:", data);
      Alert.alert("Success", data.message || "Your profile has been successfully updated.");

      await AsyncStorage.setItem('profileData', JSON.stringify(profileData));

      // Navigate to InvestorDashboard after successful profile update
      router.push('/(dashboard)/InvestorDashboard');
    } catch (error) {
      console.log("Profile update error:", error);
      if (error instanceof Error) {
        Alert.alert("Error", error.message || "There was an error submitting your profile.");
      } else {
        Alert.alert("Error", "An unexpected error occurred.");
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/InvestorDashboard')}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

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

      <Button title="Update Profile" onPress={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#121212",
    flexGrow: 1,
    paddingTop: 80,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
    backgroundColor: '#1E90FF',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 40,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.08,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: 'center',
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
    width: "100%",
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
    width: "45%",
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