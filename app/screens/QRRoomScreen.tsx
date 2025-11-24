import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SafeAreaContainer from "../../components/SafeAreaContainer";
import CameraModal from "../modals/CameraModal"; // ⬅️ importa el modal de cámara

export default function QRRoomScreen() {
  const router = useRouter();

  // controla la visibilidad del modal
  const [cameraVisible, setCameraVisible] = useState(false);
  // guarda el último QR leído
  const [lastQrData, setLastQrData] = useState<string | null>(null);

  const handleOpenCamera = () => {
    setLastQrData(null);        // opcional: limpiar último valor
    setCameraVisible(true);
  };

  const handleCloseCamera = () => {
    setCameraVisible(false);
  };

  const handleQrConfirm = (qrData: string) => {
    // aquí recibes la info del código QR
    console.log("QR escaneado:", qrData);
    setLastQrData(qrData);

    // si quieres, podrías navegar según el código:
    // router.push(`/screens/rooms/${qrData}`);

    setCameraVisible(false);
  };

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

        <TouchableOpacity style={styles.button} onPress={handleOpenCamera}>
          <Ionicons name="camera-outline" size={24} color="white" />
          <Text style={styles.buttonText}>Abrir Cámara</Text>
        </TouchableOpacity>

        {/* Mostrar el último QR leído (opcional, útil para debug) */}
        {lastQrData && (
          <View style={styles.qrInfoBox}>
            <Text style={styles.qrInfoTitle}>Último QR escaneado:</Text>
            <Text style={styles.qrInfoText}>{lastQrData}</Text>
          </View>
        )}
      </View>

      {/* Modal de cámara para escanear solo QR */}
      <CameraModal
        isVisible={cameraVisible}
        onClose={handleCloseCamera}
        onConfirm={handleQrConfirm}
      />
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
  qrInfoBox: {
    marginTop: 24,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#eef3ff",
    width: "100%",
  },
  qrInfoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#001E60",
    marginBottom: 4,
  },
  qrInfoText: {
    fontSize: 13,
    color: "#333",
  },
});
