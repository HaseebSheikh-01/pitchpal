import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_IP from '../../constants/apiConfig';

interface StartupAnalytics {
  id: string;
  name: string;
  rightSwipes: number;
  leftSwipes: number;
  totalViews: number;
  matchRate: number;
  industry: string;
}

const StartupAnalytics: React.FC = () => {
  const [startups, setStartups] = useState<StartupAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStartupAnalytics();
  }, []);

  const loadStartupAnalytics = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');

      if (!token || !userId) {
        throw new Error('Authentication required');
      }

      // Fetch user's startups
      const response = await fetch(`${API_IP}/api/startups`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch startups');
      }

      const data = await response.json();
      const userStartups = data.startups || [];

      // For each startup, fetch its analytics from the backend
      const startupsWithAnalytics = await Promise.all(
        userStartups.map(async (startup: any) => {
          // Fetch analytics from backend
          const analyticsRes = await fetch(`${API_IP}/api/startup-interactions/${startup.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          let analytics = { left_swipes: 0, right_swipes: 0, views: 0 };
          if (analyticsRes.ok) {
            analytics = await analyticsRes.json();
          }

          // Calculate match rate
          const totalViews = analytics.views || 0;
          const rightSwipes = analytics.right_swipes || 0;
          const matchRate = totalViews > 0 ? (rightSwipes / totalViews) * 100 : 0;

          return {
            id: startup.id,
            name: startup.name,
            rightSwipes: rightSwipes,
            leftSwipes: analytics.left_swipes || 0,
            totalViews: totalViews,
            matchRate,
            industry: startup.industry,
          };
        })
      );

      setStartups(startupsWithAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StartupCard = ({ startup }: { startup: StartupAnalytics }) => (
    <View style={styles.startupCard}>
      <View style={styles.startupHeader}>
        <Text style={styles.startupName}>{startup.name}</Text>
        <Text style={styles.industry}>{startup.industry}</Text>
      </View>
      
      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <MaterialIcons name="thumb-up" size={24} color="#4CAF50" />
          <Text style={styles.metricValue}>{startup.rightSwipes}</Text>
          <Text style={styles.metricLabel}>Right Swipes</Text>
        </View>
        
        <View style={styles.metricItem}>
          <MaterialIcons name="thumb-down" size={24} color="#FF4444" />
          <Text style={styles.metricValue}>{startup.leftSwipes}</Text>
          <Text style={styles.metricLabel}>Left Swipes</Text>
        </View>
        
        <View style={styles.metricItem}>
          <MaterialIcons name="visibility" size={24} color="#1E90FF" />
          <Text style={styles.metricValue}>{startup.totalViews}</Text>
          <Text style={styles.metricLabel}>Total Views</Text>
        </View>
        
        <View style={styles.metricItem}>
          <MaterialIcons name="trending-up" size={24} color="#FF9800" />
          <Text style={styles.metricValue}>{startup.matchRate.toFixed(1)}%</Text>
          <Text style={styles.metricLabel}>Match Rate</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Startup Analytics</Text>
      <Text style={styles.subtitle}>Performance metrics for your startups</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <MaterialIcons name="hourglass-empty" size={40} color="#4CAF50" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      ) : startups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="analytics" size={40} color="#666" />
          <Text style={styles.emptyText}>No analytics available yet</Text>
          <Text style={styles.emptySubtext}>Add startups to see their performance metrics</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {startups.map((startup) => (
            <StartupCard key={startup.id} startup={startup} />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    padding: 20,
  },
  title: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#B2B2B2',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  startupCard: {
    backgroundColor: '#3A3A3A',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  startupHeader: {
    marginBottom: 15,
  },
  startupName: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  industry: {
    fontSize: 14,
    color: '#B2B2B2',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
    marginVertical: 5,
  },
  metricLabel: {
    fontSize: 12,
    color: '#B2B2B2',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 10,
  },
  emptySubtext: {
    color: '#B2B2B2',
    fontSize: 14,
    marginTop: 5,
  },
});

export default StartupAnalytics;