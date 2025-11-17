import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  stock: number;
  onPress: () => void;
  style?: ViewStyle;
}

export default function ProductCard({
  id,
  name,
  description,
  price,
  imageUrl,
  stock,
  onPress,
  style,
}: ProductCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Imagen */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={48} color="#ccc" />
          </View>
        )}
      </View>

      {/* Información */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>

        {/* Footer: Precio y Stock */}
        <View style={styles.footer}>
          <Text style={styles.price}>${price.toLocaleString()}</Text>
          <View
            style={[
              styles.stockBadge,
              stock > 0 ? styles.stockAvailable : styles.stockUnavailable,
            ]}
          >
            <Text
              style={[
                styles.stockText,
                stock > 0
                  ? styles.stockTextAvailable
                  : styles.stockTextUnavailable,
              ]}
            >
              {stock > 0 ? `${stock}` : "Agotado"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    width: "100%",
    height: 160,
    backgroundColor: "#f0f0f0",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: "#001E60",
    marginBottom: 6,
  },
  description: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
    lineHeight: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FF6B35",
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockAvailable: {
    backgroundColor: "#E8F5E9",
  },
  stockUnavailable: {
    backgroundColor: "#FFEBEE",
  },
  stockText: {
    fontSize: 11,
    fontWeight: "600",
  },
  stockTextAvailable: {
    color: "#2E7D32",
  },
  stockTextUnavailable: {
    color: "#C62828",
  },
});
