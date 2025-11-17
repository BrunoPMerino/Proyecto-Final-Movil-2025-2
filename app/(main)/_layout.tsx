import CustomTabBar from "@/components/CustomTabBar";
import { Tabs } from "expo-router";
import React from "react";

const TAB_CONFIG: Record<
  string,
  { title: string; activeIcon: any; inactiveIcon: any }
> = {
  home: { title: "Catálogo", activeIcon: "home", inactiveIcon: "home-outline" },
  historial: {
    title: "Historial",
    activeIcon: "receipt",
    inactiveIcon: "receipt-outline",
  },
  carrito: {
    title: "Carrito",
    activeIcon: "cart",
    inactiveIcon: "cart-outline",
  },
  mapa: { title: "Mapa", activeIcon: "map", inactiveIcon: "map-outline" },
  chatbot: {
    title: "Chatbot",
    activeIcon: "chatbubble",
    inactiveIcon: "chatbubble-outline",
  },
  perfil: {
    title: "Perfil",
    activeIcon: "person",
    inactiveIcon: "person-outline",
  },
};

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      {Object.entries(TAB_CONFIG).map(([name, config]) => (
        <Tabs.Screen key={name} name={name} options={{ title: config.title }} />
      ))}
    </Tabs>
  );
}
