import { View, Text, TouchableOpacity } from "react-native";
import { sharedStyles } from '../../constants/styles';
import { COLORS } from '../../constants/theme';

export default function StartupDashboard() {
  return (
    <View style={sharedStyles.container}>
      <Text style={sharedStyles.title}>Startup Dashboard</Text>
      <Text style={sharedStyles.description}>Welcome, Startup! Here you can manage your profile and connect with investors.</Text>
      <TouchableOpacity 
        style={sharedStyles.navButton} 
        onPress={() => { /* Placeholder for button action */ }}
      >
        <Text style={sharedStyles.buttonText}>Match with Startups</Text>
      </TouchableOpacity>
    </View>
  );
}
