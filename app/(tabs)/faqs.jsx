import React from 'react';
import { Pressable, StyleSheet, ScrollView, View } from "react-native";
import { Appbar } from 'react-native-paper';
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import { logout } from "../../features/authentication/auth.slice";
import { useDispatch } from 'react-redux';

export default function FaqScreen() {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  const faqs = [
    {
      question: "What is Telecom KYC?",
      answer: "Telecom KYC (Know Your Customer) is a process where telecom providers verify the identity of customers using official identification documents to ensure compliance with regulatory standards.",
    },
    {
      question: "Why is KYC important in telecommunications?",
      answer: "KYC helps prevent fraud, enables better customer service, and ensures compliance with legal requirements to prevent identity theft and other forms of misuse.",
    },
    {
      question: "What documents are required for Telecom KYC?",
      answer: "Commonly required documents include a government-issued ID (e.g., passport, driver’s license), proof of address, and sometimes a recent photograph.",
    },
    {
      question: "Is KYC mandatory for all telecom customers?",
      answer: "Yes, most telecom regulators mandate KYC to protect both the provider and customers, especially for prepaid and postpaid connections.",
    },
    {
      question: "How long does the KYC process take?",
      answer: "The KYC process duration varies, but it usually takes a few minutes to a couple of days, depending on the verification method used by the telecom provider.",
    },
    {
      question: "What happens if my KYC is not completed?",
      answer: "If KYC is incomplete, your telecom service provider may restrict or suspend your services until verification is completed.",
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Frequently Asked Questions" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.faqContainer}>
        {faqs.map((faq, index) => (
          <View key={index} style={styles.faqItem}>
            <ThemedText style={styles.question}>{faq.question}</ThemedText>
            <ThemedText style={styles.answer}>{faq.answer}</ThemedText>
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  header: {
    backgroundColor: "#F58F21",
    elevation: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  faqContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  faqItem: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  question: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  answer: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
});
