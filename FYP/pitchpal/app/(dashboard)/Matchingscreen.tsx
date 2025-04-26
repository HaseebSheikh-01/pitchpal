import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Animated, PanResponder, TouchableOpacity, Alert } from 'react-native';  // Added Alert here
import BottomNavBar from './BottomNavBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';


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

const sampleStartups: Startup[] = [
  { id: '1', name: 'Startup One', description: 'Innovative tech solutions', image: 'https://via.placeholder.com/300x200.png?text=Startup+One', industry: 'Technology', funding: '$500,000' },
  { id: '2', name: 'Startup Two', description: 'Revolutionizing healthcare', image: 'https://via.placeholder.com/300x200.png?text=Startup+Two', industry: 'Healthcare', funding: '$1,000,000' },
  { id: '3', name: 'Startup Three', description: 'Sustainable energy', image: 'https://via.placeholder.com/300x200.png?text=Startup+Three', industry: 'Energy', funding: '$200,000' },
];

export default function Matchingscreen() {
  const [startups, setStartups] = useState<Startup[]>(sampleStartups);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const position = new Animated.ValueXY();
  const [showEmoji, setShowEmoji] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchStartups = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStartups(sampleStartups);
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
});

