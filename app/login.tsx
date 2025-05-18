import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Link, router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_IP from '../constants/apiConfig';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const isFormValid = () => {
    return validateEmail(email) && password.length >= 8;
  };

  const handleSubmit = async () => {
    let valid = true;
    const newErrors = { email: '', password: '' };

    if (!email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
      valid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      valid = false;
    }

    setErrors(newErrors);

    if (valid && isFormValid()) {
      setLoading(true);
      try {
        const response = await fetch(`${API_IP}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
          Alert.alert("Login failed", data.message || "Invalid credentials");
        } else {
          Alert.alert("Login success", `Welcome ${data.user.name}`);

          // Save the token in AsyncStorage for future API calls
          await AsyncStorage.setItem('token', data.token);
          await AsyncStorage.setItem('userId', data.user.id.toString());  // Optionally save the user ID as string

          // Redirect based on user role after successful login
          if (data.user.role === null) {
            router.replace('/roleSelection');
          } else if (data.user.role === 'investor') {
            try {
              const userId = data.user.id.toString();
              const investorResponse = await fetch(`${API_IP}/api/investors/${userId}`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${data.token}`,
                  'Content-Type': 'application/json'
                }
              });
              if (investorResponse.ok) {
                router.replace('/(dashboard)/InvestorDashboard');
              } else {
                router.replace('/ProfileSetting');
              }
            } catch (error) {
              console.error("Investor check error:", error);
              router.replace('/ProfileSetting');
            }
          } else if (data.user.role === 'startup') {
            router.replace('/(dashboard)/StartupDashboard');
          } else {
            // Default fallback
            router.replace('/roleSelection');
          }
        }
      } catch (error) {
        console.error("Login error:", error);
        Alert.alert("Error", "Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Link href="/" asChild>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </Link>

      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>
      
      <View style={styles.formContainer}>
        <TextInput
          style={[styles.input, errors.email && styles.errorInput]}
          placeholder="Email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

        <TextInput
          style={[styles.input, errors.password && styles.errorInput]}
          placeholder="Password (min 8 characters)"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <Link href="/signup" asChild>
          <TouchableOpacity>
            <Text style={styles.signupText}>Sign Up</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#121212',
    justifyContent: 'space-between'
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 48
  },
  subtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    marginTop: 8
  },
  formContainer: {
    marginTop: 32
  },
  input: {
    height: 56,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    color: '#FFFFFF',
    fontSize: 16
  },
  button: {
    height: 56,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600'
  },
  backButton: {
    position: 'absolute',
    top: 32,
    left: 24,
    padding: 8
  },
  backButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32
  },
  footerText: {
    color: '#AAAAAA',
    fontSize: 14
  },
  signupText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4
  },
  errorInput: {
    borderColor: '#FF5252',
    borderWidth: 1
  },
  errorText: {
    color: '#FF5252',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 8
  }
});