import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Link } from "expo-router";
//import type { RootStackParamList } from "../types/navigation";


export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/images/logo.jpg')} 
        style={styles.logo}
      />
      <Text style={styles.title}>Welcome to PitchPal</Text>
      <Text style={styles.subtitle}>Your perfect matching companion</Text>
      
      <Link href="/login" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000000'
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
    borderRadius: 20,
    overflow: 'hidden'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#ffffff'
  },
  subtitle: {
    fontSize: 16,
    color: '#aaaaaa',
    marginBottom: 40
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600'
  }
});
