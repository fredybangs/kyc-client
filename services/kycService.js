// services/kycService.js

import axios from 'axios';
import { getToken } from './authService';
import { Alert } from 'react-native';

const API_BASE_URL = 'https://your-backend.com/api'; // Replace with your backend URL

/**
 * Fetches all KYC applications for the authenticated user.
 * @param {number} userId
 * @returns {array|null} List of KYC applications or null if failed
 */
export const fetchKYCApplications = async (userId) => {
    try {
        const token = await getToken();
        const response = await axios.get(`${API_BASE_URL}/kyc`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: { userId }, // Adjust based on your backend requirements
        });
        return response.data.applications;
    } catch (error) {
        console.error('Fetch KYC Applications Error:', error.response?.data || error.message);
        Alert.alert('Error', 'Failed to fetch KYC Applications.');
        return null;
    }
};

/**
 * Fetches a specific KYC application by ID.
 * @param {number} applicationId
 * @param {number} userId
 * @returns {object|null} KYC application data or null if not found
 */
export const fetchKYCApplicationById = async (applicationId, userId) => {
    try {
        const token = await getToken();
        const response = await axios.get(`${API_BASE_URL}/kyc/${applicationId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: { userId },
        });
        return response.data.application;
    } catch (error) {
        console.error('Fetch KYC Application Detail Error:', error.response?.data || error.message);
        Alert.alert('Error', 'Failed to fetch KYC Application details.');
        return null;
    }
};

/**
 * Creates a new KYC application.
 * @param {object} applicationData
 * @returns {object|null} Created KYC application data or null if failed
 */
export const createKYCApplication = async (applicationData) => {
    try {
        const token = await getToken();
        const response = await axios.post(`${API_BASE_URL}/kyc`, applicationData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data.application;
    } catch (error) {
        console.error('Create KYC Application Error:', error.response?.data || error.message);
        Alert.alert('Error', 'Failed to create KYC Application.');
        return null;
    }
};

/**
 * Updates an existing KYC application.
 * @param {number} applicationId
 * @param {object} updatedData
 * @returns {object|null} Updated KYC application data or null if failed
 */
export const updateKYCApplication = async (applicationId, updatedData) => {
    try {
        const token = await getToken();
        const response = await axios.put(`${API_BASE_URL}/kyc/${applicationId}`, updatedData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data.application;
    } catch (error) {
        console.error('Update KYC Application Error:', error.response?.data || error.message);
        Alert.alert('Error', 'Failed to update KYC Application.');
        return null;
    }
};

/**
 * Deletes a KYC application.
 * @param {number} applicationId
 * @returns {boolean} True if deleted successfully, false otherwise
 */
export const deleteKYCApplication = async (applicationId) => {
    try {
        const token = await getToken();
        await axios.delete(`${API_BASE_URL}/kyc/${applicationId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return true;
    } catch (error) {
        console.error('Delete KYC Application Error:', error.response?.data || error.message);
        Alert.alert('Error', 'Failed to delete KYC Application.');
        return false;
    }
};
