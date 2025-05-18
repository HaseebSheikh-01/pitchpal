import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Linking, 
  Animated, 
  ActivityIndicator, 
  Dimensions,
  Image,
  Modal,
  Alert
} from "react-native";
import { useRouter } from "expo-router";
import API_IP from '../../constants/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

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
  contact_email?: string;
  userId: string;
}

interface UserDetails {
  name: string;
  email: string;
}

export default function Discover() {
  const router = useRouter();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pressedId, setPressedId] = useState<number | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [loadingStartupId, setLoadingStartupId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  const handleContact = async (startup: Startup) => {
    try {
      setLoadingStartupId(startup.id.toString());
      const token = await AsyncStorage.getItem('token');
      const investorId = await AsyncStorage.getItem('userId');

      if (!token || !investorId) throw new Error('Missing token or user ID');

      const investorRes = await fetch(`${API_IP}/api/investors/${investorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const investorData = await investorRes.json();
      const investorDetails: UserDetails = {
        name: investorData.investor.full_name,
        email: investorData.investor.email,
      };

      const startupUserRes = await fetch(`${API_IP}/api/users/${startup.userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const startupUserData = await startupUserRes.json();
      const startupUserDetails: UserDetails = {
        name: startupUserData.user.name,
        email: startupUserData.user.email,
      };

      const payload = {
        investorName: investorDetails.name,
        investorEmail: investorDetails.email,
        startupName: startupUserDetails.name,
        startupEmail: startupUserDetails.email,
      };

      const contactRes = await fetch(`${API_IP}/api/mail/contact-startup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (contactRes.ok) {
        // Increment successful matches count when contact is successful
        try {
          const matchedCountStr = await AsyncStorage.getItem('successfulMatchesCount');
          const matchedCount = matchedCountStr ? parseInt(matchedCountStr, 10) : 0;
          await AsyncStorage.setItem('successfulMatchesCount', (matchedCount + 1).toString());
        } catch (error) {
          console.error('Error updating successful matches count:', error);
        }
        
        setSelectedStartup(startup);
        setShowSuccessModal(true);
      } else {
        const error = await contactRes.text();
        throw new Error(error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send contact request.');
      console.error(error);
    } finally {
      setLoadingStartupId(null);
      setShowContactModal(false);
    }
  };

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
              <View key={startup.id} style={styles.card}>
                {startup.image && (
                  <Image 
                    source={{ uri: startup.image }} 
                    style={styles.startupImage}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.cardContent}>
                  <Text style={styles.name}>{startup.name}</Text>
                  <Text style={styles.cardDescription}>{startup.description}</Text>
                  {startup.industry && (
                    <View style={styles.tagContainer}>
                      <MaterialIcons name="business" size={16} color="#FF6347" />
                      <Text style={styles.industry}>{startup.industry}</Text>
                    </View>
                  )}
                  <View style={styles.tagContainer}>
                    <MaterialIcons name="trending-up" size={16} color="#1DB954" />
                    <Text style={styles.stage}>{startup.stage_of_business}</Text>
                  </View>
                  {startup.funding && (
                    <View style={styles.tagContainer}>
                      <MaterialIcons name="attach-money" size={16} color="#1E90FF" />
                      <Text style={styles.funding}>${startup.funding}</Text>
                    </View>
                  )}
                  {typeof startup.revenue_usd === 'number' && (
                    <View style={styles.tagContainer}>
                      <MaterialIcons name="account-balance" size={16} color="#4CAF50" />
                      <Text style={styles.revenue}>${startup.revenue_usd.toLocaleString()}</Text>
                    </View>
                  )}
                  <TouchableOpacity 
                    style={[
                      styles.contactButton,
                      loadingStartupId === startup.id.toString() && styles.disabledButton
                    ]}
                    onPress={() => handleContact(startup)}
                    disabled={loadingStartupId === startup.id.toString()}
                  >
                    {loadingStartupId === startup.id.toString() ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <MaterialIcons name="email" size={20} color="#FFFFFF" />
                        <Text style={styles.contactButtonText}>Contact Startup</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Success!</Text>
            <Text style={styles.modalText}>
              Contact email has been sent to {selectedStartup?.name}
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 30,
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 18,
    color: "#D3D3D3",
    textAlign: "center",
    marginBottom: 15,
    lineHeight: 24,
  },
  backButton: {
    position: "absolute",
    top: 50,
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
    paddingBottom: 20,
    paddingTop: 10,
  },
  card: {
    backgroundColor: "#1F1F1F",
    borderRadius: 20,
    marginBottom: 25,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  startupImage: {
    width: '100%',
    height: 220,
  },
  cardContent: {
    padding: 25,
  },
  name: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 16,
    color: '#A9A9A9',
    marginBottom: 20,
    lineHeight: 24,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#2A2A2A',
    padding: 8,
    borderRadius: 8,
  },
  industry: {
    fontSize: 16,
    color: "#FF6347",
    marginLeft: 8,
    fontWeight: '500',
  },
  stage: {
    fontSize: 16,
    color: "#1DB954",
    marginLeft: 8,
    fontWeight: '500',
  },
  funding: {
    fontSize: 16,
    color: "#1E90FF",
    marginLeft: 8,
    fontWeight: '500',
  },
  revenue: {
    fontSize: 16,
    color: "#4CAF50",
    marginLeft: 8,
    fontWeight: '500',
  },
  contactButton: {
    flexDirection: 'row',
    backgroundColor: '#1DB954',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 10,
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
  disabledButton: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
