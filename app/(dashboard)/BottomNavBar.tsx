import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface BottomNavBarProps {
  selected: 'home' | 'saved' | 'rejected' | 'profile';
}

export default function BottomNavBar({ selected }: BottomNavBarProps) {
  const router = useRouter();

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(dashboard)/InvestorDashboard')}>
        <Ionicons name="home" size={28} color={selected === 'home' ? '#1E90FF' : '#888'} />
        <Text style={[styles.navText, selected === 'home' && styles.navTextSelected]}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(dashboard)/SavedStartups')}>
        <FontAwesome name="heart" size={28} color={selected === 'saved' ? '#1E90FF' : '#888'} />
        <Text style={[styles.navText, selected === 'saved' && styles.navTextSelected]}>Saved</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(dashboard)/RejectedStartups')}>
        <Ionicons name="close-circle" size={28} color={selected === 'rejected' ? '#1E90FF' : '#888'} />
        <Text style={[styles.navText, selected === 'rejected' && styles.navTextSelected]}>Rejected</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(dashboard)/ProfileSetting')}>
        <MaterialIcons name="person" size={28} color={selected === 'profile' ? '#1E90FF' : '#888'} />
        <Text style={[styles.navText, selected === 'profile' && styles.navTextSelected]}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1E1E1E',
    paddingVertical: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  navTextSelected: {
    color: '#1E90FF',
    fontWeight: '600',
  },
});
