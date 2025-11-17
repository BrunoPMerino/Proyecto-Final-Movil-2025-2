import { useData } from "@/contexts/DataContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../../components/Button";

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { productId } = useLocalSearchParams();
  const { products } = useData();
  const [quantity, setQuantity] = useState(1);

  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Atrás</Text>
        </TouchableOpacity>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Producto no encontrado</Text>
        </View>
      </View>
    );
  }

  const handleAddToCart = () => {
    alert(`${quantity} ${product.name}(s) añadido(s) al carrito`);
  };

  const handleQuantityChange = (operation: "increment" | "decrement") => {
    if (operation === "increment" && quantity < product.stock) {
      setQuantity(quantity + 1);
    } else if (operation === "decrement" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Atrás</Text>
        </TouchableOpacity>
      </View>

      {product.image_url && (
        <Image
          source={{ uri: product.image_url }}
          style={styles.productImage}
        />
      )}

      <View style={styles.content}>
        <Text style={styles.productName}>{product.name}</Text>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>${product.price.toLocaleString()}</Text>
          <View
            style={[
              styles.stockBadge,
              product.stock > 0 ? styles.inStock : styles.outOfStock,
            ]}
          >
            <Text
              style={[
                styles.stockText,
                product.stock > 0 ? styles.inStockText : styles.outOfStockText,
              ]}
            >
              {product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}
            </Text>
          </View>
        </View>

        <Text style={styles.description}>{product.description}</Text>

        {product.is_available ? (
          <>
            <View style={styles.quantityContainer}>
              <Text style={styles.quantityLabel}>Cantidad:</Text>
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange("decrement")}
                >
                  <Text style={styles.quantityButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.quantityValue}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange("increment")}
                  disabled={quantity >= product.stock}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalPrice}>
                ${(product.price * quantity).toLocaleString()}
              </Text>
            </View>

            <Button
              title={`Agregar al carrito ($${(
                product.price * quantity
              ).toLocaleString()})`}
              onPress={handleAddToCart}
            />
          </>
        ) : (
          <View style={styles.notAvailableContainer}>
            <Text style={styles.notAvailableText}>Producto no disponible</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    fontSize: 16,
    color: "#001E60",
    fontWeight: "600",
  },
  productImage: {
    width: "100%",
    height: 280,
    backgroundColor: "#e0e0e0",
  },
  content: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#001E60",
  },
  stockBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  inStock: {
    backgroundColor: "#eefaf0",
  },
  outOfStock: {
    backgroundColor: "#fadbd8",
  },
  stockText: {
    fontSize: 12,
    fontWeight: "600",
  },
  inStockText: {
    color: "#2ecc71",
  },
  outOfStockText: {
    color: "#e74c3c",
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 24,
  },
  quantityContainer: {
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    width: 120,
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#001E60",
  },
  quantityValue: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#001E60",
  },
  notAvailableContainer: {
    paddingVertical: 24,
    alignItems: "center",
  },
  notAvailableText: {
    fontSize: 16,
    color: "#e74c3c",
    fontWeight: "600",
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notFoundText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
