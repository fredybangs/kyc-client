import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, FlatList, View, RefreshControl, Alert } from "react-native";
import { ThemedView } from "../../../components/ThemedView";
import { ThemedText } from "../../../components/ThemedText";
import { logout } from "../../../features/authentication/auth.slice";
import { useDispatch, useSelector } from "react-redux";
import { Appbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import apiConfig from '../../../services/api/config';
import axios from "axios";

const primaryColor = "#F58F21";

export default function HomeScreen() {
  const dispatch = useDispatch();
  const userDetails = useSelector((state) => state.user.userDetails);
  const router = useRouter();

  const [kycApplications, setKycApplications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchKycApplications();
  }, []);

  const fetchKycApplications = async () => {
    try {
      const response = await axios.get(`${apiConfig.url}/api/kyc/get`, {
        headers: {
          'Content-Type': 'text/html',
          'clientId': '12345',
          'accessToken': userDetails.access_token,
        },
      });
      if (response.data.status) {
        setKycApplications(response.data.kyc_applications);
      } else {
        Alert.alert("Error", "Failed to fetch KYC applications");
      }
    } catch (error) {
      console.error("Error fetching KYC applications:", error);
      Alert.alert("Error", "Could not retrieve KYC applications.");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchKycApplications();
    setRefreshing(false);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const formatLabel = (str) => {
    return str?.replace(/_/g, ' ')
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

        <Pressable onPress={() => router.push('/home/createkyc')} style={styles.createButton}>
          <ThemedText style={styles.createButtonText}>Create Application</ThemedText>
        </Pressable>

        <FlatList
          data={kycApplications}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />
          }
          ListHeaderComponent={
            <ThemedText style={styles.kycTitle}>KYC Applications:</ThemedText>
          }
          renderItem={({ item }) => (
            <View style={styles.kycItem}>
              <ThemedText style={styles.kycItemName}>{item.name}</ThemedText>
              <View style={styles.kycItemRow}>
                <ThemedText style={styles.kycItemLabel}>Status:</ThemedText>
                <ThemedText style={styles.kycItemValue}>{formatLabel(item.state)}</ThemedText>
              </View>
              <View style={styles.kycItemRow}>
                <ThemedText style={styles.kycItemLabel}>Notes:</ThemedText>
                <ThemedText style={styles.kycItemValue}>{item.verification_notes || "None"}</ThemedText>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <ThemedText style={styles.noApplicationsText}>No KYC Applications</ThemedText>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
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
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333333",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 20,
  },
  createButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    backgroundColor: primaryColor,
    borderRadius: 8,
    alignSelf: "center",
    marginBottom: 20,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  kycTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: primaryColor,
    marginBottom: 15,
    textAlign: "center",
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
    marginBottom: 8,
  },
  kycItemRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  kycItemLabel: {
    fontSize: 16,
    color: "#333333",
    fontWeight: '600',
    width: 80,
  },
  kycItemValue: {
    fontSize: 16,
    color: "#666666",
    flexShrink: 1,
  },
  noApplicationsText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginTop: 20,
  },
});
