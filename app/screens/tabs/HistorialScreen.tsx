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
import { useData } from "../../../contexts/DataContext";
import { useOrder } from "../../../contexts/OrderContext";

// ---------- Tipos para la FlatList ----------

type SectionItem = {
  type: "section";
  title: string;
};

type OrderListItem = {
  type: "order";
  data: any; // si tienes tipo Order, úsalo aquí
  group: "inProgress" | "completed";
};

type ListItem = SectionItem | OrderListItem;

// ---------- Helpers ----------

// Nombre de sucursal: branch_id del pedido -> branches.id -> branches.name
const getRestaurantName = (order: any, branches: any[]): string => {
  const branch = branches?.find((b: any) => b.id === order.branch_id);

  if (branch && typeof branch.name === "string" && branch.name.trim().length) {
    return branch.name; // p.ej. "Sucursal Norte"
  }

  // Por si en algún momento incluyes el nombre directamente en el pedido
  const fallback =
    order.branch_name ||
    order.sucursal ||
    order.restaurant_name ||
    order.place_name;

  if (typeof fallback === "string" && fallback.trim().length) {
    return fallback;
  }

  return "Sucursal";
};

// Nombre de producto desde la info del item
const getProductName = (item: any): string => {
  const candidates = [
    item.product?.name,
    item.product_name,
    item.name,
    item.title,
    item.nombre_producto,
  ];

  const found = candidates.find(
    (v) => typeof v === "string" && v.trim().length > 0
  );

  return (found as string) || "Producto";
};

// ---------- Card de cada pedido ----------

interface OrderItemCardProps {
  order: any;
  onCancel: (orderId: string) => void;
  isLoading: boolean;
  isCompleted?: boolean;
  branches: any[];
}

const OrderItemCard = ({
  order,
  onCancel,
  isLoading,
  isCompleted = false,
  branches,
}: OrderItemCardProps) => {
  const statusLabels: { [key: string]: string } = {
    pending: "Pendiente",
    cooking: "Cooking",
    ready: "Listo",
    completed: "Entregado",
    cancelled: "Cancelado",
  };

  const formatDeliveryTime = (dateString?: string) => {
    if (!dateString) return "No especificada";
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const canCancel =
    !isCompleted && (order.status === "pending" || order.status === "cooking");

  const restaurantName = getRestaurantName(order, branches);

  // ---------- Card de pedidos FINALIZADOS (gris, dos columnas) ----------
  if (isCompleted) {
    return (
      <View style={[styles.orderCard, styles.orderCardCompleted]}>
        <View style={styles.completedRow}>
          <View style={styles.completedLeft}>
            <Text style={styles.restaurantNameSmall}>{restaurantName}</Text>
            <Text style={styles.completedText}>
              Hora de entrega: {formatDeliveryTime(order.delivery_time)}
            </Text>
            <Text style={styles.completedText}>
              Precio: ${order.total.toLocaleString()}
            </Text>
            <Text style={styles.completedText}>
              Estado: {statusLabels[order.status] ?? order.status}
            </Text>
          </View>
          <View style={styles.completedRight}>
            <Text style={styles.productsChosenTitle}>Productos elegidos</Text>
            {order.order_items?.map((item: any, index: number) => (
              <Text key={index} style={styles.bulletTextSmall}>
                • {getProductName(item)}
              </Text>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // ---------- Card de pedidos EN CURSO (blanco, borde, botón X) ----------
  return (
    <View style={styles.orderCard}>
      {/* Encabezado: nombre restaurante + botón cancelar */}
      <View style={styles.cardHeaderRow}>
        <Text style={styles.restaurantName}>{restaurantName}</Text>

        {canCancel && (
          <TouchableOpacity
            onPress={() => onCancel(order.id)}
            disabled={isLoading}
            style={styles.cancelContainer}
          >
            <View style={styles.cancelSquare}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Ionicons name="close" size={18} color="#000" />
              )}
            </View>
            <Text style={styles.cancelLabel}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de productos en bullets */}
      {order.order_items?.length > 0 && (
        <View style={styles.itemsBlock}>
          <Text style={styles.sectionLabel}>Pedido</Text>
          <View style={styles.itemsBullets}>
            {order.order_items.map((item: any, index: number) => (
              <Text key={index} style={styles.bulletText}>
                • {getProductName(item)}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Información de precio, estado y hora de entrega */}
      <Text style={styles.infoLine}>
        <Text style={styles.infoLabel}>Precio: </Text>
        <Text style={styles.infoValue}>${order.total.toLocaleString()}</Text>
      </Text>

      <Text style={styles.infoLine}>
        <Text style={styles.infoLabel}>Estado: </Text>
        <Text style={styles.infoValue}>
          {statusLabels[order.status] ?? order.status}
        </Text>
      </Text>

      <Text style={styles.infoLine}>
        <Text style={styles.infoLabel}>Hora de entrega: </Text>
        <Text style={styles.infoValue}>
          {formatDeliveryTime(order.delivery_time)}
        </Text>
      </Text>
    </View>
  );
};

// ---------- Pantalla principal ----------

export default function HistorialScreen() {
  const { orders, loading, getUserOrders, cancelOrder } = useOrder();
  const { branches } = useData();
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

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
        text: "Volver",
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
      {/* Header igual al del carrito */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historial de pedidos</Text>
      </View>

      {loading && orders.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#001E60" />
        </View>
      ) : orders.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList<ListItem>
          style={styles.list}
          data={[
            { type: "section", title: "En curso" },
            ...inProgressOrders.map(
              (o): OrderListItem => ({
                type: "order",
                data: o,
                group: "inProgress",
              })
            ),
            ...(completedOrders.length > 0
              ? ([{ type: "section", title: "Finalizados" }] as SectionItem[])
              : []),
            ...completedOrders.map(
              (o): OrderListItem => ({
                type: "order",
                data: o,
                group: "completed",
              })
            ),
          ]}
          keyExtractor={(item) =>
            item.type === "section"
              ? `section-${item.title}`
              : (item as OrderListItem).data.id
          }
          renderItem={({ item }) => {
            if (item.type === "section") {
              const isFirst = item.title === "En curso";
              return (
                <View
                  style={
                    isFirst
                      ? styles.sectionHeaderPrimary
                      : styles.sectionHeaderSecondary
                  }
                >
                  {!isFirst && <View style={styles.sectionDivider} />}
                  <Text
                    style={
                      isFirst
                        ? styles.sectionTitlePrimary
                        : styles.sectionTitleSecondary
                    }
                  >
                    {item.title}
                  </Text>
                </View>
              );
            }

            const orderItem = item as OrderListItem;

            return (
              <View style={styles.orderWrapper}>
                <OrderItemCard
                  order={orderItem.data}
                  onCancel={handleCancel}
                  isLoading={cancellingId === orderItem.data.id}
                  isCompleted={orderItem.group === "completed"}
                  branches={branches}
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

// ---------- Estilos ----------

const styles = StyleSheet.create({
  // Header igual al del carrito
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

  list: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // 👇 paddingBottom grande para que puedas scrollear por encima de la bottom-tab
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: 120,
  },

  sectionHeaderPrimary: {
    paddingHorizontal: 4,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionHeaderSecondary: {
    paddingHorizontal: 4,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginBottom: 6,
  },
  sectionTitlePrimary: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  sectionTitleSecondary: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  orderWrapper: {
    marginBottom: 12,
  },

  // Cards
  orderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#d4d4d4",
  },
  // FINALIZADOS EN GRIS MARCADO
  orderCardCompleted: {
    backgroundColor: "#f3f3f3",
    borderColor: "#c8c8c8",
  },

  // En curso
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  cancelContainer: {
    alignItems: "center",
  },
  cancelSquare: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
    marginBottom: 2,
  },
  cancelLabel: {
    fontSize: 12,
    color: "#000",
  },
  itemsBlock: {
    marginTop: 4,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: "#000",
  },
  itemsBullets: {
    paddingLeft: 8,
  },
  bulletText: {
    fontSize: 13,
    color: "#000",
    marginBottom: 2,
  },
  infoLine: {
    fontSize: 13,
    marginTop: 2,
  },
  infoLabel: {
    fontWeight: "700",
    color: "#000",
  },
  infoValue: {
    color: "#000",
  },

  // Finalizados
  completedRow: {
    flexDirection: "row",
  },
  completedLeft: {
    flex: 1,
    paddingRight: 8,
  },
  completedRight: {
    flex: 1,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: "#d4d4d4",
  },
  restaurantNameSmall: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  completedText: {
    fontSize: 12,
    color: "#555",
    marginBottom: 2,
  },
  productsChosenTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#555",
    marginBottom: 4,
  },
  bulletTextSmall: {
    fontSize: 12,
    color: "#555",
    marginBottom: 2,
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
