import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Animated, PanResponder, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import BottomNavBar from './BottomNavBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router'; // Import router from expo-router
import API_IP from '../../constants/apiConfig';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

type Startup = {
  id: string;
  name: string;
  description: string;
  industry: string;
  funding: string;
  image: string;
};

export default function Matchingscreen() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const position = useRef(new Animated.ValueXY()).current;
  const [showEmoji, setShowEmoji] = useState<string | null>(null);
  const router = useRouter(); // Use the router from expo-router

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        setLoading(true);
        setError(null);

        const keys = await AsyncStorage.getAllKeys();
        console.log('AsyncStorage keys:', keys);
        const stores = await AsyncStorage.multiGet(keys);
        stores.forEach(([key, value]) => {
          console.log(`AsyncStorage key: ${key}, value: ${value}`);
        });

        const userId = await AsyncStorage.getItem('userId');
        const investorId = await AsyncStorage.getItem('investorId');
        const token = await AsyncStorage.getItem('token');
        const idToUse = investorId || userId;
        console.log('Fetching startups for investorId/userId:', idToUse);
        if (!idToUse) {
          setError('User identifier not found. Please login again.');
          setLoading(false);
          return;
        }
        const url = `${API_IP}/api/investors/${idToUse}/match`;
        console.log('Fetching from URL:', url);
        const response = await fetch(url, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setStartups(data);
        } else if (data && Array.isArray(data.startups)) {
          setStartups(data.startups);
        } else {
          console.error('Expected array but got:', data);
          setError('Unexpected data format received from server.');
          setStartups([]);
        }
      } catch (err) {
        setError('Failed to fetch matching startups. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStartups();
  }, []);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
      if (gesture.dx > 0) {
        setSwipeDirection('right');
      } else if (gesture.dx < 0) {
        setSwipeDirection('left');
      }
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        forceSwipe('right');
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        forceSwipe('left');
      } else {
        resetPosition();
      }
    },
  });

  const forceSwipe = (direction: 'left' | 'right') => {
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
    setShowEmoji(direction === 'right' ? '✅' : '❌');
  };

  const onSwipeComplete = (direction: 'left' | 'right') => {
    const [removedStartup, ...rest] = startups;
    if (direction === 'right') {
      saveStartup(removedStartup); // Save matched startup to AsyncStorage
    }
    setStartups(rest);
    position.setValue({ x: 0, y: 0 });
    setShowEmoji(null); // Hide emoji after swipe is complete
  };

  const saveStartup = async (startup: Startup) => {
    try {
      const savedStartups = await AsyncStorage.getItem('savedStartups');
      const startups = savedStartups ? JSON.parse(savedStartups) : [];
      startups.push(startup);
      await AsyncStorage.setItem('savedStartups', JSON.stringify(startups));
      Alert.alert('Startup Saved', `${startup.name} has been saved to your list.`);
    } catch (error) {
      console.error('Error saving startup:', error);
    }
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
    setShowEmoji(null); // Hide emoji on reset
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
          <Text style={styles.noMoreText}>No more startups</Text>
        </View>
      );
    }

    return startups.map((startup, index) => {
      if (index === 0) {
        return (
          <Animated.View
            key={startup.id}
            style={[styles.card, position.getLayout()]}
            {...panResponder.panHandlers}
          >
            <Image source={{ uri: startup.image }} style={styles.image} />
            <View style={styles.cardDetails}>
              <Text style={styles.name}>{startup.name}</Text>
              <Text style={styles.description}>{startup.description}</Text>
              <Text style={styles.industry}>{startup.industry}</Text>
              <Text style={styles.funding}>{startup.funding}</Text>
            </View>
          </Animated.View>
        );
      }
      return (
        <View key={startup.id} style={[styles.card, { top: 10 * index }]}>
          <Image source={{ uri: startup.image }} style={styles.image} />
          <View style={styles.cardDetails}>
            <Text style={styles.name}>{startup.name}</Text>
            <Text style={styles.description}>{startup.description}</Text>
            <Text style={styles.industry}>{startup.industry}</Text>
            <Text style={styles.funding}>{startup.funding}</Text>
          </View>
        </View>
      );
    }).reverse();
  };

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/InvestorDashboard')}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.cardContainer}>{renderStartups()}</View>

      <View style={styles.emojiContainer}>
        {showEmoji && <Text style={styles.emoji}>{showEmoji}</Text>}
      </View>

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
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 10,
    backgroundColor: '#1E90FF',
    borderRadius: 5,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: '100%',
    borderRadius: 15,
    backgroundColor: '#1E1E1E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
    padding: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 15,
  },
  cardDetails: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 10,
  },
  industry: {
    fontSize: 16,
    color: '#FF6347',
    fontWeight: '600',
    marginBottom: 5,
  },
  funding: {
    fontSize: 18,
    color: '#1E90FF',
    fontWeight: '700',
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
