import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import API_IP from '../../constants/apiConfig';

// Types
interface Startup {
  id: string;
  name: string;
  description: string;
  contactLink: string;
  email?: string;
  userId: string;
}

interface UserDetails {
  name: string;
  email: string;
}

export default function SavedStartups() {
  const [savedStartups, setSavedStartups] = useState<Startup[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [loadingStartupId, setLoadingStartupId] = useState<string | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchSavedStartups = async () => {
      const saved = await AsyncStorage.getItem('savedStartups');
      setSavedStartups(saved ? JSON.parse(saved) : []);
    };
    fetchSavedStartups();
  }, []);

  const handleRemoveStartup = async (startupId: string) => {
    const saved = await AsyncStorage.getItem('savedStartups');
    const updated = saved ? JSON.parse(saved).filter((s: Startup) => s.id !== startupId) : [];
    await AsyncStorage.setItem('savedStartups', JSON.stringify(updated));
    setSavedStartups(updated);
    Alert.alert('Removed', 'Startup has been removed from your saved list!');
  };

  const handleContact = async (startup: Startup) => {
    try {
      setLoadingStartupId(startup.id);
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
    }
  };

  const renderItem = ({ item }: { item: Startup }) => (
    <View style={styles.startupCard}>
      <View style={styles.startupInfo}>
        <Text style={styles.startupName}>{item.name}</Text>
        <Text style={styles.startupDescription}>{item.description}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.contactButton,
            loadingStartupId === item.id && styles.disabledButton,
          ]}
          onPress={() => handleContact(item)}
          disabled={loadingStartupId === item.id}
        >
          <View style={styles.buttonContent}>
            {loadingStartupId === item.id ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.contactButtonText}>Contact</Text>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveStartup(item.id)}
          disabled={loadingStartupId === item.id}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.removeButtonText}>Remove</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Saved Startups</Text>
      </View>

      {savedStartups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.noStartupsText}>No saved startups found</Text>
        </View>
      ) : (
        <FlatList
          data={savedStartups}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  startupCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    marginHorizontal: 20,
  },
  startupInfo: { marginBottom: 15 },
  startupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  startupDescription: {
    fontSize: 14,
    color: '#AAAAAA',
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  contactButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    backgroundColor: '#FF4D4D',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
    backgroundColor: '#444',
    borderRadius: 50,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 100,
    marginLeft: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noStartupsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
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