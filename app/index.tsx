import { useAuth } from "@/contexts/AuthContext";
import { Redirect, type Href } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log("[Index] Estado de autenticación:", {
      isAuthenticated,
      isLoading,
    });
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    console.log("[Index] Cargando...");
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  if (isAuthenticated) {
    console.log("[Index] Usuario autenticado, yendo a home");
    return <Redirect href={"/screens/tabs/HomeCatalogoScreen" as Href} />;
  }

  console.log("[Index] Usuario no autenticado, yendo a login");
  return <Redirect href="/(auth)/splashScreen" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
});
