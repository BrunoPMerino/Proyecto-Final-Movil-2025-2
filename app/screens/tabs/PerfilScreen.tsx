import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../../../components/Button";
import SafeAreaContainer from "../../../components/SafeAreaContainer";
import { useAuth } from "../../../contexts/AuthContext";

export default function PerfilScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();

  // --- Estados nuevos ---
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "tarjeta">(
    "efectivo"
  );
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);

  const handleQRRoom = () => {
    router.push("/screens/QRRoomScreen");
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/(auth)/splashScreen");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const openSupportEmail = () => {
    const email = "soporte@comidasabana.com";
    const subject = "Ayuda App Comida Sabana";
    const body = "Hola, necesito ayuda con la aplicación Comida Sabana.";
    const url = `mailto:${email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    Linking.openURL(url).catch((err) =>
      console.error("No se pudo abrir el correo:", err)
    );
  };

  return (
    <SafeAreaContainer backgroundColor="#f5f5f5" paddingHorizontal={16}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="person-circle" size={80} color="#001E60" />
          <Text style={styles.userName}>Mi Perfil</Text>
          <Text style={styles.userEmail}>
            {user?.email || "usuario@comida.com"}
          </Text>
        </View>

        {/* Menú */}
        <View style={styles.menuContainer}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Configuraciones</Text>
          </View>

          {/* Métodos de pago */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setPaymentModalVisible(true)}
          >
            <Ionicons name="card-outline" size={24} color="#001E60" />
            <Text style={styles.menuItemText}>Métodos de pago</Text>

            {/* Método seleccionado resumido */}
            <Text style={styles.menuItemValue}>
              {paymentMethod === "efectivo" ? "Efectivo" : "Tarjeta"}
            </Text>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>

          {/* Ayuda */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setHelpModalVisible(true)}
          >
            <Ionicons name="help-circle-outline" size={24} color="#001E60" />
            <Text style={styles.menuItemText}>Ayuda</Text>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>

          {/* QR Room */}
          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemLast]}
            onPress={handleQRRoom}
          >
            <Ionicons name="qr-code-outline" size={24} color="#001E60" />
            <Text style={styles.menuItemText}>QR Room</Text>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Button title="Cerrar Sesión" onPress={handleLogout} />
        </View>
      </ScrollView>

      {/* MODAL: Métodos de pago */}
      <Modal
        visible={paymentModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Método de pago</Text>
            <Text style={styles.modalSubtitle}>
              Elige cómo quieres pagar tus pedidos.
            </Text>

            {/* Opción Efectivo */}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setPaymentMethod("efectivo")}
            >
              <View style={styles.radioOuter}>
                {paymentMethod === "efectivo" && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Efectivo</Text>
                <Text style={styles.optionDescription}>
                  Pagas al recibir tu pedido en el punto de entrega.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Opción Tarjeta */}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setPaymentMethod("tarjeta")}
            >
              <View style={styles.radioOuter}>
                {paymentMethod === "tarjeta" && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Tarjeta</Text>
                <Text style={styles.optionDescription}>
                  Registra tu tarjeta en caja y paga de forma rápida.
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setPaymentModalVisible(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => setPaymentModalVisible(false)}
              >
                <Text style={styles.modalButtonPrimaryText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: Ayuda */}
      <Modal
        visible={helpModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHelpModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Ayuda</Text>
            <Text style={styles.modalSubtitle}>
              Si tienes problemas con tu pedido o la app, contáctanos.
            </Text>

            <View style={{ marginTop: 8, marginBottom: 16 }}>
              <Text style={styles.helpText}>
                • Pedidos: revisa el estado en "Historial de pedidos".
              </Text>
              <Text style={styles.helpText}>
                • Pagos: asegúrate de que tu método de pago esté actualizado.
              </Text>
              <Text style={styles.helpText}>
                • Dudas generales: escríbenos y te responderemos lo antes
                posible.
              </Text>
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setHelpModalVisible(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={openSupportEmail}
              >
                <Text style={styles.modalButtonPrimaryText}>
                  Escribir a soporte
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    paddingVertical: 24,
    backgroundColor: "white",
    borderRadius: 12,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
  },
  userEmail: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
  menuContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
  },
  sectionTitleContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#001E60",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 16,
    flex: 1,
  },
  menuItemValue: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  footer: {
    paddingBottom: 80,
  },

  // Modals
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: "100%",
    borderRadius: 12,
    backgroundColor: "white",
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#001E60",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#001E60",
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
  },
  optionDescription: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 18,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginLeft: 8,
  },
  modalButtonSecondary: {
    backgroundColor: "#f2f2f2",
  },
  modalButtonSecondaryText: {
    fontSize: 14,
    color: "#333",
  },
  modalButtonPrimary: {
    backgroundColor: "#001E60",
  },
  modalButtonPrimaryText: {
    fontSize: 14,
    color: "white",
    fontWeight: "600",
  },
  helpText: {
    fontSize: 13,
    color: "#555",
    marginBottom: 4,
  },
});
