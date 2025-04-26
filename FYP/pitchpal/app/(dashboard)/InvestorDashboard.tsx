import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Link, router } from "expo-router";
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';

const investorSample = {
  name: "",
  profilePic: "",
};

function StatisticCard({ icon, label, count, iconColor }: { icon: React.ReactNode; label: string; count: number; iconColor?: string }) {
  return (
    <View style={styles.statCard}>
      {icon}
      <Text style={styles.statCount}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

import { useRouter } from 'expo-router';

function BottomNavBar({ selected }: { selected: string }) {
  const router = useRouter();

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(dashboard)/InvestorDashboard')}>
        <Ionicons name="home" size={28} color={selected === "home" ? "#1E90FF" : "#888"} />
        <Text style={[styles.navText, selected === "home" && styles.navTextSelected]}>Home</Text>
      </TouchableOpacity>
      {/* Removed Discover button as per request */}
      <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(dashboard)/SavedStartups')}>
        <FontAwesome name="heart" size={28} color={selected === "saved" ? "#1E90FF" : "#888"} />
        <Text style={[styles.navText, selected === "saved" && styles.navTextSelected]}>Saved</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(dashboard)/ProfileSetting')}>
        <MaterialIcons name="person" size={28} color={selected === "profile" ? "#1E90FF" : "#888"} />
        <Text style={[styles.navText, selected === "profile" && styles.navTextSelected]}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function InvestorDashboard() {
  const [stats, setStats] = useState({ viewed: 0, saved: 0, matched: 0 });

  useEffect(() => {
    // Simulate fetching analytics data asynchronously
    const fetchAnalytics = async () => {
      // Simulated delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Set sample data - replace with API call in future
      setStats({ viewed: 120, saved: 45, matched: 10 });
    };
    fetchAnalytics();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image source={{ uri: investorSample.profilePic }} style={styles.profilePic} />
        <Text style={styles.welcomeText}>Welcome back, {investorSample.name}</Text>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <StatisticCard
          icon={<Ionicons name="eye" size={32} color="#4CAF50" />}
          label="Startups Viewed"
          count={stats.viewed}
          iconColor="#4CAF50"
        />
        <StatisticCard
          icon={<FontAwesome name="heart" size={32} color="#E91E63" />}
          label="Startups Saved"
          count={stats.saved}
          iconColor="#E91E63"
        />
        <StatisticCard
          icon={<Ionicons name="checkmark-circle" size={32} color="#2196F3" />}
          label="Successful Matches"
          count={stats.matched}
          iconColor="#2196F3"
        />
      </View>

      {/* Action Button */}
      <TouchableOpacity style={styles.viewStartupsButton} onPress={() => router.push('/(dashboard)/Matchingscreen')}>
        <Ionicons name="rocket" size={20} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.viewStartupsButtonText}>View Startups</Text>
      </TouchableOpacity>

      {/* Bottom Navigation Bar */}
      <BottomNavBar selected="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 60,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  statCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#AAAAAA',
    marginTop: 4,
  },
  viewStartupsButton: {
    flexDirection: 'row',
    backgroundColor: '#1E90FF',
    paddingVertical: 15,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  viewStartupsButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1E1E1E',
    paddingVertical: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  navTextSelected: {
    color: '#1E90FF',
    fontWeight: '600',
  },
});
