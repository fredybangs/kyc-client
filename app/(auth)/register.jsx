import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  useColorScheme,
  View,
} from 'react-native';
import { Appbar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import apiConfig from '../../services/api/config';
import { router } from 'expo-router';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';

export default function RegisterScreen() {
  const colorScheme = useColorScheme();

  const isDarkMode = colorScheme === 'dark';

  const styles = makeStyles(isDarkMode);



  // Form States
  const [name, setName] = useState('');
  const [login, setLogin] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState(''); 
  const [idType, setIdType] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [idExpiryDate, setIdExpiryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentAddress, setCurrentAddress] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
    const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Image States
  const [idDocument, setIdDocument] = useState(null);
  const [idDocumentBase64, setIdDocumentBase64] = useState('');
  const [proofOfAddress, setProofOfAddress] = useState(null);
  const [proofOfAddressBase64, setProofOfAddressBase64] = useState('');
  const [selfie, setSelfie] = useState(null);
  const [selfieBase64, setSelfieBase64] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    return emailPattern.test(email);
  };

  const validatePhoneNumber = (phone) => {
    const phonePattern = /^232(31|32|34)\d{6}$/;
    return phonePattern.test(phone);
  };
  
  const validateForm = () => {
    if (!name || !phone || !idType || !idNumber || !userType) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return false;
    }
    if (!idDocument || !proofOfAddress || !selfie) {
      Alert.alert('Error', 'Please upload all required images.');
      return false;
    }

    if(login){
      if (!validateEmail(login)) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
        return false;
      }
    }

    if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match.');
        return false;
    }

    if (!validatePhoneNumber(phone)) {
      Alert.alert(
        'Invalid Phone Number',
        'Phone Number must start with "232" followed by "31", "32", or "34", and then 6 digits.'
      );
      return false;
    }
    return true;
  };
  

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    let idDocumentUrl, proofOfAddressUrl, selfieUrl;

    try {
      idDocumentUrl = await uploadToImgbb(idDocumentBase64);
      proofOfAddressUrl = await uploadToImgbb(proofOfAddressBase64);
      selfieUrl = await uploadToImgbb(selfieBase64);
    } catch (error) {
      Alert.alert('Error', 'Failed to upload images.');
      setIsSubmitting(false);
      return;
    }

    const data = {
      name,
      login,
      phone,
      user_type: userType,
      id_type: idType,
      id_number: idNumber,
      id_expiry_date: idExpiryDate.toISOString().split('T')[0],
      id_proof: idDocumentUrl,
      proof_of_address: proofOfAddressUrl,
      selfie: selfieUrl,
      current_address: currentAddress,
      permanent_address: permanentAddress,
      password,
      confirm_password: confirmPassword,
      device_uid: '',
    };

    try {
      const response = await axios.post(`${apiConfig.url}/api/signup`, data, {
        headers: {
          'Content-Type': 'text/html',
          'clientId': '12345',
        },
      });

      let res = response.data;

      if (res.intent) {
        Alert.alert('Success', 'KYC Application created successfully.', [
            { text: 'OK', onPress: () =>  router.replace('/(auth)login') },
          ]);
      } else {
        Alert.alert('Error', res.message || 'An error occurred.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while creating the application.');
      console.error('Submit Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to pick images
  const pickImage = async (setter, setBase64) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Permission to access camera roll is required!');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!pickerResult.cancelled && pickerResult.assets && pickerResult.assets.length > 0) {
      setter(pickerResult.assets[0]);
      setBase64(pickerResult.assets[0].base64);
    }
  };

  // Function to take photos
  const takePhoto = async (setter, setBase64) => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Permission to access camera is required!');
      return;
    }

    const pickerResult = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true, 
    });

    if (!pickerResult.cancelled && pickerResult.assets && pickerResult.assets.length > 0) {
      setter(pickerResult.assets[0]);
      setBase64(pickerResult.assets[0].base64);
    }
  };

  // Function to upload images to ImgBB using base64 strings
  const uploadToImgbb = async (base64Image) => {
    const IMGBB_API_KEY = 'b03bfa94ee382d828ab3da67e813a97a'; 

    try {
      const formBody = new URLSearchParams({
        key: IMGBB_API_KEY,
        image: base64Image,
      }).toString();

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
        <Appbar.BackAction onPress={() => router.back()}  />
        <Appbar.Content title="Create Application" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Personal Information */}
        <ThemedView style={styles.section}>
          {/* User Type Picker */}
          <ThemedView style={styles.pickerContainer}>
            <Picker
              selectedValue={userType}
              onValueChange={(itemValue) => setUserType(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select User Type" value="" />
              <Picker.Item label="Existing Subscriber" value="existing" />
              <Picker.Item label="New Subscriber" value="new" />
            </Picker>
          </ThemedView>

          <ThemedText style={styles.sectionTitle}>Personal Information</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#aaa"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
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
           <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#aaa"
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholderTextColor="#aaa"
          />
        </ThemedView>

        {/* Address Information */}
        <ThemedView style={styles.section}>
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
        </ThemedView>

        {/* ID Information */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Identification Information</ThemedText>
          <ThemedView style={styles.pickerContainer}>
            <Picker
              selectedValue={idType}
              onValueChange={(itemValue) => setIdType(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select ID Type" value="" />
              <Picker.Item label="National ID" value="national_id" />
              <Picker.Item label="Passport" value="passport" />
              <Picker.Item label="Driver License" value="driver_license" />
              <Picker.Item label="Voter ID" value="voter_id" />
            </Picker>
          </ThemedView>
          <TextInput
            style={styles.input}
            placeholder="ID Number"
            value={idNumber}
            onChangeText={setIdNumber}
            placeholderTextColor="#aaa"
          />
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
              minimumDate={today}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setIdExpiryDate(selectedDate);
                }
              }}
            />
          )}
        </ThemedView>

        {/* Upload Documents */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Upload Documents</ThemedText>

          {/* ID Document */}
          <ThemedView style={styles.documentContainer}>
            <ThemedText style={styles.documentLabel}>ID Document</ThemedText>
            <ThemedView style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => takePhoto(setIdDocument, setIdDocumentBase64)}
              >
                <ThemedText style={styles.actionButtonText}>Take Photo</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => pickImage(setIdDocument, setIdDocumentBase64)}
              >
                <ThemedText style={styles.actionButtonText}>Choose from Library</ThemedText>
              </TouchableOpacity>
            </ThemedView>
            {idDocument && (
              <Image source={{ uri: idDocument.uri }} style={styles.imagePreview} />
            )}
          </ThemedView>

          {/* Proof of Address */}
          <ThemedView style={styles.documentContainer}>
            <ThemedText style={styles.documentLabel}>Proof of Address</ThemedText>
            <ThemedView style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => takePhoto(setProofOfAddress, setProofOfAddressBase64)}
              >
                <ThemedText style={styles.actionButtonText}>Take Photo</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => pickImage(setProofOfAddress, setProofOfAddressBase64)}
              >
                <ThemedText style={styles.actionButtonText}>Choose from Library</ThemedText>
              </TouchableOpacity>
            </ThemedView>
            {proofOfAddress && (
              <Image source={{ uri: proofOfAddress.uri }} style={styles.imagePreview} />
            )}
          </ThemedView>

          {/* User Image */}
          <ThemedView style={styles.documentContainer}>
            <ThemedText style={styles.documentLabel}>User Photo</ThemedText>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => takePhoto(setSelfie, setSelfieBase64)}
              >
                <ThemedText style={styles.actionButtonText}>Take Photo</ThemedText>
              </TouchableOpacity>
            {selfie && (
              <Image source={{ uri: selfie.uri }} style={styles.imagePreview} />
            )}
          </ThemedView>
        </ThemedView>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
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

         
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const primaryColor = '#F58F21';

const makeStyles = (isDarkMode) =>
  StyleSheet.create({
    container: {
      flex: 1,
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
      marginTop: 20,
    },
    section: {
      marginBottom: 25,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 15,
    },
    input: {
      height: 50,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 15,
      marginBottom: 15,
      fontSize: 16,
      borderColor: '#ddd',
      color: isDarkMode ? '#FFFFFF' : '#000000',
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      overflow: 'hidden',
      marginBottom: 15,
    },
    picker: {
      height: 50,
      width: '100%',
      color: isDarkMode ? '#FFFFFF' : '#000000',
    },
    datePickerButton: {
      height: 50,
      borderColor: '#ddd',
      borderWidth: 1,
      borderRadius: 8,
      justifyContent: 'center',
      paddingHorizontal: 15,
      marginBottom: 15,
    },
    datePickerButtonText: {
      fontSize: 16,
      color: isDarkMode ? '#FFFFFF' : '#000000',
    },
    documentContainer: {
      marginBottom: 20,
    },
    documentLabel: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 10,
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
      marginBottom: 10,
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
    buttonContainer: {
      justifyContent: 'space-between',
      marginTop: 20,
      marginBottom: 80,
    },
    submitButton: {
      backgroundColor: 'green',
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: 'center',
      flex: 0.48,
      
    },
    submitButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    saveOfflineButton: {
      backgroundColor: '#6c757d',
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: 'center',
      flex: 0.48,
    },
    saveOfflineButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });
