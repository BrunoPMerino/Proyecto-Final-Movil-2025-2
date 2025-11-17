import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../../../components/Button";
import SafeAreaContainer from "../../../components/SafeAreaContainer";
import { useCart } from "../../../contexts/CartContext";
import { useData } from "../../../contexts/DataContext";
import { useOrder } from "../../../contexts/OrderContext";

interface CartItemProps {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

const CartItemCard = ({
  productId,
  name,
  price,
  quantity,
  imageUrl,
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemProps) => {
  return (
    <View style={styles.itemCard}>
      {/* Imagen */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={40} color="#ccc" />
          </View>
        )}
      </View>

      {/* Información */}
      <View style={styles.itemContent}>
        <Text style={styles.itemName} numberOfLines={2}>
          {name}
        </Text>
        <Text style={styles.itemPrice}>${price.toLocaleString()}</Text>
      </View>

      {/* Controles de cantidad */}
      <View style={styles.quantityControl}>
        <TouchableOpacity style={styles.quantityButton} onPress={onDecrease}>
          <Ionicons name="remove" size={20} color="#001E60" />
        </TouchableOpacity>

        <Text style={styles.quantityText}>{quantity}</Text>

        <TouchableOpacity style={styles.quantityButton} onPress={onIncrease}>
          <Ionicons name="add" size={20} color="#001E60" />
        </TouchableOpacity>
      </View>

      {/* Subtotal y eliminar */}
      <View style={styles.itemFooter}>
        <Text style={styles.subtotal}>
          ${(price * quantity).toLocaleString()}
        </Text>
        <TouchableOpacity style={styles.deleteButton} onPress={onRemove}>
          <Ionicons name="trash-outline" size={20} color="#c33" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function CarritoScreen() {
  const { cart, removeItem, updateQuantity, clearCart } = useCart();
  const { createOrder, loading } = useOrder();
  const { branches } = useData();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [deliveryTime, setDeliveryTime] = useState<Date | null>(null);

  const handleIncrease = async (productId: string, currentQty: number) => {
    await updateQuantity(productId, currentQty + 1);
  };

  const handleDecrease = async (productId: string, currentQty: number) => {
    if (currentQty > 1) {
      await updateQuantity(productId, currentQty - 1);
    } else {
      await removeItem(productId);
    }
  };

  const handleRemove = async (productId: string) => {
    await removeItem(productId);
  };

  const handleDatePicked = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDeliveryTime(selectedDate);
    }
  };

  const handleCheckout = async () => {
    try {
      // Validar carrito
      if (cart.items.length === 0) {
        Alert.alert("Carrito vacío", "Agrega productos antes de continuar");
        return;
      }

      // Validar hora de entrega
      if (!deliveryTime) {
        Alert.alert("Hora de entrega", "Selecciona una hora para tu pedido");
        return;
      }

      // Obtener rama del primer producto (todos son del mismo en este momento)
      const branchId = cart.items[0].branchId;

      // Crear pedido
      const order = await createOrder(
        branchId,
        cart.items,
        deliveryTime.toISOString()
      );

      // Limpiar carrito
      await clearCart();

      // Mostrar éxito
      Alert.alert(
        "✅ Pedido creado",
        `Tu pedido ${order.id} ha sido creado correctamente`,
        [
          {
            text: "Ver historial",
            onPress: () => {
              router.push("/(main)/historial");
            },
          },
          {
            text: "Seguir comprando",
            onPress: () => {
              router.push("/(main)/home");
            },
          },
        ]
      );

      setDeliveryTime(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error creando pedido";
      Alert.alert("❌ Error", message);
      console.error("[CarritoScreen]", error);
    }
  };

  const renderCartItem = ({ item }: { item: any }) => (
    <CartItemCard
      productId={item.productId}
      name={item.name}
      price={item.price}
      quantity={item.quantity}
      imageUrl={item.imageUrl}
      onIncrease={() => handleIncrease(item.productId, item.quantity)}
      onDecrease={() => handleDecrease(item.productId, item.quantity)}
      onRemove={() => handleRemove(item.productId)}
    />
  );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <SafeAreaContainer backgroundColor="#f5f5f5">
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Carrito</Text>
        {cart.items.length > 0 && (
          <TouchableOpacity onPress={clearCart}>
            <Text style={styles.clearButton}>Limpiar</Text>
          </TouchableOpacity>
        )}
      </View>

      {cart.items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Tu carrito está vacío</Text>
          <Text style={styles.emptySubtext}>
            Agrega productos para continuar
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cart.items}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.productId}
            contentContainerStyle={styles.listContent}
            scrollEnabled={true}
          />

          {/* Footer con hora de entrega, total y botón */}
          <View style={styles.footer}>
            {/* Selector de hora de entrega */}
            <View style={styles.deliveryTimeSection}>
              <Text style={styles.deliveryLabel}>Hora de entrega</Text>
              <TouchableOpacity
                style={styles.deliveryButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="time-outline" size={18} color="#001E60" />
                <Text style={styles.deliveryTime}>
                  {deliveryTime ? formatTime(deliveryTime) : "Seleccionar hora"}
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#001E60" />
              </TouchableOpacity>
            </View>

            {/* Total */}
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalPrice}>
                ${cart.total.toLocaleString()}
              </Text>
            </View>

            {/* Botón checkout */}
            <Button
              title={loading ? "Creando pedido..." : "Finalizar pedido"}
              onPress={handleCheckout}
              disabled={loading || !deliveryTime}
            />
          </View>

          {/* Date Time Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={deliveryTime || new Date()}
              mode="time"
              display="spinner"
              onChange={handleDatePicked}
            />
          )}
        </>
      )}
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#001E60",
  },
  clearButton: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: 280,
  },
  itemCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    gap: 12,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
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
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#001E60",
    marginBottom: 6,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FF6B35",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    minWidth: 24,
    textAlign: "center",
  },
  itemFooter: {
    alignItems: "center",
    gap: 8,
  },
  subtotal: {
    fontSize: 13,
    fontWeight: "700",
    color: "#001E60",
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    gap: 12,
  },
  deliveryTimeSection: {
    gap: 8,
  },
  deliveryLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    textTransform: "uppercase",
  },
  deliveryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  deliveryTime: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#001E60",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FF6B35",
  },
});
