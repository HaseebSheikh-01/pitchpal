import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Snackbar } from 'react-native-paper';
import AddStartupForm from './AddStartupForm';
import EditStartupForm from './EditStartupForm'; // Import the EditStartupForm
import { MaterialIcons } from '@expo/vector-icons'; // For the update icon
import API_IP from '../../constants/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router'; // Import router

interface Startup {
  id: string;
  name: string;
  funding_total_usd: number;
  funding_rounds: number;
  continent: string;
  country: string;
  stage_of_business: string;
  industry: string;
  team_size: number;
  revenue_usd: number;
  consumer_base: number;
  image: string | null;
}

interface AddStartupData {
  name: string;
  funding_total_usd: number;
  funding_rounds: number;
  continent: string;
  country: string;
  stage_of_business: string;
  industry: string;
  team_size: number;
  revenue_usd: number;
  consumer_base: number;
  image: string | null;
}

const StartupDashboard: React.FC = () => {
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isUpdateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null); // Store selected startup for update
  const [startups, setStartups] = useState<Startup[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter(); // Router instance for navigation

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
        const normalizedStartups = data.startups.map((startup: any) => ({
          ...startup,
          funding_total_usd: Number(startup.funding_total_usd) || 0,
          funding_rounds: Number(startup.funding_rounds) || 0,
          team_size: Number(startup.team_size) || 0,
          revenue_usd: Number(startup.revenue_usd) || 0,
          consumer_base: Number(startup.consumer_base) || 0,
        }));
        setStartups(normalizedStartups);
      } else {
        console.warn('API response does not contain startups array:', data);
        setStartups([]);
      }
    } catch (error) {
      console.error('Failed to fetch startups:', error);
      Alert.alert('Error', 'Failed to fetch startups. Please try again later.');
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchStartups();
  }, []);

  const addStartup = async (startupData: AddStartupData) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please login again.');
        return;
      }
      const response = await fetch(`${API_IP}/api/startups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(startupData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchStartups(); // Refresh the startups list after adding
      setAddModalVisible(false);
      setSnackbarVisible(true);
      setTimeout(() => setSnackbarVisible(false), 2000);
    } catch (error) {
      console.error('Failed to add startup:', error);
      Alert.alert('Error', 'Failed to add startup. Please try again later.');
    }
  };

  const updateStartup = async (updatedStartup: Startup) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please login again.');
        return;
      }
      const response = await fetch(`${API_IP}/api/startups/${updatedStartup.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedStartup),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchStartups(); // Refresh the startups list after updating
      setUpdateModalVisible(false);
      setSnackbarVisible(true);
      setTimeout(() => setSnackbarVisible(false), 2000);
    } catch (error) {
      console.error('Failed to update startup:', error);
      Alert.alert('Error', 'Failed to update startup. Please try again later.');
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('Logged Out', 'You have successfully logged out.');
      router.push('/login'); 
    } catch (error) {
      console.error("Error logging out", error);
    }
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
              <Text style={styles.cardText}>Industry: {startup.industry}</Text>
              <Text style={styles.cardText}>Funding: ${Number(startup.funding_total_usd || 0).toLocaleString()}</Text>
              <Text style={styles.cardText}>Location: {startup.continent}, {startup.country}</Text>

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
      <AddStartupForm 
        visible={isAddModalVisible} 
        onClose={() => setAddModalVisible(false)} 
        onAddStartup={addStartup} 
      />

      {/* Update Startup Form Modal */}
      {selectedStartup && (
        <EditStartupForm
          visible={isUpdateModalVisible}
          onClose={() => setUpdateModalVisible(false)}
          startup={selectedStartup}
        />
      )}

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialIcons name="logout" size={20} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      {/* Snackbar for success message */}
      {isMounted && (
        <Snackbar visible={snackbarVisible} duration={2000} onDismiss={() => setSnackbarVisible(false)}>
          Startup updated successfully!
        </Snackbar>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#2A2A2A',
    marginTop: 30,
  },
  title: {
    fontSize: 36,
    color: '#FFFFFF',
    marginBottom: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#B2B2B2',
    marginBottom: 30,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  updateButton: {
    backgroundColor: '#FF9800',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#3A3A3A',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
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
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#E91E63',
    paddingVertical: 15,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default StartupDashboard;
