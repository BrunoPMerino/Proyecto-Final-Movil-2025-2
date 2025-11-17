import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import SafeAreaContainer from "../../../components/SafeAreaContainer";

export default function ChatbotScreen() {
  return (
    <SafeAreaContainer backgroundColor="#f5f5f5" paddingHorizontal={16}>
      <View style={styles.header}>
        <Ionicons name="chatbubble" size={32} color="#001E60" />
        <Text style={styles.title}>Chatbot</Text>
      </View>
      <View style={styles.content}>
        <Ionicons name="chatbubble-ellipses-outline" size={64} color="#ccc" />
        <Text style={styles.subtitle}>Próximamente...</Text>
        <Text style={styles.description}>Soporte en línea con IA</Text>
      </View>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 12,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginTop: 16,
  },
  description: {
    fontSize: 14,
    color: "#bbb",
    marginTop: 8,
  },
});
