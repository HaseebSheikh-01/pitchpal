import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Animated } from "react-native";
import { useRouter } from "expo-router";

// Define the type for the news data
interface NewsItem {
  id: number;
  title: string;
  description: string;
  link: string;
}

export default function Discover() {
  const router = useRouter();
  const [newsData, setNewsData] = useState<NewsItem[]>([]);  // Define state type
  const [pressedId, setPressedId] = useState<number | null>(null);

  // Fetch dummy data for news (replace with actual API later)
  useEffect(() => {
    // This is dummy data, you can replace it with a real API call
    setNewsData([
      { id: 1, title: "New Startup X Launches", description: "This is the description for Startup X", link: "https://www.example.com" },
      { id: 2, title: "Investment Opportunities in Y", description: "Learn about exciting investment opportunities.", link: "https://www.example.com" },
      { id: 3, title: "Innovative Solutions by Z", description: "Z is changing the game with its new approach.", link: "https://www.example.com" },
    ]);
  }, []);

  // Animation for press effect
  const pressIn = (id: number) => setPressedId(id);
  const pressOut = () => setPressedId(null);

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.push("/InvestorDashboard")}>
        <Text style={styles.backButtonText}>Back to Dashboard</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Discover Startups</Text>
      <Text style={styles.description}>Here you can discover new startups...</Text>

      {/* News cards */}
      <ScrollView contentContainerStyle={styles.newsContainer} showsVerticalScrollIndicator={false}>
        {newsData.map((item) => (
          <Animated.View
            key={item.id}
            style={[styles.card, pressedId === item.id && styles.cardPressed]} // Animation when card is pressed
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
            <TouchableOpacity
              style={styles.cardButton}
              onPressIn={() => pressIn(item.id)}  // Add press effect
              onPressOut={pressOut}  // Remove press effect
              onPress={() => Linking.openURL(item.link)}
            >
              <Text style={styles.cardButtonText}>Read More</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
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
    marginBottom: 20,
    textAlign: "center",
  },
  description: {
    fontSize: 18,
    color: "#D3D3D3",
    textAlign: "center",
    marginBottom: 30,
  },
  backButton: {
    position: "absolute",
    top: 60,  // Increased top margin to add more space from the top edge
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
  newsContainer: {
    width: "100%",
    paddingBottom: 20,
    alignItems: "center",
  },
  card: {
    backgroundColor: "#1F1F1F",
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    width: "100%",
    maxWidth: 600,
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
  cardTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 16,
    color: "#A9A9A9",
    marginBottom: 15,
  },
  cardButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#1E90FF",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  cardButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
});
