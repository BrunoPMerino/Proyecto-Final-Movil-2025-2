import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SafeAreaContainer from "../../../components/SafeAreaContainer";
import { useOrder } from "../../../contexts/OrderContext";

interface OrderItemCardProps {
  order: any;
  onCancel: (orderId: string) => void;
  isLoading: boolean;
}

const OrderItemCard = ({ order, onCancel, isLoading }: OrderItemCardProps) => {
  const statusColors: { [key: string]: string } = {
    pending: "#FFA500",
    cooking: "#FF6B35",
    ready: "#4CAF50",
    completed: "#2196F3",
    cancelled: "#999",
  };

  const statusLabels: { [key: string]: string } = {
    pending: "Pendiente",
    cooking: "Preparando",
    ready: "Listo",
    completed: "Entregado",
    cancelled: "Cancelado",
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDeliveryTime = (dateString?: string) => {
    if (!dateString) return "No especificada";
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const canCancel = order.status === "pending" || order.status === "cooking";

  return (
    <View style={styles.orderCard}>
      {/* Encabezado: ID y estado */}
      <View style={styles.cardHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>Pedido #{order.id.slice(0, 8)}</Text>
          <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColors[order.status] },
          ]}
        >
          <Text style={styles.statusText}>{statusLabels[order.status]}</Text>
        </View>
      </View>

      {/* Items */}
      {order.order_items && order.order_items.length > 0 && (
        <View style={styles.itemsList}>
          {order.order_items.map((item: any, index: number) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.product_name}</Text>
                <Text style={styles.itemQty}>x{item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>
                ${(item.price_at_order * item.quantity).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Hora de entrega */}
      <View style={styles.deliveryInfo}>
        <Ionicons name="time-outline" size={16} color="#666" />
        <Text style={styles.deliveryText}>
          Entrega: {formatDeliveryTime(order.delivery_time)}
        </Text>
      </View>

      {/* Footer: Total y botón cancelar */}
      <View style={styles.cardFooter}>
        <Text style={styles.totalText}>${order.total.toLocaleString()}</Text>
        {canCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => onCancel(order.id)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#c33" />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={16} color="#c33" />
                <Text style={styles.cancelText}>Cancelar</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default function HistorialScreen() {
  const { orders, loading, getUserOrders, cancelOrder } = useOrder();
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Cargar pedidos cuando la pantalla se enfoca
  useFocusEffect(
    useCallback(() => {
      getUserOrders();
    }, [getUserOrders])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await getUserOrders();
    setRefreshing(false);
  };

  const handleCancel = (orderId: string) => {
    Alert.alert("¿Cancelar pedido?", "Esta acción no se puede deshacer", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Confirmar",
        style: "destructive",
        onPress: async () => {
          try {
            setCancellingId(orderId);
            await cancelOrder(orderId);
            Alert.alert("✅ Hecho", "Tu pedido ha sido cancelado");
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : "Error cancelando pedido";
            Alert.alert("❌ Error", message);
          } finally {
            setCancellingId(null);
          }
        },
      },
    ]);
  };

  // Separar en curso vs finalizados
  const inProgressOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "cooking"
  );
  const completedOrders = orders.filter(
    (o) => o.status === "completed" || o.status === "cancelled"
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={80} color="#ccc" />
      <Text style={styles.emptyText}>No hay pedidos</Text>
      <Text style={styles.emptySubtext}>Tus pedidos aparecerán aquí</Text>
    </View>
  );

  return (
    <SafeAreaContainer backgroundColor="#f5f5f5">
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historial de Pedidos</Text>
      </View>

      {loading && orders.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#001E60" />
        </View>
      ) : orders.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={[
            { type: "section", title: "En Curso" },
            ...inProgressOrders.map((o) => ({ type: "order", data: o })),
            ...(completedOrders.length > 0
              ? [{ type: "section", title: "Finalizados" }]
              : []),
            ...completedOrders.map((o) => ({ type: "order", data: o })),
          ]}
          keyExtractor={(item, index) => {
            if (item.type === "section") return `section-${item.title}`;
            return (item as any).data.id;
          }}
          renderItem={({ item }: { item: any }) => {
            if (item.type === "section") {
              return (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{item.title}</Text>
                </View>
              );
            }
            return (
              <View style={styles.orderWrapper}>
                <OrderItemCard
                  order={item.data}
                  onCancel={handleCancel}
                  isLoading={cancellingId === item.data.id}
                />
              </View>
            );
          }}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#001E60"]}
            />
          }
          ListEmptyComponent={renderEmpty}
        />
      )}
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  header: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  sectionHeader: {
    paddingHorizontal: 4,
    paddingVertical: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  orderWrapper: {
    marginBottom: 12,
  },
  orderCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 14,
    fontWeight: "700",
    color: "#001E60",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: "#999",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  itemsList: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  itemQty: {
    fontSize: 11,
    color: "#999",
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FF6B35",
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  deliveryText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF6B35",
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#c33",
    backgroundColor: "#fff5f5",
  },
  cancelText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#c33",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
