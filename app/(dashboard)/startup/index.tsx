import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Tabs } from 'expo-router';
import { COLORS } from '@/constants/theme';

export default function StartupDashboard() {
  return (
    <View style={styles.container}>
      <Tabs.Screen options={{ title: 'Startup Dashboard' }} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Startup Dashboard</Text>
        
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity style={styles.tabActive}>
            <Text style={styles.tabTextActive}>🧾 Basic Info</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>📋 List Startup</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>📊 Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>📬 Investor Interest</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>🛡️ Privacy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>📈 Analytics</Text>
          </TouchableOpacity>
        </View>

        {/* Basic Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧾 Basic Info Management</Text>
          <View style={styles.card}>
            <Text style={styles.cardText}>Startup Name: Tech Innovators</Text>
            <Text style={styles.cardText}>Tagline: Disrupting fintech with AI</Text>
            <Text style={styles.cardText}>Industry: FinTech</Text>
            <Text style={styles.cardText}>Stage: MVP</Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Edit Basic Info</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* List Startup Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 List Startup</Text>
          <View style={styles.card}>
            <Text style={styles.cardText}>Funding Ask: $500,000</Text>
            <Text style={styles.cardText}>Equity Offered: 10%</Text>
            <Text style={styles.cardText}>Use of Funds: Product Development</Text>
            <Text style={styles.cardText}>Traction: 1,200 MAUs</Text>
            <Text style={styles.cardText}>Team: 5 members</Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Update Listing</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Tracker Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Progress Tracker</Text>
          <View style={styles.card}>
            <Text style={styles.cardText}>Monthly Revenue: $12,000</Text>
            <Text style={styles.cardText}>New Users: 150</Text>
            <Text style={styles.cardText}>Latest Milestone: Launched v2.0</Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Update Progress</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
  },
  tabText: {
    color: COLORS.text,
  },
  tabTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 15,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 15,
  },
  cardText: {
    color: COLORS.text,
    marginBottom: 8,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});
