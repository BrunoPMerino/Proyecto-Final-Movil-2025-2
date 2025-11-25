import React from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SafeAreaContainerProps {
  children: React.ReactNode;
  backgroundColor?: string;
  paddingHorizontal?: number;
  paddingVertical?: number;
}

export default function SafeAreaContainer({
  children,
  backgroundColor = "#f5f5f5",
  paddingHorizontal = 0,
  paddingVertical = 0,
}: SafeAreaContainerProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  // Configurar status bar y navigation bar
  React.useEffect(() => {
    if (Platform.OS === "android") {
      StatusBar.setBarStyle("dark-content");
      StatusBar.setBackgroundColor("#001E60");
      StatusBar.setTranslucent(false);
    }
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          paddingLeft: insets.left + paddingHorizontal,
          paddingRight: insets.right + paddingHorizontal,
          paddingTop: insets.top + paddingVertical,
          // No aplicamos paddingBottom porque la navigation tab ya lo maneja
          minHeight: height,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
