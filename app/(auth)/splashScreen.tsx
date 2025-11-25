import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log("[SplashScreen] Estado:", { isAuthenticated, isLoading });

    // Si ya está autenticado y cargó, ir a home
    if (!isLoading && isAuthenticated) {
      console.log("[SplashScreen] Usuario autenticado, yendo a home");
      router.replace("/screens/tabs/HomeCatalogoScreen");
      return;
    }

    // Si no está autenticado y terminó de cargar, ir a login
    if (!isLoading && !isAuthenticated) {
      const timer = setTimeout(() => {
        console.log("[SplashScreen] Yendo a login");
        router.replace("/(auth)/login");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/logo/image 27.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#12326D",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 450,
    height: 450,
  },
});
