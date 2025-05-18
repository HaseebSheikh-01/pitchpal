import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Animated, ActivityIndicator, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import API_IP from '../../constants/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

// Define the type for the startup data
interface Startup {
  id: number;
  name: string;
  description: string;
  stage_of_business: string;
  industry?: string;
  funding?: string;
  revenue_usd?: number;
  image?: string;
}

export default function Discover() {
  const router = useRouter();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pressedId, setPressedId] = useState<number | null>(null);

  // Fetch startups from the API
  useEffect(() => {
    const fetchStartups = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          setError("No authentication token found.");
          setLoading(false);
          return;
        }
        const res = await fetch(`${API_IP}/api/startups/stage/early-or-seed`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await res.json();
        console.log("API response:", data);
        if (Array.isArray(data)) {
          setStartups(data);
        } else if (data && Array.isArray(data.startups)) {
          setStartups(data.startups);
        } else {
          setError("Unexpected API response format.");
        }
      } catch (err) {
        console.error('Failed to fetch startups:', err);
        setError("Failed to fetch startups.");
      } finally {
        setLoading(false);
      }
    };
    fetchStartups();
  }, []);

  // Animation for press effect
  const pressIn = (id: number) => setPressedId(id);
  const pressOut = () => setPressedId(null);

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.push("/InvestorDashboard")}> 
        <Text style={styles.backButtonText}>‹ Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Discover Startups</Text>
      <Text style={styles.description}>Here you can discover new early stage or seed startups...</Text>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1DB954" />
          <Text style={styles.loadingText}>Loading startups...</Text>
        </View>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && (
        <ScrollView contentContainerStyle={styles.cardContainer} showsVerticalScrollIndicator={false}>
          {startups.length === 0 ? (
            <Text style={styles.noMoreText}>No startups found.</Text>
          ) : (
            startups.map((startup) => (
              <Animated.View
                key={startup.id}
                style={[styles.card, pressedId === startup.id && styles.cardPressed]}
                onTouchStart={() => pressIn(startup.id)}
                onTouchEnd={pressOut}
              >
                {/* You can add an Image here if you want: startup.image */}
                <Text style={styles.name}>{startup.name}</Text>
                <Text style={styles.cardDescription}>{startup.description}</Text>
                {startup.industry && <Text style={styles.industry}>{startup.industry}</Text>}
                <Text style={styles.stage}>Stage: {startup.stage_of_business}</Text>
                {startup.funding && <Text style={styles.funding}>Funding: ${startup.funding}</Text>}
                {typeof startup.revenue_usd === 'number' && <Text style={styles.revenue}>Revenue: ${startup.revenue_usd.toLocaleString()}</Text>}
              </Animated.View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: 100, // Increased padding to move content down and avoid notch area
    paddingHorizontal: 20,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 60,
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 18,
    color: "#D3D3D3",
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    position: "absolute",
    top: 30,  // ⬆️ moved higher
    left: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#1E90FF",
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  cardContainer: {
    width: "100%",
    paddingBottom: 20,
    alignItems: "center",
  },
  card: {
    backgroundColor: "#1F1F1F",
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    width: SCREEN_WIDTH * 0.85,
    maxHeight: 600,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],  // Scale down the card when pressed
    backgroundColor: "#333333", // Change color on press
  },
  name: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 16,
    color: '#A9A9A9',
    marginBottom: 15,
  },
  industry: {
    fontSize: 18,
    color: "#FF6347",
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  stage: {
    fontSize: 16,
    color: "#1DB954",
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  funding: {
    fontSize: 20,
    color: "#1E90FF",
    fontWeight: "700",
    textAlign: "center",
  },
  revenue: {
    fontSize: 20,
    color: "#4CAF50",
    fontWeight: "700",
    marginTop: 5,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#1DB954",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#F72585",
    fontSize: 16,
  },
  noMoreText: {
    fontSize: 18,
    color: "#FFFFFF",
    marginTop: 40,
    textAlign: "center",
  },
});
