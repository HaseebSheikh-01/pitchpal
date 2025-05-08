import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Linking, SafeAreaView, Modal, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For saving data locally
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook
import API_IP from '../../constants/apiConfig';

// Define types
interface Startup {
  id: string;
  name: string;
  description: string;
  contactLink: string; // Assuming each startup has a contact link
  email?: string; // Add email field
  userId: string; // Add userId field
}

interface UserDetails {
  name: string;
  email: string;
}

interface SavedStartupsProps {
  visible: boolean;
  onClose: () => void;
  onAddStartup: (startup: Startup) => void;
}

// Function to get saved startups from AsyncStorage
const getSavedStartups = async (): Promise<Startup[]> => {
  try {
    const savedStartups = await AsyncStorage.getItem('savedStartups');
    return savedStartups ? JSON.parse(savedStartups) : [];
  } catch (error) {
    console.error('Error getting saved startups:', error);
    return [];
  }
};

// Function to remove a startup from AsyncStorage
const removeStartup = async (startupId: string): Promise<Startup[]> => {
  try {
    const currentStartups = await AsyncStorage.getItem('savedStartups');
    const startups = currentStartups ? JSON.parse(currentStartups) : [];
    const updatedStartups = startups.filter((startup: Startup) => startup.id !== startupId);

    await AsyncStorage.setItem('savedStartups', JSON.stringify(updatedStartups));
    return updatedStartups; // Return updated list after removal
  } catch (error) {
    console.error('Error removing startup:', error);
    return [];
  }
};

export default function SavedStartups() {
  const [savedStartups, setSavedStartups] = useState<Startup[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation(); // Get the navigation object

  // Fetch saved startups when component mounts
  useEffect(() => {
    const fetchSavedStartups = async () => {
      const startups = await getSavedStartups();
      setSavedStartups(startups);
    };

    fetchSavedStartups();
  }, []);

  const handleRemoveStartup = async (startupId: string) => {
    const updatedStartups = await removeStartup(startupId);
    setSavedStartups(updatedStartups); // Update UI after removal
    Alert.alert('Removed', 'Startup has been removed from your saved list!');
  };

  const handleContact = async (startup: Startup) => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      // Get investor details
      const investorId = await AsyncStorage.getItem('userId');
      console.log('Investor ID:', investorId);
      
      if (!investorId) {
        Alert.alert('Error', 'Investor ID not found');
        return;
      }

      // Fetch investor details
      console.log('Fetching investor details...');
      const investorResponse = await fetch(`${API_IP}/api/investors/${investorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!investorResponse.ok) {
        console.error('Investor fetch failed:', await investorResponse.text());
        throw new Error('Failed to fetch investor details');
      }

      const investorData = await investorResponse.json();
      console.log('Investor data:', investorData);
      
      // FIX: Extract correct fields from investorData
      const investorDetails: UserDetails = {
        name: investorData.investor.full_name,
        email: investorData.investor.email,
      };

      // Fetch startup user details
      console.log('Fetching startup user details...');
      console.log('Startup user ID:', startup.userId);
      
      const startupUserResponse = await fetch(`${API_IP}/api/users/${startup.userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!startupUserResponse.ok) {
        console.error('Startup user fetch failed:', await startupUserResponse.text());
        throw new Error('Failed to fetch startup user details');
      }

      const startupUserData = await startupUserResponse.json();
      console.log('Startup user data:', startupUserData);
      
      // FIX: Extract correct fields from startupUserData
      const startupUserDetails: UserDetails = {
        name: startupUserData.user.name,
        email: startupUserData.user.email,
      };

      // Prepare contact email request with the correct format
      const contactPayload = {
        investorName: investorDetails.name,
        investorEmail: investorDetails.email,
        startupName: startupUserDetails.name,
        startupEmail: startupUserDetails.email,
      };
      
      console.log('Sending contact email with payload:', contactPayload);

      // Send contact email
      const contactResponse = await fetch(`${API_IP}/api/mail/contact-startup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(contactPayload),
      });

      const responseText = await contactResponse.text();
      console.log('Contact API response:', responseText);

      if (contactResponse.ok) {
        setSelectedStartup(startup);
        setShowSuccessModal(true);
      } else {
        let errorMessage = 'Failed to send contact email. Please try again.';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('Error in contact process:', error);
      Alert.alert('Error', 'Failed to process contact request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Startup }) => (
    <View style={styles.startupCard}>
      <View style={styles.startupInfo}>
        <Text style={styles.startupName}>{item.name}</Text>
        <Text style={styles.startupDescription}>{item.description}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.contactButton, isLoading && styles.disabledButton]}
          onPress={() => handleContact(item)}
          disabled={isLoading}
        >
          <View style={styles.buttonContent}>
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.contactButtonText}>Contact</Text>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveStartup(item.id)}
          disabled={isLoading}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.removeButtonText}>Remove</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Saved Startups</Text>
      </View>

      {savedStartups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.noStartupsText}>No saved startups found</Text>
        </View>
      ) : (
        <FlatList
          data={savedStartups}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Success!</Text>
            <Text style={styles.modalText}>
              Contact email has been sent to {selectedStartup?.name}
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  startupCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    marginHorizontal: 20,
  },
  startupInfo: {
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  removeButton: {
    backgroundColor: '#FF4D4D',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  backButton: {
    position: 'absolute', // Position it at the top-left
    top: 40, // Increased to avoid notch area, especially on devices like iPhone 16 Pro Max
    left: 20,
    padding: 10,
    backgroundColor: '#444444',
    borderRadius: 50, // Make it round for a clean look
    alignItems: 'center',
    justifyContent: 'center',
    width: 40, // Small size
    height: 40, // Small size
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 18, // Size of the arrow
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 100, // Add top margin for better spacing on larger screens and to avoid overlap
    marginBottom: 20,
    marginLeft: 20, // Added left margin for alignment
  },
  noStartupsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 20,
    textAlign: 'center',
    flex: 1, // Take up remaining space
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  startupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  startupDescription: {
    fontSize: 14,
    color: '#AAAAAA',
    marginTop: 5,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
