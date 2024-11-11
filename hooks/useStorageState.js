// hooks/useStorageState.js

import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

/**
 * Custom hook to manage state synchronized with SecureStore.
 * @param {string} key - The key under which the data is stored.
 * @param {any} initialValue - The initial value to use if no data is found.
 * @returns {[ [boolean, any], Function ]} - Returns a tuple containing [isLoading, data] and a setter function.
 */
export function useStorageState(key, initialValue = null) {
    const [state, setState] = useState({
        isLoading: true,
        data: initialValue,
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const storedData = await SecureStore.getItemAsync(key);
                if (storedData !== null) {
                    // Attempt to parse JSON, fallback to string if parsing fails
                    try {
                        const parsedData = JSON.parse(storedData);
                        setState({ isLoading: false, data: parsedData });
                    } catch (e) {
                        setState({ isLoading: false, data: storedData });
                    }
                } else {
                    setState({ isLoading: false, data: initialValue });
                }
            } catch (error) {
                console.error(`Error loading data for key "${key}":`, error);
                setState({ isLoading: false, data: initialValue });
            }
        };

        loadData();
    }, [key, initialValue]);

    /**
     * Sets the data both in state and SecureStore.
     * @param {any} newData - The new data to store.
     */
    const setStoredData = async (newData) => {
        try {
            if (newData === null) {
                await SecureStore.deleteItemAsync(key);
                setState({ isLoading: false, data: null });
            } else {
                // If newData is an object, stringify it
                const dataToStore =
                    typeof newData === 'string' ? newData : JSON.stringify(newData);
                await SecureStore.setItemAsync(key, dataToStore);
                setState({ isLoading: false, data: newData });
            }
        } catch (error) {
            console.error(`Error setting data for key "${key}":`, error);
            Alert.alert('Error', 'Failed to update data.');
        }
    };

    return [[state.isLoading, state.data], setStoredData];
}
