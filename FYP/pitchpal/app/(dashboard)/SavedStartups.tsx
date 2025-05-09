import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For saving data locally

// Function to get saved startups from AsyncStorage
const getSavedStartups = async () => {
  try {
    const savedStartups = await AsyncStorage.getItem('savedStartups');
    return savedStartups ? JSON.parse(savedStartups) : [];
  } catch (error) {
    console.error('Error getting saved startups:', error);
    return [];
  }
};

// Function to remove a startup from AsyncStorage
const removeStartup = async (startupId) => {
  try {
    const currentStartups = await AsyncStorage.getItem('savedStartups');
    const startups = currentStartups ? JSON.parse(currentStartups) : [];
    const updatedStartups = startups.filter((startup) => startup.id !== startupId);

    await AsyncStorage.setItem('savedStartups', JSON.stringify(updatedStartups));
    return updatedStartups; // Return updated list after removal
  } catch (error) {
    console.error('Error removing startup:', error);
    return [];
  }
};

export default function SavedStartups() {
  const [savedStartups, setSavedStartups] = useState<{ id: string, name: string, description: string }[]>([]);

  // Fetch saved startups when component mounts
  useEffect(() => {
    const fetchSavedStartups = async () => {
      const startups = await getSavedStartups();
      setSavedStartups(startups);
    };

    fetchSavedStartups();
  }, []);

  const handleRemoveStartup = async (startupId) => {
    const updatedStartups = await removeStartup(startupId);
    setSavedStartups(updatedStartups); // Update UI after removal
    Alert.alert('Removed', 'Startup has been removed from your saved list!');
  };

  const renderItem = ({ item }: { item: { id: string; name: string; description: string } }) => (
    <View style={styles.startupCard}>
      <Text style={styles.startupName}>{item.name}</Text>
      <Text style={styles.startupDescription}>{item.description}</Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveStartup(item.id)}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  noStartupsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 20,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  startupCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 15,
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
