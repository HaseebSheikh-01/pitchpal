import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import API_IP from "../../constants/apiConfig"; // Replace with your API IP

// Function to handle statistics card
function StatisticCard({
  icon,
  label,
  count,
  iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  iconColor?: string;
}) {
  return (
    <View style={styles.statCard}>
      {icon}
      <Text style={styles.statCount}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function BottomNavBar({ selected }: { selected: string }) {
  const router = useRouter();

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItem} onPress={() => router.push("/(dashboard)/InvestorDashboard")}>
        <Ionicons name="home" size={28} color={selected === "home" ? "#1E90FF" : "#888"} />
        <Text style={[styles.navText, selected === "home" && styles.navTextSelected]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => router.push("/(dashboard)/SavedStartups")}>
        <FontAwesome name="heart" size={28} color={selected === "saved" ? "#1E90FF" : "#888"} />
        <Text style={[styles.navText, selected === "saved" && styles.navTextSelected]}>Saved</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => router.push("/(dashboard)/ProfileSetting")}>
        <MaterialIcons name="person" size={28} color={selected === "profile" ? "#1E90FF" : "#888"} />
        <Text style={[styles.navText, selected === "profile" && styles.navTextSelected]}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function InvestorDashboard() {
  const [stats, setStats] = useState({ viewed: 0, saved: 0, matched: 0 });
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate fetching analytics data asynchronously
    const fetchAnalytics = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStats({ viewed: 120, saved: 45, matched: 10 });
    };

    // Fetch userId from AsyncStorage and then fetch user data from API
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        const token = await AsyncStorage.getItem("token"); // Fetch token from AsyncStorage

        if (!userId || !token) {
          console.error("User ID or token is missing");
          return;
        }

        const response = await fetch(`${API_IP}/api/users/${userId}`, {
          method: "GET", // Ensure you are using the correct HTTP method (GET)
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }

        const data = await response.json();
        if (data.user) {
          setUsername(data.user.name);
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      // Clear AsyncStorage to log the user out
      await AsyncStorage.clear();
      router.push("/login"); // Redirect to the login screen after logging out
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerCenteredColumn}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.usernameText}>{username}</Text>
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

      {/* Action Buttons */}
      <TouchableOpacity style={styles.viewStartupsButton} onPress={() => router.push("/(dashboard)/Matchingscreen")}>
        <Ionicons name="rocket" size={20} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.viewStartupsButtonText}>View Startups</Text>
      </TouchableOpacity>

      {/* Discover Button */}
      <TouchableOpacity style={styles.discoverButton} onPress={() => router.push("/(dashboard)/discover")}>
        <Ionicons name="search" size={20} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.discoverButtonText}>Discover</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      {/* Bottom Navigation Bar */}
      <BottomNavBar selected="home" />

      {/* Bottom Margin for better spacing */}
      <View style={{ marginBottom: 20 }} />
    </View>
  );
}

// New Style for the Discover Button
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: 60,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  headerCenteredColumn: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  usernameText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  statCount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#AAAAAA",
    marginTop: 4,
  },
  viewStartupsButton: {
    flexDirection: "row",
    backgroundColor: "#1E90FF",
    paddingVertical: 15,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  viewStartupsButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  discoverButton: {
    flexDirection: "row",
    backgroundColor: "#FF9800", // Change color for Discover button
    paddingVertical: 15,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  discoverButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#E91E63", // Red color for logout
    paddingVertical: 15,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#1E1E1E",
    paddingVertical: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  navTextSelected: {
    color: "#1E90FF",
    fontWeight: "600",
  },
});
