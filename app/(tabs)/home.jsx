import React from "react";
import { Pressable, StyleSheet, FlatList, View, Image, ScrollView, Alert } from "react-native";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import { logout } from "../../features/authentication/auth.slice";
import { useDispatch, useSelector } from "react-redux";
import { Appbar } from 'react-native-paper';
import moment from 'moment';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from "expo-router";


export default function HomeScreen() {
  const dispatch = useDispatch();
  const userDetails = useSelector((state) => state.user.userDetails);

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Logout Cancelled'),
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => {
            dispatch(logout());
            router.replace('/login');
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const formatLabel = (str) => {
    return str
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <ThemedView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Home" titleStyle={styles.headerTitle} />
        <Appbar.Action
          icon={() => <MaterialCommunityIcons name="logout" size={24} color="white" />}
          onPress={handleLogout}
        />
      </Appbar.Header>

      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Welcome, {userDetails?.name}</ThemedText>
        <ThemedText style={styles.subtitle}>Email: {userDetails?.login}</ThemedText>

        {userDetails?.kyc_applications && userDetails.kyc_applications.length > 0 ? (
          <View style={styles.kycContainer}>
            <ThemedText style={styles.kycTitle}>Your KYC Applications:</ThemedText>
            <FlatList
              data={userDetails.kyc_applications}
              keyExtractor={(item) => item?.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.kycItem}>
                  <ThemedText style={styles.kycItemName}>{item?.name}</ThemedText>

                  <View style={styles.kycItemRow}>
                    <ThemedText style={styles.kycItemLabel}>ID Type:</ThemedText>
                    <ThemedText style={styles.kycItemValue}>{formatLabel(item?.id_type)}</ThemedText>
                    </View>

                  <View style={styles.kycItemRow}>
                    <ThemedText style={styles.kycItemLabel}>ID Number:</ThemedText>
                    <ThemedText style={styles.kycItemValue}>{item?.id_number}</ThemedText>
                  </View>

                  <View style={styles.kycItemRow}>
                    <ThemedText style={styles.kycItemLabel}>ID Expiration:</ThemedText>
                    <ThemedText style={styles.kycItemValue}>{item?.id_expiration}</ThemedText>
                  </View>

                  <View style={styles.kycItemRow}>
                    <ThemedText style={styles.kycItemLabel}>Current Address:</ThemedText>
                    <ThemedText style={styles.kycItemValue}>{item?.current_address}</ThemedText>
                  </View>

                  <View style={styles.kycItemRow}>
                    <ThemedText style={styles.kycItemLabel}>Permanent Address:</ThemedText>
                    <ThemedText style={styles.kycItemValue}>{item?.permanent_address}</ThemedText>
                  </View>

                  <View style={styles.kycItemRow}>
                    <ThemedText style={styles.kycItemLabel}>State:</ThemedText>
                    <ThemedText style={styles.kycItemValue}>{item?.state}</ThemedText>
                  </View>

                  <View style={styles.kycItemRow}>
                    <ThemedText style={styles.kycItemLabel}>Upload Date:</ThemedText>
                    <ThemedText style={styles.kycItemValue}>
                      {moment(item?.document_upload_date).format('lll')}
                    </ThemedText>
                  </View>

                  {/* Images */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                    <View style={styles.imageContainer}>
                      <ThemedText style={styles.imageLabel}>ID Document</ThemedText>
                      <Image source={{ uri: item?.id_document_url }} style={styles.image} />
                    </View>
                    <View style={styles.imageContainer}>
                      <ThemedText style={styles.imageLabel}>Proof of Address</ThemedText>
                      <Image source={{ uri: item?.proof_of_address_url }} style={styles.image} />
                    </View>
                    <View style={styles.imageContainer}>
                      <ThemedText style={styles.imageLabel}>Selfie</ThemedText>
                      <Image source={{ uri: item?.selfie_url }} style={styles.image} />
                    </View>
                  </ScrollView>
                </View>
              )}
            />
          </View>
        ) : (
          <ThemedText style={styles.noApplicationsText}>You have no KYC Applications.</ThemedText>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const primaryColor = "#F58F21"; // Your primary color

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: primaryColor,
    elevation: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 25,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  kycContainer: {
    flex: 1,
    marginVertical: 10,
  },
  kycTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 10,
  },
  kycItem: {
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderLeftWidth: 5,
    borderLeftColor: primaryColor,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  kycItemName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 10,
  },
  kycItemRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  kycItemLabel: {
    fontSize: 16,
    color: "#333333",
    fontWeight: '600',
    width: 140,
  },
  kycItemValue: {
    fontSize: 16,
    color: "#666666",
    flexShrink: 1,
  },
  imageScroll: {
    marginTop: 10,
  },
  imageContainer: {
    marginRight: 15,
    alignItems: 'center',
  },
  imageLabel: {
    fontSize: 14,
    color: "#333333",
    marginBottom: 5,
  },
  image: {
    width: 120,
    height: 120,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  noApplicationsText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginTop: 20,
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    backgroundColor: primaryColor,
    borderRadius: 8,
    alignSelf: "center",
    marginBottom: 20,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
