import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function InvestorDataCollection() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Investor Information</Text>
      <Link href="/roleSelection" asChild>
        <Text style={styles.backLink}>← Back</Text>
      </Link>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Investor Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Investment Interests</Text>
        <TextInput
          style={styles.input}
          placeholder="What industries are you interested in?"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Investment Amount</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your investment range"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Brief Bio</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Tell us about yourself (max 200 chars)"
          placeholderTextColor="#666"
          multiline
          maxLength={200}
        />

        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#121212'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 48
  },
  backLink: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16
  },
  formContainer: {
    marginTop: 32
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
    marginTop: 16
  },
  input: {
    backgroundColor: '#1E1E1E',
    color: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    fontSize: 16
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top'
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600'
  }
});
