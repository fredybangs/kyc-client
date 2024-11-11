// components/SignIn.jsx

import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSession } from '../../utils/AuthContext';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { Appbar } from 'react-native-paper';
import { authenticate } from '../../services/authService';
import { login, updateUserDetails } from '../../features/authentication/auth.slice';
import { useDispatch } from 'react-redux';

export default function Login() {
  const { signIn } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveLogin = async (value) => {
    dispatch(login(value));
  };

  const saveUserDetails = async (data) => {
    dispatch(updateUserDetails(data));
  };

  const handleSignIn = async () => {
    setIsSubmitting(true);
    const payload = {
      username: email,
      password: password,
    };

    try {
      const response = await authenticate(payload);
      if (response.access_token) {
        saveUserDetails(response);
        saveLogin(true);
        router.replace('/home'); // Navigate to home on successful sign-in
      } else if (response.connectionError) {
        console.log('Server not reachable. Please check your connection.');
      } else {
        console.log(response.description);
      }
    } catch (err) {
      console.log('Login failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToRegister = () => {
    router.push('/register');
  };

  return (
    <ThemedView style={styles.container}>
      {/* AppBar for consistent header */}
      <Appbar.Header style={styles.appBar}>
        <Appbar.Content title="Welcome Back!" subtitle="Sign in to continue" />
      </Appbar.Header>

      <View style={styles.form}>
        <ThemedText style={styles.title}>Sign In</ThemedText>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          placeholderTextColor="#aaa"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="password"
          placeholderTextColor="#aaa"
        />

        <TouchableOpacity
          style={styles.signInButton}
          onPress={handleSignIn}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.signInButtonText}>Sign In</ThemedText>
          )}
        </TouchableOpacity>

        {/* Link to the Register screen */}
        <TouchableOpacity onPress={navigateToRegister} style={styles.registerLink}>
          <ThemedText style={styles.registerText}>
            Don't have an account? Register here
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const primaryColor = '#F58F21'; // Your primary color

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background for a clean look
  },
  appBar: {
    backgroundColor: primaryColor, // Use primary color for header
  },
  form: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333333', // Dark text color for contrast
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    borderColor: '#DDDDDD',
    borderWidth: 1,
    color: '#333333',
  },
  signInButton: {
    backgroundColor: primaryColor,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    color: primaryColor,
    fontSize: 16,
  },
});

