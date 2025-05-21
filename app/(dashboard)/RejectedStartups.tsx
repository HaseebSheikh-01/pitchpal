import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import API_IP from '../../constants/apiConfig';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface Startup {
  id: string;
  name: string;
  description: string;
  industry: string;
  funding: string;
  revenue_usd: number;
  image: string;
}

function BottomNavBar({ selected }: { selected: "home" | "saved" | "rejected" | "profile" }) {
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

export default function RejectedStartups() {
  const [rejectedStartups, setRejectedStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchRejectedStartups();
  }, []);

  const fetchRejectedStartups = async () => {
    try {
      const rejectedData = await AsyncStorage.getItem('rejectedStartups');
      if (rejectedData) {
        const parsedData = JSON.parse(rejectedData);
        setRejectedStartups(parsedData);
      } else {
        setRejectedStartups([]);
      }
    } catch (error) {
      console.error('Error fetching rejected startups:', error);
      Alert.alert('Error', 'Failed to load rejected startups');
    } finally {
      setLoading(false);
    }
  };

  const handleUndoReject = async (startupId: string) => {
    try {
      // Get current rejected startups
      const rejectedData = await AsyncStorage.getItem('rejectedStartups');
      if (rejectedData) {
        const parsedData = JSON.parse(rejectedData);
        // Remove the startup from rejected list
        const updatedRejected = parsedData.filter((startup: Startup) => startup.id !== startupId);
        // Save updated list
        await AsyncStorage.setItem('rejectedStartups', JSON.stringify(updatedRejected));
        // Update state
        setRejectedStartups(updatedRejected);

        // Remove from swipedStartups list so it can appear again in matching screen
        const swipedData = await AsyncStorage.getItem('swipedStartups');
        if (swipedData) {
          const swipedIds = JSON.parse(swipedData);
          const updatedSwipedIds = swipedIds.filter((id: string) => id !== startupId);
          await AsyncStorage.setItem('swipedStartups', JSON.stringify(updatedSwipedIds));
        }

        Alert.alert(
          'Success',
          'Startup has been restored to your matching feed'
        );
      }
    } catch (error) {
      console.error('Error undoing reject:', error);
      Alert.alert('Error', 'Failed to undo reject');
    }
  };

  const renderStartupCard = ({ item }: { item: Startup }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.industry}>Industry: {item.industry}</Text>
        <Text style={styles.funding}>Funding: {item.funding}</Text>
        <Text style={styles.revenue}>Revenue: ${item.revenue_usd.toLocaleString()}</Text>
        <TouchableOpacity 
          style={styles.undoButton}
          onPress={() => handleUndoReject(item.id)}
        >
          <Ionicons name="refresh" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.undoButtonText}>Undo Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Rejected Startups</Text>
      </View>

      {rejectedStartups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No rejected startups yet</Text>
          <Text style={styles.emptySubText}>
            Startups you swipe left on will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={rejectedStartups}
          renderItem={renderStartupCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <BottomNavBar selected="rejected" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2C',
    paddingTop: 30,
    paddingBottom: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    marginTop: 30,
    marginLeft: 10,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  industry: {
    fontSize: 16,
    color: '#1DB954',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#B3B3B3',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  funding: {
    fontSize: 14,
    color: '#1E90FF',
    fontWeight: '600',
  },
  revenue: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  rejectedDate: {
    fontSize: 12,
    color: '#FF5252',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reconsiderButton: {
    flex: 1,
    backgroundColor: '#1DB954',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  reconsiderButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  removeButton: {
    flex: 1,
    backgroundColor: '#FF5252',
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: '#B3B3B3',
    textAlign: 'center',
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
    paddingBottom: 20,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  undoButton: {
    backgroundColor: '#FF9800',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 25,
    marginTop: 10,
  },
  undoButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});