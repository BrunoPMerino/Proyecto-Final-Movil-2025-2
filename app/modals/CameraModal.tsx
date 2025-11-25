import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import React, { useRef, useState } from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type CameraModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (qrData: string) => void;
};

export default function CameraModal({
  isVisible,
  onClose,
  onConfirm,
}: CameraModalProps) {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);

  const handleBarcodeScanned = ({ data, type }: any) => {
    if (hasScanned) return;
    if (type !== "qr") return;

    setHasScanned(true);
    onConfirm(String(data));
    onClose();
  };

  const handleClose = () => {
    setHasScanned(false);
    onClose();
  };

  return (
    <Modal visible={isVisible} animationType="slide">
      <View style={{ flex: 1, backgroundColor: "black" }}>
        {!permission ? (
          <View />
        ) : !permission.granted ? (
          <View style={styles.container}>
            <Text style={styles.message}>
              Necesitamos tu permiso para usar la cámara
            </Text>
            <TouchableOpacity style={styles.button} onPress={requestPermission}>
              <Text style={styles.text}>Conceder permiso</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { marginTop: 12 }]}
              onPress={handleClose}
            >
              <Text style={styles.text}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <CameraView
              style={styles.camera}
              facing={facing}
              ref={cameraRef}
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }}
              onBarcodeScanned={handleBarcodeScanned}
            />

            <View style={styles.overlayTop}>
              <Text style={styles.overlayText}>
                Alinea el código QR dentro del marco
              </Text>
            </View>

            <View style={styles.frameContainer}>
              <View style={styles.frame} />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  setFacing((c) => (c === "back" ? "front" : "back"))
                }
              >
                <Text style={styles.text}>Cambiar cámara</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={handleClose}>
                <Text style={styles.text}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", backgroundColor: "black" },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    color: "white",
    fontSize: 16,
  },
  camera: { flex: 1 },
  buttonContainer: {
    position: "absolute",
    bottom: 30,
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  button: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  text: { fontSize: 16, fontWeight: "600", color: "white" },
  overlayTop: {
    position: "absolute",
    top: 40,
    width: "100%",
    alignItems: "center",
  },
  overlayText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  frameContainer: {
    position: "absolute",
    top: "25%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  frame: {
    width: 250,
    height: 250,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#ffffff",
  },
});
