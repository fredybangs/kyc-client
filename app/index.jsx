import React from 'react';
import { Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';

export default function IndexScreen() {
  const handlePush = () => {
    router.replace("(auth)/login");
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Welcome to Qcell KYC</ThemedText>
      <ThemedText style={styles.subtitle}>
        Your trusted solution for secure and efficient Know Your Customer (KYC) verification. 
        Qcell KYC simplifies the process for agents and customers to manage identity verification 
        and documentation.
      </ThemedText>

      <ThemedView style={styles.infoContainer}>
        <ThemedText style={styles.infoText}>
          • Verify identities and manage client information securely.
        </ThemedText>
        <ThemedText style={styles.infoText}>
          • Upload and store identification documents effortlessly.
        </ThemedText>
        <ThemedText style={styles.infoText}>
          • Ensure regulatory compliance with streamlined processes.
        </ThemedText>
      </ThemedView>

      <Pressable onPress={handlePush} style={styles.startButton}>
        <ThemedText style={styles.startButtonText}>Get Started</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const primaryColor = "#F58F21";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: primaryColor,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  infoContainer: {
    marginVertical: 20,
    alignItems: "center",
  },
  infoText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  startButton: {
    marginTop: 30,
    backgroundColor: primaryColor,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  startButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
