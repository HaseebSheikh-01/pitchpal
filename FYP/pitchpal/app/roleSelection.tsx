import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Link, router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RoleSelectionScreen() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Function to handle role selection
  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  // Function to handle API call and navigate to the appropriate dashboard
  const handleContinue = async () => {
    if (!selectedRole) return;

    try {
      // Retrieve the token from AsyncStorage (or from Redux/Context if stored there)
      const token = await AsyncStorage.getItem("token");
      console.log("Token from AsyncStorage:", token); // Debugging line
      if (!token) {
        console.log("Token is missing!");
        return;
      }

      // Retrieve userId from AsyncStorage
      const userId = await AsyncStorage.getItem("userId"); // Assuming userId is stored in AsyncStorage
      console.log("User ID from AsyncStorage:", userId); // Debugging line
      if (!userId) {
        console.log("User ID is missing!");
        return;
      }

      // Make the API call to update the user role
      const response = await fetch(`http://localhost:5000/api/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Include the token in the header
        },
        body: JSON.stringify({
          role: selectedRole, // Send the selected role in the body
        }),
      });

      // Parse the response from the server
      const data = await response.json();
      console.log("API Response:", data); // Debugging line

      // Check for errors from the server
      if (!response.ok) {
        console.log("Error:", data.message);
        return;
      }

      // Redirect user based on the selected role
      if (selectedRole === 'startup') {
        router.push('/(dashboard)/StartupDashboard'); // Navigate to Startup Dashboard
      } else if (selectedRole === 'investor') {
        router.push('/(dashboard)/InvestorDashboard'); // Navigate to Investor Dashboard
      }

    } catch (error) {
      console.error("Error updating role:", error); // Log any errors
    }
  };

  return (
    <View style={styles.container}>
      <Link href="/" asChild>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </Link>
      <Text style={styles.title}>Welcome to PitchPal!</Text>
      <Text style={styles.subtitle}>Choose how you want to use the app</Text>
      
      <View style={styles.roleContainer}>
        <TouchableOpacity 
          style={[
            styles.roleButton, 
            selectedRole === 'investor' && styles.selectedRoleButton
          ]}
          onPress={() => handleRoleSelect('investor')}
        >
          <Text style={styles.roleButtonText}>🔵 I'm an Investor</Text>
          <Text style={styles.roleDescription}>Discover and invest in promising startups</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.roleButton, 
            selectedRole === 'startup' && styles.selectedRoleButton
          ]}
          onPress={() => handleRoleSelect('startup')}
        >
          <Text style={styles.roleButtonText}>🟢 I'm a Startup</Text>
          <Text style={styles.roleDescription}>Pitch your startup and attract investors</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.button, !selectedRole && styles.disabledButton]}
        onPress={handleContinue}
        disabled={!selectedRole}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#121212',
    justifyContent: 'space-between'
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 48
  },
  subtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    marginTop: 8,
    marginBottom: 32
  },
  roleContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  roleButton: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E1E1E'
  },
  selectedRoleButton: {
    borderColor: '#4CAF50'
  },
  roleButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8
  },
  roleDescription: {
    color: '#AAAAAA',
    fontSize: 14
  },
  button: {
    height: 56,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32
  },
  disabledButton: {
    opacity: 0.5
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600'
  },
  backButton: {
    position: 'absolute',
    top: 32,
    left: 24,
    padding: 8
  },
  backButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600'
  }
});
