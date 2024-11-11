// utils/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { loginUser, logoutUser, registerUser, getToken } from '../services/authService';

export const AuthContext = createContext({
    user: null,
    isLoading: true,
    signIn: async () => {},
    signOut: async () => {},
    register: async () => {},
});

// Custom hook to access the auth context
export function useSession() {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
}

export function SessionProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Flag to enable testing mode
    const isTesting = false; // Set to true for testing, false for production

    // Mock user data for testing
    const mockUser = {
        id: 'test-user-001',
        name: 'Test User',
        email: 'testuser@example.com',
        role: 'tester', // Adjust roles as per your application's logic
        token: 'mock-token-1234567890abcdef', // Mock token
        // Add other necessary user properties here
    };

    useEffect(() => {
        const initializeAuth = async () => {
            if (isTesting) {
                // Auto-authenticate with mock user
                setUser(mockUser);
                setIsLoading(false);
                return;
            }
    
            try {
                const token = await getToken();
                if (token) {
                    // console.log("TOKEN", token)
                    // If token exists, set a basic user state without validating
                    setUser({ token }); // Optionally add placeholder user data if needed
                } else {
                    // No token found; set user to null
                    setUser(null);
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
    
        initializeAuth();
    }, []);
    

    const signIn = async (loginData) => {
        if (isTesting) {
            // In testing mode, bypass sign-in and set mock user
            setUser(mockUser);
            return true;
        }
    
        try {
            const loggedInUser = await loginUser(loginData);
            if (loggedInUser) {
                // Set the user data as returned by the modified loginUser function
                setUser(loggedInUser);
                return true;
            }
            Alert.alert('Login Failed', 'Invalid email or password.');
            return false;
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Login Failed', 'An error occurred during login.');
            return false;
        }
    };
    
    const signOut = async () => {
        if (isTesting) {
            // In testing mode, simply clear the mock user
            setUser(null);
            return;
        }

        try {
            await logoutUser();
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Logout Failed', 'An error occurred during logout.');
        }
    };

    const register = async (userData) => {
        if (isTesting) {
            // In testing mode, bypass registration and set mock user
            setUser(mockUser);
            Alert.alert('Registration Successful', 'Automatically signed in for testing.');
            return true;
        }
    
        try {
            const registeredUser = await registerUser(userData);
            if (registeredUser && registeredUser.status) {
                Alert.alert('Registration Successful', 'Please log in to continue.');
                return true;
            }
            Alert.alert('Registration Failed', 'User registration was unsuccessful.');
            return false;
        } catch (error) {
            console.error('Registration error:', error);
            Alert.alert('Registration Failed', 'An error occurred during registration.');
            return false;
        }
    };
    
    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signOut, register }}>
            {children}
        </AuthContext.Provider>
    );
}
