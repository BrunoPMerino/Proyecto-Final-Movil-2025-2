import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../../components/Button";
import { useCart } from "../../contexts/CartContext";
import { useData } from "../../contexts/DataContext";

export default function ProductDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ productId?: string }>();
  const productId = Array.isArray(params.productId)
    ? params.productId[0]
    : params.productId;
  const { products } = useData();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <Modal transparent animationType="fade">
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.notFoundText}>Producto no encontrado</Text>
            <Button title="Cerrar" onPress={() => router.back()} />
          </View>
        </View>
      </Modal>
    );
  }

  const handleQuantityChange = (operation: "increment" | "decrement") => {
    if (operation === "increment" && quantity < product.stock) {
      setQuantity(quantity + 1);
    } else if (operation === "decrement" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      await addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        imageUrl: product.image_url_public ?? undefined,
        branchId: product.branch_id,
      });

      Alert.alert(
        "Éxito",
        `${quantity} ${product.name}(s) agregado(s) al carrito`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert("Error", "No se pudo agregar el producto al carrito");
      console.error("Error al agregar al carrito:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal transparent animationType="slide">
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={28} color="#001E60" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{product.name}</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {product.image_url_public && (
              <Image
                source={{ uri: product.image_url_public }}
                style={styles.productImage}
              />
            )}

            <View style={styles.infoContainer}>
              <View style={styles.priceRow}>
                <Text style={styles.price}>
                  ${product.price.toLocaleString()}
                </Text>
                <View
                  style={[
                    styles.stockBadge,
                    product.stock > 0 ? styles.inStock : styles.outOfStock,
                  ]}
                >
                  <Text
                    style={[
                      styles.stockText,
                      product.stock > 0
                        ? styles.inStockText
                        : styles.outOfStockText,
                    ]}
                  >
                    {product.stock > 0
                      ? `${product.stock} disponibles`
                      : "Agotado"}
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
                    loading={loading}
                  />
                </>
              ) : (
                <View style={styles.notAvailableContainer}>
                  <Text style={styles.notAvailableText}>
                    Producto no disponible
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  productImage: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    backgroundColor: "#e0e0e0",
    marginTop: 16,
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  price: {
    fontSize: 32,
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
    marginBottom: 20,
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
  notFoundText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginVertical: 24,
  },
});
