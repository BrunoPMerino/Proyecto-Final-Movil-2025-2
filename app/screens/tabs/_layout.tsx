import CustomTabBar from "@/components/CustomTabBar";
import { Tabs } from "expo-router";

const TAB_CONFIG: Record<
  string,
  { title: string; activeIcon: any; inactiveIcon: any }
> = {
  HomeCatalogoScreen: {
    title: "Catálogo",
    activeIcon: "home",
    inactiveIcon: "home-outline",
  },
  HistorialScreen: {
    title: "Historial",
    activeIcon: "receipt",
    inactiveIcon: "receipt-outline",
  },
  CarritoScreen: {
    title: "Carrito",
    activeIcon: "cart",
    inactiveIcon: "cart-outline",
  },
  MapaScreen: {
    title: "Mapa",
    activeIcon: "map",
    inactiveIcon: "map-outline",
  },
  ChatbotScreen: {
    title: "Chatbot",
    activeIcon: "chatbubble",
    inactiveIcon: "chatbubble-outline",
  },
  PerfilScreen: {
    title: "Perfil",
    activeIcon: "person",
    inactiveIcon: "person-outline",
  },
};

export default function TabsLayout() {
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
