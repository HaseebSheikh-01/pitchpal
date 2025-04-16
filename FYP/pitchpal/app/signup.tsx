import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Link, router } from "expo-router";

export default function SignupScreen() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleChange = (name: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async () => {
    let valid = true;
    const newErrors = {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    };

    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
      valid = false;
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
      valid = false;
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      valid = false;
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setErrors(newErrors);

    if (valid) {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: formData.fullName,
            email: formData.email,
            password: formData.password,
            role: "startup" // default role, or you can collect this later
          })
        });

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || "Signup failed.");
        } else {
          alert("Signup successful!");
          router.replace("/login");
        }
      } catch (error) {
        console.error("Signup error:", error);
        alert("An error occurred. Please try again.");
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

      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join us to get started</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={[styles.input, errors.fullName && styles.errorInput]}
          placeholder="Full Name"
          placeholderTextColor="#999"
          value={formData.fullName}
          onChangeText={(text) => handleChange('fullName', text)}
        />
        {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}

        <TextInput
          style={[styles.input, errors.email && styles.errorInput]}
          placeholder="Email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          value={formData.email}
          onChangeText={(text) => handleChange('email', text)}
        />
        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

        <TextInput
          style={[styles.input, errors.password && styles.errorInput]}
          placeholder="Password (min 8 characters)"
          placeholderTextColor="#999"
          secureTextEntry
          value={formData.password}
          onChangeText={(text) => handleChange('password', text)}
        />
        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

        <TextInput
          style={[styles.input, errors.confirmPassword && styles.errorInput]}
          placeholder="Confirm Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={formData.confirmPassword}
          onChangeText={(text) => handleChange('confirmPassword', text)}
        />
        {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? 'Creating...' : 'Create Account'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <Link href="/login" asChild>
          <TouchableOpacity>
            <Text style={styles.signupText}>Sign In</Text>
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
