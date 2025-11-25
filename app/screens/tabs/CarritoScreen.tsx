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

      {/* Contenido */}
      <View style={styles.itemContent}>
        <Text style={styles.itemName} numberOfLines={2}>
          {name}
        </Text>

        <Text style={styles.itemPrice}>${price.toLocaleString()}</Text>

        {/* Controles */}
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.quantityButton} onPress={onDecrease}>
            <Ionicons name="remove" size={18} color="#001E60" />
          </TouchableOpacity>

          <Text style={styles.quantityText}>{quantity}</Text>

          <TouchableOpacity style={styles.quantityButton} onPress={onIncrease}>
            <Ionicons name="add" size={18} color="#001E60" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={onRemove}>
            <Ionicons name="trash-outline" size={20} color="#001E60" />
          </TouchableOpacity>
        </View>
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
      if (cart.items.length === 0) {
        Alert.alert("Carrito vacío", "Agrega productos antes de continuar");
        return;
      }

      if (!deliveryTime) {
        Alert.alert("Hora de entrega", "Selecciona una hora para tu pedido");
        return;
      }

      const branchId = cart.items[0].branchId;

      const order = await createOrder(
        branchId,
        cart.items,
        deliveryTime.toISOString()
      );

      await clearCart();

      Alert.alert(
        "✅ Pedido creado",
        "Tu pedido ha sido creado correctamente",
        [
          {
            text: "Ver historial",
            onPress: () => {
              router.push("/screens/tabs/HistorialScreen");
            },
          },
          {
            text: "Seguir comprando",
            onPress: () => {
              router.push("/screens/tabs/HomeCatalogoScreen");
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

  // Estado vacío
  if (cart.items.length === 0) {
    return (
      <SafeAreaContainer backgroundColor="#f5f5f5">
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Carrito de compras</Text>
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Tu carrito está vacío</Text>
          <Text style={styles.emptySubtext}>
            Agrega productos para continuar
          </Text>
        </View>
      </SafeAreaContainer>
    );
  }

  return (
    <SafeAreaContainer backgroundColor="#f5f5f5">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Carrito de compras</Text>
      </View>

      {/* Lista */}
      <FlatList
        data={cart.items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={styles.listContent}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.deliveryText}>Seleccione hora de entrega</Text>

        <TouchableOpacity
          style={styles.timeBox}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.timeText}>
            {deliveryTime ? formatTime(deliveryTime) : "Seleccionar"}
          </Text>
          <Ionicons name="pencil-outline" size={20} color="#001E60" />
        </TouchableOpacity>

        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>
            ${cart.total.toLocaleString()}
          </Text>
        </View>

        <Button
          title={loading ? "Creando pedido..." : "Finalizar pedido"}
          onPress={handleCheckout}
          disabled={loading || !deliveryTime}
        />
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={deliveryTime || new Date()}
          mode="time"
          display="spinner"
          onChange={handleDatePicked}
        />
      )}
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: "white",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#001E60",
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: 260, // espacio suficiente para footer
  },
  itemCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    flexDirection: "row",
    gap: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  imageContainer: {
    width: 85,
    height: 85,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#001E60",
  },
  itemPrice: {
    fontSize: 14,
    color: "#001E60",
    fontWeight: "700",
    marginTop: 4,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 10,
  },
  quantityButton: {
    width: 28,
    height: 28,
    backgroundColor: "#e6e6e6",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#001E60",
    minWidth: 20,
    textAlign: "center",
  },
  deleteButton: {
    marginLeft: "auto",
    padding: 4,
  },
  footer: {
    backgroundColor: "white",
    padding: 16,
    paddingBottom: 120, // hace que el botón no se esconda detrás de la navbar
    borderTopWidth: 1,
    borderTopColor: "#eee",
    gap: 12,
  },
  deliveryText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#001E60",
  },
  timeBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  timeText: {
    fontSize: 22,
    color: "#001E60",
    fontWeight: "700",
  },
  totalBox: {
    backgroundColor: "#001E60",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalLabel: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  totalValue: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
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
});
