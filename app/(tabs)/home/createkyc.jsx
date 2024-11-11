// screens/CreateApplicationScreen.jsx

import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Appbar } from 'react-native-paper';
import { ThemedView } from '../../../components/ThemedView';
import { ThemedText } from '../../../components/ThemedText';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import apiConfig from '../../../services/api/config';



export default function CreateApplicationScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Access the accessToken from Redux store
  const accessToken = useSelector((state) => state.user.userDetails.access_token);

  // State variables for form fields
  const [name, setName] = useState('');
  const [login, setLogin] = useState('');
  const [phone, setPhone] = useState('');
  const [idType, setIdType] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [idExpiryDate, setIdExpiryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentAddress, setCurrentAddress] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [idDocument, setIdDocument] = useState(null);
  const [proofOfAddress, setProofOfAddress] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to validate the form
  const validateForm = () => {
    if (!name || !login || !idType || !idNumber) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return false;
    }
    if (!idDocument || !proofOfAddress || !selfie) {
      Alert.alert('Error', 'Please upload all required images.');
      return false;
    }
    return true;
  };

  // Function to handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    let idDocumentUrl, proofOfAddressUrl, selfieUrl;

    try {
      idDocumentUrl = await uploadToImgbb(idDocument.uri);
      proofOfAddressUrl = await uploadToImgbb(proofOfAddress.uri);
      selfieUrl = await uploadToImgbb(selfie.uri);
    } catch (error) {
      console.log('Image upload error:', error);
      Alert.alert('Error', 'Failed to upload images.');
      setIsSubmitting(false);
      return;
    }

    // Prepare the data
    const data = {
      name,
      login,
      phone,
      id_type: idType,
      id_number: idNumber,
      id_expiry_date: idExpiryDate.toISOString().split('T')[0],
      id_document_url: idDocumentUrl,
      proof_of_address_url: proofOfAddressUrl,
      selfie_url: selfieUrl,
      current_address: currentAddress,
      permanent_address: permanentAddress,
    };

    try {
        const response = await axios.post(`${apiConfig.url}/api/kyc/create`, data,{
            headers: {
                'Content-Type': 'text/html',
                'ClientID': '12345',
                'accessToken': accessToken
            }
        });

      if (response.status) {
        Alert.alert('Success', 'KYC Application created successfully.');
        // Navigate back to the home screen or refresh the list
        // navigation.goBack();
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'An error occurred.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while creating the application.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to pick images
  const pickImage = async (setter) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Permission to access camera roll is required!');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!pickerResult.cancelled && pickerResult.assets && pickerResult.assets.length > 0) {
      setter(pickerResult.assets[0]);
    }
  };

  // Function to take photos
  const takePhoto = async (setter) => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Permission to access camera is required!');
      return;
    }

    const pickerResult = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!pickerResult.cancelled && pickerResult.assets && pickerResult.assets.length > 0) {
      setter(pickerResult.assets[0]);
    }
  };

  // Function to upload images to ImgBB
  const uploadToImgbb = async (uri) => {
    const IMGBB_API_KEY = 'b03bfa94ee382d828ab3da67e813a97a'; // Replace with your ImgBB API key

    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',').pop());
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const formBody = `key=${encodeURIComponent(IMGBB_API_KEY)}&image=${encodeURIComponent(base64Image)}`;

      const uploadResponse = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: formBody,
      });

      const result = await uploadResponse.json();

      if (result.success) {
        return result.data.url;
      } else {
        throw new Error(result.error.message || 'Image upload failed');
      }
    } catch (error) {
      console.error('ImgBB upload error:', error);
      throw error;
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* App Bar */}
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Create Application" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText style={styles.title}>Create New KYC Application</ThemedText>

        {/* Personal Information */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Personal Information</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Full Name *"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#aaa"
          />
          <TextInput
            style={styles.input}
            placeholder="Email *"
            value={login}
            onChangeText={setLogin}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#aaa"
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholderTextColor="#aaa"
          />
        </View>

        {/* Address Information */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Address Information</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Current Address"
            value={currentAddress}
            onChangeText={setCurrentAddress}
            placeholderTextColor="#aaa"
          />
          <TextInput
            style={styles.input}
            placeholder="Permanent Address"
            value={permanentAddress}
            onChangeText={setPermanentAddress}
            placeholderTextColor="#aaa"
          />
        </View>

        {/* ID Information */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Identification Information</ThemedText>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={idType}
              onValueChange={(itemValue) => setIdType(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select ID Type *" value="" />
              <Picker.Item label="National ID" value="national_id" />
              <Picker.Item label="Passport" value="passport" />
              <Picker.Item label="Driver License" value="driver_license" />
              <Picker.Item label="Voter ID" value="voter_id" />
            </Picker>
          </View>
          <TextInput
            style={styles.input}
            placeholder="ID Number *"
            value={idNumber}
            onChangeText={setIdNumber}
            placeholderTextColor="#aaa"
          />
          {/* Date Picker for ID Expiration Date */}
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <ThemedText style={styles.datePickerButtonText}>
              ID Expiration Date: {idExpiryDate.toLocaleDateString()}
            </ThemedText>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={idExpiryDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setIdExpiryDate(selectedDate);
                }
              }}
            />
          )}
        </View>

        {/* Upload Documents */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Upload Documents</ThemedText>

          {/* ID Document */}
          <View style={styles.documentContainer}>
            <ThemedText style={styles.documentLabel}>ID Document *</ThemedText>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => takePhoto(setIdDocument)}
              >
                <ThemedText style={styles.actionButtonText}>Take Photo</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => pickImage(setIdDocument)}
              >
                <ThemedText style={styles.actionButtonText}>Choose from Library</ThemedText>
              </TouchableOpacity>
            </View>
            {idDocument && (
              <Image source={{ uri: idDocument.uri }} style={styles.imagePreview} />
            )}
          </View>

          {/* Proof of Address */}
          <View style={styles.documentContainer}>
            <ThemedText style={styles.documentLabel}>Proof of Address *</ThemedText>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => takePhoto(setProofOfAddress)}
              >
                <ThemedText style={styles.actionButtonText}>Take Photo</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => pickImage(setProofOfAddress)}
              >
                <ThemedText style={styles.actionButtonText}>Choose from Library</ThemedText>
              </TouchableOpacity>
            </View>
            {proofOfAddress && (
              <Image source={{ uri: proofOfAddress.uri }} style={styles.imagePreview} />
            )}
          </View>

          {/* Selfie */}
          <View style={styles.documentContainer}>
            <ThemedText style={styles.documentLabel}>Selfie *</ThemedText>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => takePhoto(setSelfie)}
              >
                <ThemedText style={styles.actionButtonText}>Take Photo</ThemedText>
              </TouchableOpacity>
            </View>
            {selfie && (
              <Image source={{ uri: selfie.uri }} style={styles.imagePreview} />
            )}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.submitButtonText}>Submit Application</ThemedText>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const primaryColor = '#F58F21';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: primaryColor,
    elevation: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    marginVertical: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  datePickerButton: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  documentContainer: {
    marginBottom: 20,
  },
  documentLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#555',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: primaryColor,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    flex: 0.48,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  submitButton: {
    backgroundColor: primaryColor,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 80,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
