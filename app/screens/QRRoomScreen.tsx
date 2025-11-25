import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SafeAreaContainer from "../../components/SafeAreaContainer";

export default function QRRoomScreen() {
  const router = useRouter();
  return (
    <SafeAreaContainer backgroundColor="#f5f5f5">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#001E60" />
        </TouchableOpacity>
        <Text style={styles.title}>QR Room</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <Ionicons name="qr-code-outline" size={120} color="#001E60" />
        <Text style={styles.subtitle}>Escanea un código QR</Text>
        <Text style={styles.description}>
          Apunta la cámara a un código QR para acceder a la sala
        </Text>

        <TouchableOpacity style={styles.button}>
          <Ionicons name="camera-outline" size={24} color="white" />
          <Text style={styles.buttonText}>Abrir Cámara</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 24,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#001E60",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
