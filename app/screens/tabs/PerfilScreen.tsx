import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
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

  return (
    <SafeAreaContainer backgroundColor="#f5f5f5" paddingHorizontal={16}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.header}>
          <Ionicons name="person-circle" size={80} color="#001E60" />
          <Text style={styles.userName}>Mi Perfil</Text>
          <Text style={styles.userEmail}>{user?.email || "usuario@comida.com"}</Text>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="settings-outline" size={24} color="#001E60" />
            <Text style={styles.menuItemText}>Configuración</Text>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="card-outline" size={24} color="#001E60" />
            <Text style={styles.menuItemText}>Métodos de pago</Text>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle-outline" size={24} color="#001E60" />
            <Text style={styles.menuItemText}>Ayuda</Text>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>

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
  footer: {
    paddingBottom: 80,
  },
});
