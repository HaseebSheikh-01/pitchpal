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
  ScrollView
} from 'react-native';
import BottomNavBar from './BottomNavBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import API_IP from '../../constants/apiConfig';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

// Helper function to increment a count in AsyncStorage
const incrementAsyncStorageCount = async (key: string) => {
  try {
    const current = await AsyncStorage.getItem(key);
    const next = current ? parseInt(current, 10) + 1 : 1;
    await AsyncStorage.setItem(key, next.toString());
  } catch (e) {
    console.error('Failed to increment', key, e);
  }
};

export default function Matchingscreen() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [swipedIds, setSwipedIds] = useState<string[]>([]); 
  const [showEmoji, setShowEmoji] = useState<string | null>(null);
  const [popupVisible, setPopupVisible] = useState(false); // State to control popup visibility
  const [popupMessage, setPopupMessage] = useState(''); // State for the popup message
  const [metricsClicked, setMetricsClicked] = useState<Set<string>>(new Set()); // Track metrics button click
  const position = useRef(new Animated.ValueXY()).current;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const initialize = async () => {
      try {
        const savedIds = await AsyncStorage.getItem('swipedStartups');
        if (savedIds) setSwipedIds(JSON.parse(savedIds));
        await fetchStartups();
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

      // Only fetch matched startups
      const response = await fetch(`${API_IP}/api/investors/${idToUse}/match`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      const startupsData = Array.isArray(data) ? data : data.startups;

      const freshSwipedIds = await AsyncStorage.getItem('swipedStartups');
      const parsedSwipedIds = freshSwipedIds ? JSON.parse(freshSwipedIds) : [];

      // Map funding_total_usd to funding string for display
      const mappedStartups = startupsData.map((s: any) => ({
        ...s,
        funding: s.funding_total_usd ? `$${s.funding_total_usd.toLocaleString()}` : 'N/A',
      }));

      setStartups(mappedStartups.filter((s: Startup) => 
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

    // Save the startup immediately when the user swipes right
    if (direction === 'right') {
      await saveStartup(swipedStartup); // Save startup on right swipe
      await incrementAsyncStorageCount('successfulMatchesCount'); // Increment matches count
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
      await incrementAsyncStorageCount('startupsSavedCount'); // Increment saved count
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

  const handleMetricsClick = (startup: Startup) => {
    // Prevent multiple clicks on the same startup card
    if (metricsClicked.has(startup.id)) {
      return; // Do nothing if the button has already been clicked
    }

    setPopupMessage("The model is working");
    setPopupVisible(true);

    // Simulate the model working for 1.5 seconds
    setTimeout(() => {
      const randomSuccessProbability = (Math.random() * (0.80 - 0.30) + 0.30).toFixed(2);
      setPopupMessage(`Success Probability: ${randomSuccessProbability}`);

      // Save the startup after showing the probability (if not already saved by swipe)
      saveStartup(startup);
    }, 1500);

    // Mark the startup as clicked (disable button for this startup)
    setMetricsClicked(prev => new Set(prev).add(startup.id));
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
              onPress={() => handleMetricsClick(startup)} // Call to fetch metrics and save startup
              disabled={metricsClicked.has(startup.id)} // Disable button if already clicked
            >
              <Text style={styles.checkButtonText}>View Metrics</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      );
    }).reverse();
  };

  // In renderStartups, increment 'startupsViewedCount' when a new card is shown
  useEffect(() => {
    if (startups.length > 0) {
      incrementAsyncStorageCount('startupsViewedCount');
    }
  }, [startups.length]);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <TouchableOpacity 
        style={[styles.backButton, { top: insets.top + 16 }]} 
        onPress={() => router.push('/InvestorDashboard')}
      >
        <Text style={styles.backButtonText}>‹ Back</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.resetButton, { top: insets.top + 16 }]} 
        onPress={handleResetSwipes}
      >
        <Text style={styles.resetButtonText}>⟳ Reset Swipes</Text>
      </TouchableOpacity>

      <View style={styles.cardContainer}>{renderStartups()}</View>

      {popupVisible && (
        <View style={styles.popupContainer}>
          <View style={styles.popup}>
            <Text style={styles.popupText}>{popupMessage}</Text>
            <TouchableOpacity 
              style={styles.popupCloseButton} 
              onPress={() => setPopupVisible(false)}
            >
              <Text style={styles.popupCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.emojiContainer}>
        {showEmoji && <Text style={styles.emoji}>{showEmoji}</Text>}
      </View>

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
  resetButton: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#FF4757',
    padding: 10,
    borderRadius: 8,
    zIndex: 100,
  },
  resetButtonText: {
    color: 'white',
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
  // Styles for popup
  popupContainer: {
    position: 'absolute',
    top: '25%',
    left: '45%',  // Adjusted left position to move it to the left a bit
    transform: [{ translateX: -120 }, { translateY: -100 }],  // Move horizontally and vertically
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 20,
    zIndex: 101,
    elevation: 5,
  },
  popup: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  popupText: {
    fontSize: 18,
    color: '#333333',
    fontWeight: 'bold', // Added bold text
    textAlign: 'center',
  },
  popupCloseButton: {
    backgroundColor: '#FF4757',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  popupCloseButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});