// components/SignIn.jsx

import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSession } from "../../utils/AuthContext";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import { Appbar } from 'react-native-paper';
import { authenticate } from '../../services/authService';
import { login, updateUserDetails } from '../../features/authentication/auth.slice';
import { useDispatch } from 'react-redux';

export default function Login() {
    const { signIn, user, isLoading } = useSession();
    const router = useRouter();
    const dispatch = useDispatch();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const saveLogin = async value => {
        dispatch(login(value));
      };
    
      // Save user details
      const saveUserDetails = async data => {
        dispatch(updateUserDetails(data));
      };

    const handleSignIn = async data => {    
        let payload = {
          username: email,
          password: password,
        };
        console.log('PAYY', payload);
    
        try {
          const response = await authenticate(payload);
          console.log('RESSS', response);
          if (response.access_token) {
            saveUserDetails(response);
            saveLogin(true);
          }
          if (response.connectionError) {
            console.log(
              'Server not reachable. Please check your connection to the server.',
            );
            // setShowAlert(true);
          } else {
            console.log(response.description);
            // setShowAlert(true);
          }
        } catch (err) {
          console.log('Login failed');
        //   setShowAlert(true);
        } finally {
          // setLoading(false);
        //   setLoader(false);
        }
      };

    // const handleSignIn = async () => {
    //     setIsSubmitting(true);
    //     let db = "kyc_db" // specify database

    //     const loginData = {
    //         username: email,
    //         password,
    //         db,
    //     };

        
    //     const success = await signIn(loginData);
    //     setIsSubmitting(false);
    
    //     if (success) {
    //         // Navigate to home on successful sign-in
    //         router.replace('/(app)');
    //     } else {
    //         // Handle failure case
    //         console.log.console.log('Sign-In Failed', 'Please check your email and password.');
    //     }
    //     // Note: If signIn fails, error handling is managed within AuthContext
    // };
    

    const handleTestSignIn = async () => {
        setIsSubmitting(true);
        const success = await signIn('testuser@example.com', 'password'); // Use mock credentials
        setIsSubmitting(false);
        if (success) {
            router.replace('/home'); // Navigate to home on successful sign-in
        }
    };

    const navigateToRegister = () => {
        router.push('/register'); // Navigate to the register screen
    };

    // While checking authentication status
    // if (isLoading) {
    //     return (
    //         <ThemedView style={styles.container}>
    //             <Appbar.Header style={styles.appBar}>
    //                 <Appbar.Content title="Welcome Back!" subtitle="Sign in to continue" />
    //             </Appbar.Header>
    //             <View style={styles.loadingContainer}>
    //                 <ActivityIndicator size="large" color="#007bff" />
    //             </View>
    //         </ThemedView>
    //     );
    // }

    return (
        <ThemedView style={styles.container}>
            {/* AppBar for consistent header */}
            <Appbar.Header style={styles.appBar}>
                <Appbar.Content title="Welcome Back!" subtitle="Sign in to continue" />
            </Appbar.Header>

            <View style={styles.form}>
                <ThemedText type='title' style={styles.title}>Agent Sign In</ThemedText>

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

                <TouchableOpacity style={styles.signInButton} onPress={handleSignIn} disabled={isSubmitting}>
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <ThemedText type='title' style={styles.signInButtonText}>Sign In</ThemedText>
                    )}
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    appBar: {
        backgroundColor: '#f58f21',
    },
    form: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    input: {
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 8,
        marginBottom: 16,
        fontSize: 16,
        borderColor: '#ddd',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2, // Android shadow
    },
    signInButton: {
        backgroundColor: '#f58f21',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    signInButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    testSignInButton: {
        backgroundColor: '#28a745',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    testSignInButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    registerLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
