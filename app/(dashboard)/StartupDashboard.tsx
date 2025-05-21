import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Snackbar } from 'react-native-paper';
import AddStartupForm from './AddStartupForm';
import EditStartupForm from './EditStartupForm'; // Import the EditStartupForm
import { MaterialIcons } from '@expo/vector-icons'; // For the update icon
import API_IP from '../../constants/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router'; // Import router
import ToDoList from './ToDoList';
import ProgressTracker from './ProgressTracker';
import StartupAnalytics from './StartupAnalytics';

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
  const [currentPage, setCurrentPage] = useState('home');

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
      console.log('Fetched startups data (after update):', data);
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
      // Instantly update the local state for immediate UI feedback
      setStartups(prevStartups => prevStartups.map(s => s.id === updatedStartup.id ? { ...s, ...updatedStartup } : s));
      setUpdateModalVisible(false);
      setSnackbarVisible(true);
      setTimeout(() => setSnackbarVisible(false), 2000);
      // Optionally, fetch from backend to ensure data is in sync
      fetchStartups();
    } catch (error) {
      console.error('Failed to update startup:', error);
      Alert.alert('Error', 'Failed to update startup. Please try again later.');
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userId');
      Alert.alert('Logged Out', 'You have successfully logged out.');
      router.push('/login'); 
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  const renderContent = () => {
    if (currentPage === 'home') {
      return (
        <>
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
                      setSelectedStartup(startup);
                      setUpdateModalVisible(true);
                    }}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </>
      );
    } else if (currentPage === 'todo') {
      return <ToDoList />;
    } else if (currentPage === 'progress') {
      return <ProgressTracker />;
    } else if (currentPage === 'analytics') {
      return <StartupAnalytics />;
    } else {
      return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderContent()}

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
          onUpdate={updateStartup}
        />
      )}

      {/* Logout Button - Only visible on home page */}
      {currentPage === 'home' && (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={18} color="#FF4444" style={{ marginRight: 6 }} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.navItem, currentPage === 'home' && styles.activeNavItem]} 
          onPress={() => setCurrentPage('home')}
        >
          <MaterialIcons name="home" size={24} color={currentPage === 'home' ? '#4CAF50' : '#FFFFFF'} />
          <Text style={[styles.navText, currentPage === 'home' && styles.activeNavText]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navItem, currentPage === 'todo' && styles.activeNavItem]} 
          onPress={() => setCurrentPage('todo')}
        >
          <MaterialIcons name="list" size={24} color={currentPage === 'todo' ? '#4CAF50' : '#FFFFFF'} />
          <Text style={[styles.navText, currentPage === 'todo' && styles.activeNavText]}>To-Do</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navItem, currentPage === 'progress' && styles.activeNavItem]} 
          onPress={() => setCurrentPage('progress')}
        >
          <MaterialIcons name="trending-up" size={24} color={currentPage === 'progress' ? '#4CAF50' : '#FFFFFF'} />
          <Text style={[styles.navText, currentPage === 'progress' && styles.activeNavText]}>Progress</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navItem, currentPage === 'analytics' && styles.activeNavItem]} 
          onPress={() => setCurrentPage('analytics')}
        >
          <MaterialIcons name="analytics" size={24} color={currentPage === 'analytics' ? '#4CAF50' : '#FFFFFF'} />
          <Text style={[styles.navText, currentPage === 'analytics' && styles.activeNavText]}>Analytics</Text>
        </TouchableOpacity>
      </View>

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
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#3A3A3A',
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#4A4A4A',
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeNavItem: {
    backgroundColor: '#2A2A2A',
  },
  navText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
  },
  activeNavText: {
    color: '#4CAF50',
  },
  logoutButton: {
    position: 'absolute',
    bottom: 110,
    right: 20,
    flexDirection: "row",
    backgroundColor: "transparent",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: '#FF4444',
    width: 'auto',
    marginRight: 20,
    marginBottom: 10,
  },
  logoutButtonText: {
    color: "#FF4444",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default StartupDashboard;