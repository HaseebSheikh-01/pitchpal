import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import API_IP from '../constants/apiConfig';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_IP}/auth/verify-email-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json();
      console.log('Verification response:', data);
      if (response.ok && data.message === "Email verified successfully") {
        if (Platform.OS === 'web') {
          window.alert('Code is correct! Your email has been verified! You can now log in.');
          setTimeout(() => {
            console.log('Navigating to login');
            router.replace('/login');
          }, 100);
        } else {
          Alert.alert('Code is correct!', 'Your email has been verified! You can now log in.', [
            { text: 'OK', onPress: () => {
              console.log('Navigating to login');
              router.replace('/login');
            }}
          ]);
        }
      } else {
        const errorMsg = data && data.message ? data.message : 'The code you entered is incorrect. Please try again.';
        if (Platform.OS === 'web') {
          window.alert(errorMsg);
        } else {
          Alert.alert('Code is incorrect', errorMsg);
        }
      }
    } catch (err) {
      if (Platform.OS === 'web') {
        window.alert('Verification failed. Try again.');
      } else {
        Alert.alert('Error', 'Verification failed. Try again.');
      }
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await fetch(`${API_IP}/auth/send-verification-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (Platform.OS === 'web') {
        window.alert('A new code has been sent to your email.');
      } else {
        Alert.alert('Code Sent', 'A new code has been sent to your email.');
      }
    } catch (err) {
      if (Platform.OS === 'web') {
        window.alert('Failed to resend code.');
      } else {
        Alert.alert('Error', 'Failed to resend code.');
      }
    }
    setResending(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.subtitle}>Enter the code sent to your email to verify your account.</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter code"
        keyboardType="numeric"
        value={code}
        onChangeText={setCode}
        maxLength={6}
      />
      <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading || code.length !== 6}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.resendButton} onPress={handleResend} disabled={resending}>
        <Text style={styles.resendText}>{resending ? 'Resending...' : 'Resend Code'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', padding: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 12 },
  subtitle: { color: '#aaa', marginBottom: 24, textAlign: 'center' },
  input: { backgroundColor: '#222', color: '#fff', borderRadius: 8, padding: 12, fontSize: 20, width: '80%', textAlign: 'center', marginBottom: 20 },
  button: { backgroundColor: '#4CAF50', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 8, marginBottom: 16 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  resendButton: { marginTop: 8 },
  resendText: { color: '#4CAF50', fontWeight: '600' },
});