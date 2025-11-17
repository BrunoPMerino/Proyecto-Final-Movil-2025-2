import { Ionicons } from "@expo/vector-icons";
import { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";
import {
  NavigationHelpers,
  TabNavigationState,
} from "@react-navigation/native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CustomTabBarProps {
  state: TabNavigationState<any>;
  descriptors: any;
  navigation: NavigationHelpers<any, BottomTabNavigationEventMap>;
}

const TAB_CONFIG: Record<
  string,
  {
    title: string;
    activeIcon: keyof typeof Ionicons.glyphMap;
    inactiveIcon: keyof typeof Ionicons.glyphMap;
  }
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

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 12);

  return (
    <View style={[styles.container, { paddingBottom: bottomOffset }]}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const config = TAB_CONFIG[route.name] ?? TAB_CONFIG.home;
          const iconName = isFocused ? config.activeIcon : config.inactiveIcon;
          const tintColor = isFocused ? "#001E60" : "#9AA0B4";

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[styles.tabItem, isFocused && styles.tabItemActive]}
            >
              <Ionicons name={iconName} size={24} color={tintColor} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 8,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    borderTopWidth: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  tabItemActive: {
    backgroundColor: "#E8F0FE",
  },
});
