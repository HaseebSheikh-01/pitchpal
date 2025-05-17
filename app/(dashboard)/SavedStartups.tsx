import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Linking, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For saving data locally
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook

// Define types
interface Startup {
  id: string;
  name: string;
  description: string;
  contactLink: string; // Assuming each startup has a contact link
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

  const handleContact = (contactLink: string) => {
    // Example: open the contact link in the browser or initiate an email
    Linking.openURL(contactLink).catch(err => {
      console.error('Failed to open contact link', err);
      Alert.alert('Error', 'Unable to open contact link');
    });
  };

  const renderItem = ({ item }: { item: Startup }) => (
    <View style={styles.startupCard}>
      <Text style={styles.startupName}>{item.name}</Text>
      <Text style={styles.startupDescription}>{item.description}</Text>

      {/* Contact Button */}
      <TouchableOpacity
        style={styles.contactButton}
        onPress={() => handleContact(item.contactLink)}
      >
        <Text style={styles.contactButtonText}>Contact</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveStartup(item.id)}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>←</Text> {/* Using a simple arrow for a clean UI */}
      </TouchableOpacity>

      <Text style={styles.title}>Saved Startups</Text>
      {savedStartups.length === 0 ? (
        <Text style={styles.noStartupsText}>No saved startups found</Text>
      ) : (
        <FlatList
          data={savedStartups}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 20,
    paddingTop: 50, // Increased padding to avoid overlap with notch
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
  startupCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20, // Increased padding for better alignment and separation
    marginBottom: 15,
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
  contactButton: {
    marginTop: 10,
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  removeButton: {
    marginTop: 10,
    backgroundColor: '#FF4D4D',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
