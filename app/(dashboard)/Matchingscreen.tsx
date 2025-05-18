import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  Dimensions, 
  Animated, 
  PanResponder, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Modal
} from 'react-native';
import BottomNavBar from './BottomNavBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import API_IP from '../../constants/apiConfig';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

type Startup = {
  id: string;
  name: string;
  description: string;
  industry: string;
  funding: string;
  revenue_usd: number;
  image: string;
};

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
          <Text style={styles.guidanceTitle}>Welcome to Startup Matching!</Text>
          
          <View style={styles.guidanceSection}>
            <MaterialIcons name="swipe" size={24} color="#1DB954" />
            <View style={styles.guidanceTextContainer}>
              <Text style={styles.guidanceSubtitle}>Swipe Right</Text>
              <Text style={styles.guidanceText}>Save startups you're interested in</Text>
            </View>
          </View>

          <View style={styles.guidanceSection}>
            <MaterialIcons name="swipe-left" size={24} color="#FF4444" />
            <View style={styles.guidanceTextContainer}>
              <Text style={styles.guidanceSubtitle}>Swipe Left</Text>
              <Text style={styles.guidanceText}>Skip startups that don't match your interests</Text>
            </View>
          </View>

          <View style={styles.guidanceSection}>
            <MaterialIcons name="analytics" size={24} color="#FF9800" />
            <View style={styles.guidanceTextContainer}>
              <Text style={styles.guidanceSubtitle}>View Metrics</Text>
              <Text style={styles.guidanceText}>Check success probability and key metrics for each startup</Text>
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

export default function Matchingscreen() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [swipedIds, setSwipedIds] = useState<string[]>([]);
  const [showEmoji, setShowEmoji] = useState<string | null>(null);
  const [isMetricsLoading, setIsMetricsLoading] = useState(false);
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [successProbability, setSuccessProbability] = useState<number | null>(null);
  const position = useRef(new Animated.ValueXY()).current;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showGuidance, setShowGuidance] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        const savedIds = await AsyncStorage.getItem('swipedStartups');
        if (savedIds) setSwipedIds(JSON.parse(savedIds));
        await fetchStartups();
        
        // Check if guidance has been shown in this session
        const hasSeenGuidance = await AsyncStorage.getItem('hasSeenMatchingGuidance');
        if (!hasSeenGuidance) {
          setShowGuidance(true);
          await AsyncStorage.setItem('hasSeenMatchingGuidance', 'true');
        }
      } catch (error) {
        console.error('Initialization error:', error);
        setError('Failed to initialize');
      }
    };
    initialize();
  }, []);

  const fetchStartups = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      const investorId = await AsyncStorage.getItem('investorId');
      const token = await AsyncStorage.getItem('token');
      const idToUse = investorId || userId;

      if (!idToUse) throw new Error('User identifier missing');

      const response = await fetch(`${API_IP}/api/investors/${idToUse}/match`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      
      const data = await response.json();
      const startupsData = Array.isArray(data) ? data : data.startups;
      
      const freshSwipedIds = await AsyncStorage.getItem('swipedStartups');
      const parsedSwipedIds = freshSwipedIds ? JSON.parse(freshSwipedIds) : [];
      
      setStartups(startupsData.filter((s: Startup) => 
        !parsedSwipedIds.includes(s.id)
      ));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch startups');
    } finally {
      setLoading(false);
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) forceSwipe('right');
      else if (gesture.dx < -SWIPE_THRESHOLD) forceSwipe('left');
      else resetPosition();
    },
  });

  const forceSwipe = (direction: 'left' | 'right') => {
    Animated.timing(position, {
      toValue: { x: direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => handleSwipeComplete(direction));
    setShowEmoji(direction === 'right' ? '✅' : '❌');
  };

  const handleSwipeComplete = async (direction: 'left' | 'right') => {
    const [swipedStartup, ...remaining] = startups;
    if (!swipedStartup) return;

    const newSwipedIds = [...swipedIds, swipedStartup.id];
    setSwipedIds(newSwipedIds);
    await AsyncStorage.setItem('swipedStartups', JSON.stringify(newSwipedIds));

    // Increment startups viewed count
    try {
      const viewedCountStr = await AsyncStorage.getItem('startupsViewedCount');
      const viewedCount = viewedCountStr ? parseInt(viewedCountStr, 10) : 0;
      await AsyncStorage.setItem('startupsViewedCount', (viewedCount + 1).toString());
    } catch (error) {
      console.error('Error updating startups viewed count:', error);
    }

    // Call the appropriate API for swipe direction
    if (direction === 'right') {
      await rightSwipe(swipedStartup.id);
      await saveStartup(swipedStartup);

      // Increment startups saved count
      try {
        const savedCountStr = await AsyncStorage.getItem('startupsSavedCount');
        const savedCount = savedCountStr ? parseInt(savedCountStr, 10) : 0;
        await AsyncStorage.setItem('startupsSavedCount', (savedCount + 1).toString());
      } catch (error) {
        console.error('Error updating startups saved count:', error);
      }
    } else if (direction === 'left') {
      await leftSwipe(swipedStartup.id);
    }

    setStartups(remaining);
    position.setValue({ x: 0, y: 0 });
    setShowEmoji(null);
  };

  const saveStartup = async (startup: Startup) => {
    try {
      const saved = await AsyncStorage.getItem('savedStartups');
      const startups = saved ? JSON.parse(saved) : [];
      startups.push(startup);
      await AsyncStorage.setItem('savedStartups', JSON.stringify(startups));
      Alert.alert('Saved', `${startup.name} added to favorites`);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
    setShowEmoji(null);
  };

  const handleResetSwipes = async () => {
    await AsyncStorage.removeItem('swipedStartups');
    setSwipedIds([]);
    fetchStartups();
  };

  // API call to record a left swipe
  const leftSwipe = async (startupId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(`${API_IP}/api/startup-interactions/${startupId}/left-swipe`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Left swipe API error:', error);
    }
  };

  // API call to record a right swipe
  const rightSwipe = async (startupId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(`${API_IP}/api/startup-interactions/${startupId}/right-swipe`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Right swipe API error:', error);
    }
  };

  // API call to record a viewed startup
  const viewedStartup = async (startupId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(`${API_IP}/api/startup-interactions/${startupId}/view`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Viewed startup API error:', error);
    }
  };

  // Call viewedStartup when a new startup is shown (top card)
  useEffect(() => {
    if (startups.length > 0) {
      viewedStartup(startups[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startups.length > 0 && startups[0]?.id]);

  const handleCloseGuidance = () => {
    setShowGuidance(false);
  };

  // Add function to generate random probability
  const generateRandomProbability = () => {
    return Math.floor(Math.random() * (80 - 30 + 1)) + 30; // Random number between 30 and 80
  };

  // Add function to handle metrics view
  const handleViewMetrics = (startup: Startup) => {
    setIsMetricsLoading(true);
    setSelectedStartup(startup);
    setShowMetricsModal(true);
    
    // Simulate loading delay
    setTimeout(() => {
      setSuccessProbability(generateRandomProbability());
      setIsMetricsLoading(false);
    }, 1500);
  };

  const renderStartups = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1DB954" />
          <Text style={styles.loadingText}>Loading startups...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (startups.length === 0) {
      return (
        <View style={styles.noMoreCards}>
          <Text style={styles.noMoreText}>No more startups to show</Text>
        </View>
      );
    }

    return startups.map((startup, index) => {
      const isTopCard = index === 0;
      const cardStyle = isTopCard ? 
        [styles.card, position.getLayout()] : 
        [styles.card, { zIndex: -index }];

      return (
        <Animated.View
          key={startup.id}
          style={cardStyle}
          {...(isTopCard ? panResponder.panHandlers : {})}
        >
          <Image 
            source={{ uri: startup.image }} 
            style={styles.image} 
            resizeMode="cover"
          />
          <ScrollView contentContainerStyle={styles.cardDetails}>
            <Text style={styles.name}>{startup.name}</Text>
            <Text style={styles.description}>{startup.description}</Text>
            <Text style={styles.industry}>{startup.industry}</Text>
            <Text style={styles.funding}>Funding: {startup.funding}</Text>
            <Text style={styles.revenue}>Revenue: ${startup.revenue_usd.toLocaleString()}</Text>
            <TouchableOpacity 
              style={styles.checkButton} 
              onPress={() => handleViewMetrics(startup)}
            >
              <Text style={styles.checkButtonText}>View Metrics</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      );
    }).reverse();
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {showGuidance && <GuidanceModal onClose={handleCloseGuidance} />}

      <TouchableOpacity 
        style={[styles.backButton, { top: insets.top + 16 }]} 
        onPress={() => router.push('/InvestorDashboard')}
      >
        <Text style={styles.backButtonText}>‹ Back</Text>
      </TouchableOpacity>

      <View style={styles.cardContainer}>{renderStartups()}</View>

      <View style={styles.emojiContainer}>
        {showEmoji && <Text style={styles.emoji}>{showEmoji}</Text>}
      </View>

      {/* Metrics Modal */}
      <Modal
        visible={showMetricsModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowMetricsModal(false);
          setSuccessProbability(null);
          setSelectedStartup(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.metricsModalContent}>
            {isMetricsLoading ? (
              <>
                <ActivityIndicator size="large" color="#1DB954" />
                <Text style={styles.metricsLoadingText}>Analyzing startup metrics...</Text>
              </>
            ) : (
              <>
                <Text style={styles.metricsTitle}>Success Probability Analysis</Text>
                <Text style={styles.startupName}>{selectedStartup?.name}</Text>
                <View style={styles.probabilityContainer}>
                  <Text style={styles.probabilityText}>{successProbability}%</Text>
                  <Text style={styles.probabilityLabel}>Success Probability</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setShowMetricsModal(false);
                    setSuccessProbability(null);
                    setSelectedStartup(null);
                  }}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <BottomNavBar selected="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 16,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    padding: 10,
    backgroundColor: '#1E90FF',
    borderRadius: 5,
    zIndex: 100,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_HEIGHT * 0.65,
    maxHeight: 600,
    borderRadius: 15,
    backgroundColor: '#1E1E1E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.3,
    maxHeight: 300,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardDetails: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#AAAAAA',
    marginBottom: 15,
    textAlign: 'center',
  },
  industry: {
    fontSize: 18,
    color: '#FF6347',
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  funding: {
    fontSize: 20,
    color: '#1E90FF',
    fontWeight: '700',
    textAlign: 'center',
  },
  revenue: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: '700',
    marginTop: 5,
    textAlign: 'center',
  },
  checkButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 15,
    alignItems: 'center',
  },
  checkButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  noMoreCards: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMoreText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  emojiContainer: {
    position: 'absolute',
    top: '45%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -20 }],
  },
  emoji: {
    fontSize: 50,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#1DB954',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#F72585',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricsModalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 30,
    width: '80%',
    alignItems: 'center',
  },
  metricsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  metricsLoadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  startupName: {
    fontSize: 18,
    color: '#1DB954',
    marginBottom: 20,
    textAlign: 'center',
  },
  probabilityContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  probabilityText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  probabilityLabel: {
    fontSize: 16,
    color: '#B2B2B2',
    marginTop: 8,
  },
  closeButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
});
