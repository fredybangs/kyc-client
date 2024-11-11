// components/RegisterScreen.jsx

import React, { useState, useContext } from 'react';
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
import { useRouter } from 'expo-router';
import { AuthContext } from '../../utils/AuthContext';
import { Picker } from '@react-native-picker/picker';
import { Appbar } from 'react-native-paper';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { signup } from '../../services/authService';
import apiConfig from '../../services/api/config';
import axios  from 'axios';


export default function RegisterScreen() {
    const { register } = useContext(AuthContext);
    const router = useRouter();
    const IMGBB_API_KEY = 'b03bfa94ee382d828ab3da67e813a97a';


    // State variables
    const [userType, setUserType] = useState(''); // 'existing', 'new', or 'prospective'
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [address, setAddress] = useState('');
    const [customerId, setCustomerId] = useState(''); // For existing subscribers only
    const [idNumber, setIdNumber] = useState('');
    const [idType, setIdType] = useState('')
    const [idExpiration, setIdExpiration] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [idProof, setIdProof] = useState(null); // Asset object for ID Proof image
    const [proofOfAddress, setProofOfAddress] = useState(null); // Asset object for Proof of Address image
    const [selfie, setSelfie] = useState(null); // Asset object for Selfie image
    const [isSubmitting, setIsSubmitting] = useState(false);

    const imgbbkey = '302bd08d9cd9242a903903b3ca073ce5'

    /**
     * Validates the registration form based on user type.
     * @returns {boolean} True if valid, false otherwise.
     */
    const validateForm = () => {
        if (!name || !email || !password || !confirmPassword || !userType) {
            Alert.alert('Error', 'Please fill in all required fields.');
            return false;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return false;
        }
        if (userType !== 'prospective' && (!phone || phone.length < 10)) {
            Alert.alert('Error', 'Phone number must be at least 10 digits.');
            return false;
        }
        if (
            (userType === 'existing' && !customerId) ||
            ((userType === 'new' || userType === 'prospective') &&
                (!address || !idNumber || !idProof || (userType !== 'prospective' && !proofOfAddress)))
        ) {
            Alert.alert('Error', 'Please complete all required fields for your user type.');
            return false;
        }
        if (!selfie) {
            Alert.alert('Error', 'Please upload a selfie.');
            return false;
        }
        return true;
    };

    /**
     * Handles the registration process.
     */
    const handleRegister = async () => {
        if (!validateForm()) {
            return;
        }

        // setIsSubmitting(true);
        let idProofUrl, proofOfAddressUrl, selfieUrl;

        try {
            if (idProof) idProofUrl = await uploadToImgbb(idProof.uri);
            if (proofOfAddress) proofOfAddressUrl = await uploadToImgbb(proofOfAddress.uri);
            if (selfie) selfieUrl = await uploadToImgbb(selfie.uri);
        } catch (error) {
            console.log('Image upload error:', error);
            Alert.alert('Error', 'Failed to upload images.');
            setIsSubmitting(false);
            return;
        }

        // Prepare the registration data
        const registrationData = {
            name,
            email,
            phone: userType !== 'prospective' ? phone : undefined,
            password,
            confirm_password: confirmPassword,
            id_type: idType,
            user_type: userType,
            address: userType === 'new' || userType === 'prospective' ? address : undefined,
            customer_id: userType === 'existing' ? customerId : undefined,
            id_number: userType === 'new' || userType === 'prospective' ? idNumber : undefined,
            id_expiration: userType === 'new' || userType === 'prospective' ? idExpiration.toISOString().split('T')[0] : undefined,
            id_proof: idProofUrl,
            proof_of_address: proofOfAddressUrl,
            selfie: selfieUrl,
            device_uid: '',
        };
        // console.log("user", registrationData.id_proof)
        try {
            const response = await axios.post(`${apiConfig.url}/api/signup`, registrationData,{
                headers: {
                    'Content-Type': 'text/html',
                    'ClientID': '12345',
                }
            });
            console.log('RESSS', response);
            if (response.status) {
                router.replace('/(auth)login')
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
            console.log('Login failed',err);
          //   setShowAlert(true);
          } finally {
            // setLoading(false);
          //   setLoader(false);
          }

    };

    /**
     * Launches the image picker to select an image.
     * @param {function} setter - Function to set the selected image asset.
     * @param {string} type - Type of image ('idProof', 'proofOfAddress', 'selfie').
     */
    const pickImage = async (setter, type = 'image') => {
        let mediaTypes = ImagePicker.MediaTypeOptions.Images;

        const permissionResult =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert(
                'Permission Denied',
                'Permission to access camera roll is required!'
            );
            return;
        }

        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: mediaTypes,
            allowsEditing: true,
            aspect: type === 'selfie' ? [1, 1] : undefined, // Square aspect for selfies
            quality: 0.5,
            base64: false, // We'll handle conversion separately
        });

        if (!pickerResult.cancelled && pickerResult.assets && pickerResult.assets.length > 0) {
            setter(pickerResult.assets[0]); // Set the first asset
        }
    };

    /**
     * Launches the camera to take a photo.
     * @param {function} setter - Function to set the captured image asset.
     * @param {string} type - Type of image ('selfie').
     */
    const takePhoto = async (setter, type = 'selfie') => {
        let mediaTypes = ImagePicker.MediaTypeOptions.Images;

        const permissionResult =
            await ImagePicker.requestCameraPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert(
                'Permission Denied',
                'Permission to access camera is required!'
            );
            return;
        }

        const pickerResult = await ImagePicker.launchCameraAsync({
            mediaTypes: mediaTypes,
            allowsEditing: true,
            aspect: type === 'selfie' ? [1, 1] : undefined, // Square aspect for selfies
            quality: 0.5,
            base64: false, // We'll handle conversion separately
        });

        if (!pickerResult.cancelled && pickerResult.assets && pickerResult.assets.length > 0) {
            setter(pickerResult.assets[0]); // Set the first asset
        }
    };

    /**
     * Converts an image URI to a Base64 string.
     * @param {string} uri - The URI of the image.
     * @returns {Promise<string>} The Base64 string of the image.
     */
    const uploadToImgbb = async (uri) => {
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
                throw new Error(result.error.message || "Image upload failed");
            }
        } catch (error) {
            console.error("ImgBB upload error:", error);
            throw error;
        }
    };
    
    return (
        <ThemedView style={styles.formContainer}>
            {/* App Bar */}
            <Appbar.Header style={styles.appBar}>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Register" />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.content}>
                {/* User Type Selection */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                        User Type
                    </ThemedText>
                    <ThemedView style={styles.pickerContainer}>
                        <Picker
                            selectedValue={userType}
                            onValueChange={(itemValue) => setUserType(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Select User Type" value="" />
                            <Picker.Item label="Existing Subscriber" value="existing" />
                            <Picker.Item label="New Subscriber" value="new" />
                            <Picker.Item label="Prospective Customer" value="prospective" />
                        </Picker>
                    </ThemedView>
                </View>

                {/* Personal Information */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                        Personal Information
                    </ThemedText>
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
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor="#aaa"
                    />
                    {userType !== 'prospective' && (
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            placeholderTextColor="#aaa"
                        />
                    )}
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
                </View>

                {/* Address Information */}
                {(userType === 'new' || userType === 'prospective') && (
                    <View style={styles.section}>
                        <ThemedText type="subtitle" style={styles.sectionTitle}>
                            Address Information
                        </ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="Address"
                            value={address}
                            onChangeText={setAddress}
                            placeholderTextColor="#aaa"
                        />
                    </View>
                )}

                {/* ID Information */}
                {(userType === 'new' || userType === 'prospective') && (
                    <View style={styles.section}>
                        <View style={styles.section}>
                            <ThemedText type="subtitle" style={styles.sectionTitle}>
                                Identification Type
                            </ThemedText>
                            <ThemedView style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={idType}
                                    onValueChange={(itemValue) => setIdType(itemValue)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Select Identification Type" value="" />
                                    <Picker.Item label="National ID" value="national_id" />
                                    <Picker.Item label="Passport" value="passport" />
                                    <Picker.Item label="Driver License" value="driver_license" />
                                    <Picker.Item label="Voter ID" value="voter_id" />
                                </Picker>
                            </ThemedView>
                        </View>

                        <ThemedText type="subtitle" style={styles.sectionTitle}>
                            ID Information
                        </ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="ID Number"
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
                                ID Expiration Date: {idExpiration.toLocaleDateString()}
                            </ThemedText>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={idExpiration}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setShowDatePicker(false);
                                    if (selectedDate) {
                                        setIdExpiration(selectedDate);
                                    }
                                }}
                            />
                        )}
                    </View>
                )}

                {/* Existing Subscriber Information */}
                {userType === 'existing' && (
                    <View style={styles.section}>
                        <ThemedText type="subtitle" style={styles.sectionTitle}>
                            Customer Information
                        </ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="Customer ID"
                            value={customerId}
                            onChangeText={setCustomerId}
                            placeholderTextColor="#aaa"
                        />
                    </View>
                )}

                {/* Upload Documents */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                        Upload Documents
                    </ThemedText>

                    {/* ID Proof */}
                        <View style={styles.documentContainer}>
                            <ThemedText style={styles.documentLabel}>ID Proof:</ThemedText>
                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => takePhoto(setIdProof, 'idProof')}
                                >
                                    <ThemedText style={styles.actionButtonText}>
                                        Take Photo
                                    </ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => pickImage(setIdProof, 'idProof')}
                                >
                                    <ThemedText style={styles.actionButtonText}>
                                        Choose from Library
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
                            {idProof && (
                                <Image
                                    source={{ uri: idProof.uri }}
                                    style={styles.imagePreview}
                                />
                            )}
                        </View>

                    {/* Proof of Address */}
                    {userType !== 'prospective' && (
                        <View style={styles.documentContainer}>
                            <ThemedText style={styles.documentLabel}>Proof of Address:</ThemedText>
                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => takePhoto(setProofOfAddress, 'proofOfAddress')}
                                >
                                    <ThemedText style={styles.actionButtonText}>
                                        Take Photo
                                    </ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => pickImage(setProofOfAddress, 'proofOfAddress')}
                                >
                                    <ThemedText style={styles.actionButtonText}>
                                        Choose from Library
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
                            {proofOfAddress && (
                                <Image
                                    source={{ uri: proofOfAddress.uri }}
                                    style={styles.imagePreview}
                                />
                            )}
                        </View>
                    )}

                    {/* Selfie */}
                    <View style={styles.documentContainer}>
                        <ThemedText style={styles.documentLabel}>Selfie:</ThemedText>
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => takePhoto(setSelfie, 'selfie')}
                            >
                                <ThemedText style={styles.actionButtonText}>
                                    Take Photo
                                </ThemedText>
                            </TouchableOpacity>
                            {/* <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => pickImage(setSelfie, 'selfie')}
                            >
                                <ThemedText style={styles.actionButtonText}>
                                    Choose from Library
                                </ThemedText>
                            </TouchableOpacity> */}
                        </View>
                        {selfie && (
                            <Image
                                source={{ uri: selfie.uri }}
                                style={styles.imagePreview}
                            />
                        )}
                    </View>
                </View>

                {/* Register Button */}
                <TouchableOpacity
                    style={styles.registerButton}
                    onPress={handleRegister}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <ThemedText style={styles.registerButtonText}>
                            Register
                        </ThemedText>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    formContainer: {
        flex: 1,
    },
    appBar: {
        backgroundColor: "#F58F21",
    },
    content: {
        padding: 20,
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
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#fff',
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
        backgroundColor: "#F58F21",
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
    registerButton: {
        backgroundColor: "#F58F21",
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 80,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
