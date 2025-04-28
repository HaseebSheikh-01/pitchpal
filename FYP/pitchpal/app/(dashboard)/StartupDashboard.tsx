import { View, Text, TouchableOpacity } from "react-native";
import { Snackbar } from "react-native-paper";
import React, { useState } from 'react';
import AddStartupForm from './AddStartupForm';

// Define a TypeScript interface for the startup
interface Startup {
  name: string;
  category: string;
  totalFunding: string;
  fundingRounds: string;
  locationCity: string;
  locationCountry: string;
  foundedDate: string;
  firstFundingDate?: string;
  lastFundingDate?: string;
  teamSize: string;
  revenue: string;
  stageOfBusiness: string;
  industry: string;
  minInvestment: string;
  maxInvestment: string;
}

export default function StartupDashboard() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [startups, setStartups] = useState<Startup[]>([]); // State to hold the list of startups
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const addStartup = (startup: Startup) => {
    // Use functional state update to avoid issues with stale closures
    setStartups((prevStartups) => [...prevStartups, startup]);
    setModalVisible(false); // Close the form modal after adding
    setSnackbarVisible(true); // Show success message
    setTimeout(() => setSnackbarVisible(false), 2000); // Hide after 2 seconds
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Startup Dashboard</Text>
      <Text style={styles.welcomeText}>Welcome, Startup! Here you can manage your profile and connect with investors.</Text>

      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>Add Startup</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => {/* Handle update startup logic */}}
      >
        <Text style={styles.buttonText}>Update Startup</Text>
      </TouchableOpacity>

      {/* Add Startup Form Modal */}
      <AddStartupForm visible={isModalVisible} onClose={() => setModalVisible(false)} onAddStartup={addStartup} />

      {/* Snackbar for success message */}
      <Snackbar
        visible={snackbarVisible}
        duration={2000}
        onDismiss={() => setSnackbarVisible(false)}
      >
        Startup added successfully!
      </Snackbar>
    </View>
  );
}

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 36, // H1 style
    color: '#FFFFFF',
    marginBottom: 20,
    fontWeight: 'bold', // Bold text
  },
  welcomeText: {
    fontSize: 20,
    color: '#1DB954', // Vibrant green color
    marginBottom: 40, // Increased spacing
    fontWeight: 'normal', // Unbolded text
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12, // Adjusted the borderRadius as per your original request
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 5,
    marginBottom: 10, // Spacing between buttons
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold', // Ensured proper fontWeight (string value)
  },
});
