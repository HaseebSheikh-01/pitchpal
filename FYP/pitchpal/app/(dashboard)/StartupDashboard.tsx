import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Snackbar } from 'react-native-paper';
import AddStartupForm from './AddStartupForm';

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
  industry: string;
  minInvestment: string;
  maxInvestment: string;
}

export default function StartupDashboard() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const addStartup = (startup: Startup) => {
    setStartups((prev) => [...prev, startup]);
    setModalVisible(false);
    setSnackbarVisible(true);
    setTimeout(() => setSnackbarVisible(false), 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Startup Dashboard</Text>
      <Text style={styles.welcomeText}>
        Welcome to your startup dashboard! Here you can manage your startup profiles and connect with investors.
      </Text>

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Add Startup</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.updateButton} onPress={() => {}}>
        <Text style={styles.buttonText}>Update Startup</Text>
      </TouchableOpacity>

      {startups.length === 0 ? (
        <Text style={styles.emptyState}>No startups added yet. Tap "Add Startup" to get started.</Text>
      ) : (
        <ScrollView style={{ marginTop: 20 }}>
          {startups.map((startup, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>{startup.name}</Text>
              <Text style={styles.cardText}>Category: {startup.category}</Text>
              <Text style={styles.cardText}>Funding: {startup.totalFunding}</Text>
              <Text style={styles.cardText}>Location: {startup.locationCity}, {startup.locationCountry}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      <AddStartupForm visible={isModalVisible} onClose={() => setModalVisible(false)} onAddStartup={addStartup} />

      <Snackbar visible={snackbarVisible} duration={2000} onDismiss={() => setSnackbarVisible(false)}>
        Startup added successfully!
      </Snackbar>
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
    fontSize: 18,
    color: '#1DB954',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: 0.3,
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
  icon: {
    marginRight: 10,
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
});
