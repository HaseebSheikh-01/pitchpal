import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Link, router } from "expo-router";

export default function InvestorDashboard() {
  return (
    <View style={styles.container}>
      <Link href="/roleSelection" asChild>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </Link>
      
      <Text style={styles.title}>Investor Dashboard</Text>
      <Text style={styles.description}>Welcome, Investor! Here you can find and invest in promising startups.</Text>
      
      <TouchableOpacity 
        style={styles.navButton}
      >
        <Text style={styles.buttonText}>View Startups</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => router.push('/investorDataCollection')}
      >
        <Text style={styles.buttonText}>Update Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#121212',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 16,
    color: '#AAAAAA',
    marginTop: 8,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  navButton: {
    backgroundColor: '#1E90FF',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
