import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Modal, Image, Dimensions, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import API_IP from "../../constants/apiConfig"; // Replace with your API IP

const SCREEN_WIDTH = Dimensions.get('window').width;

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

// Update SuccessRateBar component
function SuccessRateBar({ viewed, matched }: { viewed: number; matched: number }) {
  const successRate = viewed > 0 ? (matched / viewed) * 100 : 0;
  const roundedRate = Math.round(successRate);

  return (
    <View style={styles.successRateContainer}>
      <View style={styles.successRateHeader}>
        <Text style={styles.successRateTitle}>Match Success Rate</Text>
        <View style={styles.percentageContainer}>
          <Text style={styles.successRatePercentage}>{roundedRate}%</Text>
        </View>
      </View>
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${roundedRate}%` }
          ]} 
        />
      </View>
      <Text style={styles.successRateSubtext}>
        {matched} successful matches out of {viewed} viewed startups
      </Text>
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

      <TouchableOpacity style={styles.navItem} onPress={() => router.push("/(dashboard)/RejectedStartups")}>
        <Ionicons name="close-circle" size={28} color={selected === "rejected" ? "#1E90FF" : "#888"} />
        <Text style={[styles.navText, selected === "rejected" && styles.navTextSelected]}>Rejected</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => router.push("/(dashboard)/ProfileSetting")}>
        <MaterialIcons name="person" size={28} color={selected === "profile" ? "#1E90FF" : "#888"} />
        <Text style={[styles.navText, selected === "profile" && styles.navTextSelected]}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

function GuidanceModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.guidanceModalContent}>
          <Text style={styles.guidanceTitle}>Welcome to Your Dashboard!</Text>
          
          <View style={styles.guidanceSection}>
            <Ionicons name="stats-chart" size={24} color="#4CAF50" />
            <View style={styles.guidanceTextContainer}>
              <Text style={styles.guidanceSubtitle}>Your Statistics</Text>
              <Text style={styles.guidanceText}>Track your startup interactions, saved startups, and successful matches</Text>
            </View>
          </View>

          <View style={styles.guidanceSection}>
            <Ionicons name="rocket" size={24} color="#1E90FF" />
            <View style={styles.guidanceTextContainer}>
              <Text style={styles.guidanceSubtitle}>View Startups</Text>
              <Text style={styles.guidanceText}>Start swiping through startups that match your preferences</Text>
            </View>
          </View>

          <View style={styles.guidanceSection}>
            <Ionicons name="search" size={24} color="#FF9800" />
            <View style={styles.guidanceTextContainer}>
              <Text style={styles.guidanceSubtitle}>Discover</Text>
              <Text style={styles.guidanceText}>Explore and find new startups based on your interests</Text>
            </View>
          </View>

          <View style={styles.guidanceSection}>
            <Ionicons name="person" size={24} color="#E91E63" />
            <View style={styles.guidanceTextContainer}>
              <Text style={styles.guidanceSubtitle}>Profile Settings</Text>
              <Text style={styles.guidanceText}>Update your preferences and investment criteria</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.guidanceButton}
            onPress={onClose}
          >
            <Text style={styles.guidanceButtonText}>Got it!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// New ActivityCard component
function ActivityCard({ activity }: { activity: Activity }) {
  const getIcon = () => {
    switch (activity.type) {
      case 'saved':
        return <FontAwesome name="heart" size={24} color="#E91E63" />;
      case 'rejected':
        return <Ionicons name="close-circle" size={24} color="#FF4444" />;
      case 'contacted':
        return <MaterialIcons name="email" size={24} color="#4CAF50" />;
      default:
        return <Ionicons name="time" size={24} color="#1E90FF" />;
    }
  };

  const getActionText = () => {
    switch (activity.type) {
      case 'saved':
        return 'Saved';
      case 'rejected':
        return 'Rejected';
      case 'contacted':
        return 'Contacted';
      default:
        return 'Viewed';
    }
  };

  const getActionColor = () => {
    switch (activity.type) {
      case 'saved':
        return '#E91E63';
      case 'rejected':
        return '#FF4444';
      case 'contacted':
        return '#4CAF50';
      default:
        return '#1E90FF';
    }
  };

  return (
    <View style={styles.activityCard}>
      <Image 
        source={{ uri: activity.startup.image }} 
        style={styles.activityImage}
        resizeMode="cover"
      />
      <View style={styles.activityContent}>
        <View style={[styles.activityHeader, { backgroundColor: `${getActionColor()}20` }]}>
          {getIcon()}
          <Text style={[styles.activityType, { color: getActionColor() }]}>{getActionText()}</Text>
        </View>
        <Text style={styles.startupName}>{activity.startup.name}</Text>
        <View style={styles.activityFooter}>
          <Ionicons name="time-outline" size={16} color="#888888" />
          <Text style={styles.activityTime}>{activity.timestamp}</Text>
        </View>
      </View>
    </View>
  );
}

// Add interface for activity type
interface Activity {
  type: 'saved' | 'rejected' | 'contacted' | 'viewed';
  startup: {
    id: string;
    name: string;
    image: string;
  };
  timestamp: string;
}

export default function InvestorDashboard() {
  const [stats, setStats] = useState({ viewed: 0, saved: 0, matched: 0 });
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [showGuidance, setShowGuidance] = useState(false);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const router = useRouter();

  useEffect(() => {
    const initialize = async () => {
      try {
        // Check if guidance has been shown in this session
        const hasSeenGuidance = await AsyncStorage.getItem('hasSeenDashboardGuidance');
        if (!hasSeenGuidance) {
          setShowGuidance(true);
          await AsyncStorage.setItem('hasSeenDashboardGuidance', 'true');
        }

        // Fetch metrics from AsyncStorage
        const viewedStr = await AsyncStorage.getItem('startupsViewedCount');
        const savedStr = await AsyncStorage.getItem('startupsSavedCount');
        const matchedStr = await AsyncStorage.getItem('successfulMatchesCount');

        const viewed = viewedStr ? parseInt(viewedStr, 10) : 0;
        const saved = savedStr ? parseInt(savedStr, 10) : 0;
        const matched = matchedStr ? parseInt(matchedStr, 10) : 0;

        setStats({ viewed, saved, matched });

        // Fetch user data
        const userId = await AsyncStorage.getItem("userId");
        const token = await AsyncStorage.getItem("token");

        if (!userId || !token) {
          console.error("User ID or token is missing");
          return;
        }

        const response = await fetch(`${API_IP}/api/users/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }

        const data = await response.json();
        if (data.user) {
          setUsername(data.user.name);
        }

        // Fetch recent activities
        await fetchRecentActivities();

      } catch (error) {
        console.error("Error initializing dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const fetchRecentActivities = async () => {
    try {
      // Get saved startups
      const savedStartups = await AsyncStorage.getItem('savedStartups');
      const saved = savedStartups ? JSON.parse(savedStartups) : [];
      
      // Get rejected startups
      const rejectedStartups = await AsyncStorage.getItem('rejectedStartups');
      const rejected = rejectedStartups ? JSON.parse(rejectedStartups) : [];

      // Get contacted startups
      const contactedStartups = await AsyncStorage.getItem('contactedStartups');
      const contacted = contactedStartups ? JSON.parse(contactedStartups) : [];

      // Combine and sort activities
      const activities = [
        ...saved.map((startup: any) => ({
          type: 'saved',
          startup: {
            id: startup.id,
            name: startup.name,
            image: startup.image || 'https://via.placeholder.com/150'
          },
          timestamp: new Date().toLocaleDateString()
        })),
        ...rejected.map((startup: any) => ({
          type: 'rejected',
          startup: {
            id: startup.id,
            name: startup.name,
            image: startup.image || 'https://via.placeholder.com/150'
          },
          timestamp: new Date().toLocaleDateString()
        })),
        ...contacted.map((startup: any) => ({
          type: 'contacted',
          startup: {
            id: startup.id,
            name: startup.name,
            image: startup.image || 'https://via.placeholder.com/150'
          },
          timestamp: new Date(startup.timestamp).toLocaleDateString()
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setRecentActivities(activities.slice(0, 5)); // Get 5 most recent activities
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  const handleCloseGuidance = () => {
    setShowGuidance(false);
  };

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
      {showGuidance && <GuidanceModal onClose={handleCloseGuidance} />}
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
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
            label="Startups Contacted"
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

        {/* Success Rate Bar */}
        <SuccessRateBar viewed={stats.viewed} matched={stats.matched} />

        {/* Recent Activity Section */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <FlatList
            data={recentActivities}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => <ActivityCard activity={item} />}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.activityList}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#FF4444" style={{ marginRight: 6 }} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        {/* Bottom Margin for better spacing */}
        <View style={{ marginBottom: 100 }} />
      </ScrollView>

      <BottomNavBar selected="home" />
    </View>
  );
}

// Update styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
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
    backgroundColor: "transparent",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FF4444',
    alignSelf: 'flex-end',
    marginRight: 20,
    width: 'auto',
  },
  logoutButtonText: {
    color: "#FF4444",
    fontSize: 14,
    fontWeight: "600",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#1E1E1E",
    paddingVertical: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#333333',
    paddingBottom: 20, // Add padding for devices with home indicator
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  guidanceModalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 30,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  guidanceTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  guidanceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
  },
  guidanceTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  guidanceSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  guidanceText: {
    fontSize: 14,
    color: '#B2B2B2',
    lineHeight: 20,
  },
  guidanceButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 16,
  },
  guidanceButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  activitySection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 15,
    marginLeft: 5,
  },
  activityList: {
    paddingLeft: 5,
    paddingRight: 20,
  },
  activityCard: {
    width: SCREEN_WIDTH * 0.75,
    backgroundColor: "#1E1E1E",
    borderRadius: 20,
    marginRight: 15,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  activityImage: {
    width: "100%",
    height: 140,
  },
  activityContent: {
    padding: 15,
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  activityType: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  startupName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  activityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  activityTime: {
    color: "#888888",
    fontSize: 13,
    marginLeft: 6,
  },
  successRateContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 5,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  successRateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  successRateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  percentageContainer: {
    backgroundColor: '#4CAF5020',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  successRatePercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
  },
  successRateSubtext: {
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'center',
  },
});