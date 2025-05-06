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

export default function Matchingscreen() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [swipedIds, setSwipedIds] = useState<string[]>([]);
  const [showEmoji, setShowEmoji] = useState<string | null>(null);
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

    if (direction === 'right') {
      await saveStartup(swipedStartup);

      // Increment startups saved count
      try {
        const savedCountStr = await AsyncStorage.getItem('startupsSavedCount');
        const savedCount = savedCountStr ? parseInt(savedCountStr, 10) : 0;
        await AsyncStorage.setItem('startupsSavedCount', (savedCount + 1).toString());
      } catch (error) {
        console.error('Error updating startups saved count:', error);
      }

      // Increment successful matches count (assuming right swipe means successful match)
      try {
        const matchedCountStr = await AsyncStorage.getItem('successfulMatchesCount');
        const matchedCount = matchedCountStr ? parseInt(matchedCountStr, 10) : 0;
        await AsyncStorage.setItem('successfulMatchesCount', (matchedCount + 1).toString());
      } catch (error) {
        console.error('Error updating successful matches count:', error);
      }
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
              onPress={() => Alert.alert('Success Metrics', `Metrics for ${startup.name}`)}
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
    justifyContent: 'center', // Centers content inside the card
    alignItems: 'center', // Centers content inside the card
    top: (SCREEN_HEIGHT - SCREEN_HEIGHT * 0.65) / 3, // Vertically centers the top card
    left: (SCREEN_WIDTH - SCREEN_WIDTH * 0.85) / 2, // Horizontally centers the top card
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
});
