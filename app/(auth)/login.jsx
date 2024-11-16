import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    return emailPattern.test(email);
  };

  const validatePhoneNumber = (phone) => {
    const phonePattern = /^232(31|32|34)\d{6}$/;
    return phonePattern.test(phone);
  };

  const saveLogin = async (value) => {
    dispatch(login(value));
  };

  const saveUserDetails = async (data) => {
    dispatch(updateUserDetails(data));
  };

  const validateInput = () => {
    if (validateEmail(emailOrPhone)) {
      return 'email';
    } else if (validatePhoneNumber(emailOrPhone)) {
      return 'phone';
    } else {
      Alert.alert(
        'Invalid Input',
        'Please enter a valid email address or phone number in the format 232XXXXXXXX and a Qcell number.'
      );
      return null;
    }
  };

  const handleSignIn = async () => {
    const inputType = validateInput();

    if (!inputType) {
      return;
    }

    setIsSubmitting(true);
    const payload = {
      username: emailOrPhone,
      password: password,
    };

    try {
      const response = await authenticate(payload);
      console.log("RESSS", response)
      if (response.access_token) {
        saveUserDetails(response);
        saveLogin(true);
        router.replace('/home');
      } else if (response.connectionError) {
        Alert.alert(
          'Connection Error',
          'Server not reachable. Please check your connection.'
        );
      } else {
        Alert.alert('Sign In Failed', response.message || 'Unknown error occurred.');
      }
    } catch (err) {
      Alert.alert('Login Error', 'Login failed. Please try again.');
      console.error('Login failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToRegister = () => {
    router.push('/register');
  };

  return (
    <ThemedView style={styles.container}>
      <Appbar.Header style={styles.appBar}>
        <Appbar.Content title="Welcome Back!" />
      </Appbar.Header>

      <View style={styles.form}>
        <ThemedText style={styles.title}>Client Sign In</ThemedText>

        <TextInput
          style={styles.input}
          placeholder="Email or Phone Number"
          value={emailOrPhone}
          onChangeText={setEmailOrPhone}
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

        <TouchableOpacity onPress={navigateToRegister} style={styles.registerLink}>
          <ThemedText style={styles.registerText}>
            Don't have an account? Register here
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const primaryColor = '#F58F21';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBar: {
    backgroundColor: primaryColor,
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
  },
  input: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    borderColor: '#DDDDDD',
    borderWidth: 1,
    color: '#DDDDDD',
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
