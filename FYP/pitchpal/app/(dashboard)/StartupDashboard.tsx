

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Snackbar } from 'react-native-paper';
import AddStartupForm from './AddStartupForm';
// import UpdateStartupForm from './UpdateStartupForm'; // Import UpdateStartupForm
import { MaterialIcons } from '@expo/vector-icons'; // For the update icon
import API_IP from '../../constants/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define TypeScript interface
interface Startup {
  name: string;
  category: string;
  totalFunding: string;
  fundingRounds: string;
  locationCity: string;
  locationCountry: string;
  foundedDate: string;
  teamSize: string;
  revenue: string;
  stageOfBusiness: string;
  industry: string; // Make sure industry is present in the interface
  minInvestment: string;
  maxInvestment: string;
}

export default function StartupDashboard() {
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isUpdateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null); // Store selected startup for update
  const [startups, setStartups] = useState<Startup[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Fetch startups from API on component mount
  useEffect(() => {
    setIsMounted(true);
    const fetchStartups = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const token = await AsyncStorage.getItem('token');
        if (!userId) {
          Alert.alert('Error', 'User ID not found. Please login again.');
          return;
        }
        if (!token) {
          Alert.alert('Error', 'Authentication token not found. Please login again.');
          return;
        }
        const response = await fetch(`${API_IP}/api/startups`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched startups data:', data);
        if (data && Array.isArray(data.startups)) {
          setStartups(data.startups);
        } else {
          console.warn('API response does not contain startups array:', data);
          setStartups([]);
        }
      } catch (error) {
        console.error('Failed to fetch startups:', error);
        Alert.alert('Error', 'Failed to fetch startups. Please try again later.');
      }
    };
    fetchStartups();
  }, []);

  // Function to add startup to the list
  const addStartup = (startup: Startup) => {
    setStartups((prev) => [...prev, startup]);
    setAddModalVisible(false);
    setSnackbarVisible(true);
    setTimeout(() => setSnackbarVisible(false), 2000);
  };

  // Function to remove a startup
  const removeStartup = (index: number) => {
    Alert.alert(
      'Confirm Removal',
      'Are you sure you want to remove this startup?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          onPress: () => {
            setStartups((prevStartups) => prevStartups.filter((_, idx) => idx !== index));
          },
          style: 'destructive',
        },
      ],
      { cancelable: false }
    );
  };

  // Function to update a startup
  const updateStartup = (updatedStartup: Startup, index: number) => {
    const updatedStartups = startups.map((startup, idx) =>
      idx === index ? updatedStartup : startup
    );
    setStartups(updatedStartups);
    setUpdateModalVisible(false);
    setSnackbarVisible(true);
    setTimeout(() => setSnackbarVisible(false), 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Startup Dashboard</Text>
      <Text style={styles.welcomeText}>
        Welcome to your startup dashboard! Here you can manage your startup profiles and connect with investors.
      </Text>

      <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
        <Text style={styles.buttonText}>Add Startup</Text>
      </TouchableOpacity>

      {startups.length === 0 ? (
        <Text style={styles.emptyState}>No startups added yet. Tap "Add Startup" to get started.</Text>
      ) : (
        <ScrollView style={{ marginTop: 20 }}>
          {startups.map((startup, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>{startup.name}</Text>

              {/* Replace category with industry */}
              <Text style={styles.cardText}>Industry: {startup.industry}</Text>

              <Text style={styles.cardText}>Funding: {startup.totalFunding}</Text>
              <Text style={styles.cardText}>Location: {startup.locationCity}, {startup.locationCountry}</Text>

              {/* Update Button */}
              <TouchableOpacity
                style={styles.updateButton}
                onPress={() => {
                  setSelectedStartup(startup); // Set selected startup for update
                  setUpdateModalVisible(true); // Open the update modal
                }}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Add Startup Form Modal */}
      <AddStartupForm visible={isAddModalVisible} onClose={() => setAddModalVisible(false)} onAddStartup={addStartup} />

      {/* Update Startup Form Modal */}
      {/* {selectedStartup && (
        <UpdateStartupForm
          visible={isUpdateModalVisible}
          onClose={() => setUpdateModalVisible(false)}
          onUpdateStartup={updateStartup}
          onDeleteStartup={removeStartup}  // Pass the delete function to the Update form
          startup={selectedStartup}
          startupIndex={startups.findIndex((s) => s === selectedStartup)} // Pass index of the startup to be updated
        />
      )} */}

      {/* Snackbar for success message */}
      {isMounted && (
        <Snackbar visible={snackbarVisible} duration={2000} onDismiss={() => setSnackbarVisible(false)}>
          Startup updated successfully!
        </Snackbar>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#2A2A2A',
  },
  title: {
    fontSize: 36,
    color: '#FFFFFF',
    marginBottom: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16, // Slightly smaller for a minimal look
    color: '#B2B2B2', // Soft neutral gray
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 28, // A bit more line height for a more spacious feel
    letterSpacing: 0.5, // Add some spacing for readability and elegance
    fontWeight: '300', // Light font weight for a softer appearance
    textTransform: 'none', // Keeping it normal case for a sleek aesthetic
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    marginBottom: 15,
  },
  updateButton: {
    backgroundColor: '#FF9800',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#3A3A3A',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    position: 'relative',
  },
  cardTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 5,
  },
  cardText: {
    color: '#CCCCCC',
    fontSize: 16,
  },
  emptyState: {
    color: '#AAAAAA',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
  },
});
