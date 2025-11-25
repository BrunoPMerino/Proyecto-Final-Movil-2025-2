import { Stack } from "expo-router";
import { DataProvider } from "../../contexts/DataContext";

export default function MainLayout() {
  return (
    <DataProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="home" />
        <Stack.Screen name="product-details" />
      </Stack>
    </DataProvider>
  );
}
