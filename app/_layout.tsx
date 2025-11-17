import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { DataProvider } from "@/contexts/DataContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <DataProvider>
          <CartProvider>
            <OrderProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(main)" />
                <Stack.Screen
                  name="product-modal"
                  options={{ presentation: "transparentModal" }}
                />
                <Stack.Screen
                  name="qr-room"
                  options={{ presentation: "modal" }}
                />
              </Stack>
            </OrderProvider>
          </CartProvider>
        </DataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
