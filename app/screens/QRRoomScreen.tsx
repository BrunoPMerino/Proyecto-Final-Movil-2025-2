import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SafeAreaContainer from "../../components/SafeAreaContainer";
import CameraModal from "../modals/CameraModal";

export default function QRRoomScreen() {
  const router = useRouter();
  const [isCameraVisible, setCameraVisible] = useState(false);
  const [lastCode, setLastCode] = useState<string | null>(null);

  const handleOpenCamera = () => {
    setLastCode(null);
    setCameraVisible(true);
  };

  const handleCloseCamera = () => {
    setCameraVisible(false);
  };

  const handleCodeScanned = (data: string) => {
    console.log("[QRRoom] raw data =>", data);

    try {
      let raw = data.trim();

      // Si llega una URL con ?data=... / ?text=... / ?q=...
      if (raw.startsWith("http://") || raw.startsWith("https://")) {
        try {
          const url = new URL(raw);
          const param =
            url.searchParams.get("data") ||
            url.searchParams.get("text") ||
            url.searchParams.get("q");

          if (param) {
            raw = decodeURIComponent(param);
            console.log("[QRRoom] extraído de URL =>", raw);
          }
        } catch (e) {
          console.log("[QRRoom] error parseando URL:", e);
        }
      }

      // Quitar comillas envolventes si las hay
      if (
        (raw.startsWith('"') && raw.endsWith('"')) ||
        (raw.startsWith("'") && raw.endsWith("'"))
      ) {
        raw = raw.slice(1, -1);
      }

      // Reemplazar \" por "
      raw = raw.replace(/\\"/g, '"');
      console.log("[QRRoom] cleaned raw =>", raw);

      const parsed = JSON.parse(raw);

      if (parsed.type === "branch" && typeof parsed.branchId === "string") {
        const branchId = parsed.branchId;
        console.log("[QRRoom] branchId leído:", branchId);

        setLastCode(`Sucursal seleccionada: ${branchId}`);

        // 👇 CERRAR el modal de cámara
        setCameraVisible(false);

        // 👇 Navegar al Home, pasando el branchId como parámetro
        router.push({
          pathname: "/screens/tabs/HomeCatalogoScreen",
          params: { branchId },
        });

        return;
      }

      setLastCode("Formato de QR incorrecto (falta type=branch o branchId).");
    } catch (err) {
      console.log("[QRRoom] error parseando QR:", err);
      setLastCode("Formato de QR incorrecto.");
    }
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
          Apunta la cámara a un código QR para seleccionar una sucursal.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleOpenCamera}>
          <Ionicons name="camera-outline" size={24} color="white" />
          <Text style={styles.buttonText}>Abrir Cámara</Text>
        </TouchableOpacity>

        {lastCode && (
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>{lastCode}</Text>
          </View>
        )}
      </View>

      {/* Modal de cámara para leer el QR */}
      <CameraModal
        isVisible={isCameraVisible}
        onClose={handleCloseCamera}
        onConfirm={handleCodeScanned}
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
  resultBox: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#eef2ff",
  },
  resultText: {
    color: "#001E60",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});
