import React from 'react';
import { Pressable, StyleSheet } from "react-native";

import EditScreenInfo from "../components/EditScreenInfo";
import { router } from "expo-router";
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';

export default function IndexScreen() {
  const handlePush = () => {
    router.replace("/login");
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Index Screen</ThemedText>
      <Pressable onPress={handlePush} style={{ padding: 10 }}>
        <ThemedText>Iniciar</ThemedText>
      </Pressable>
      <ThemedView
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <EditScreenInfo path="app/index.tsx" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
