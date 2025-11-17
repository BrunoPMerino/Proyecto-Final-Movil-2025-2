import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../../components/Button";
import Header from "../../components/Header";

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { products, loadAllProducts, loadBranches, loading, error } = useData();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    // Cargar todas las sucursales y sus productos
    loadBranches();
    loadAllProducts();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllProducts();
    setRefreshing(false);
  };

  const handleProductPress = (product: any) => {
    router.push({
      pathname: "/(main)/product-details",
      params: { productId: product.id, productName: product.name },
    });
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const renderProductCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.7}
    >
      {item.image_url && (
        <Image source={{ uri: item.image_url }} style={styles.productImage} />
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>
            ${item.price.toLocaleString()}
          </Text>
          <Text
            style={[
              styles.stock,
              item.stock > 0 ? styles.inStock : styles.outOfStock,
            ]}
          >
            {item.stock > 0 ? `${item.stock} disponibles` : "Agotado"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header />

      {user && <Text style={styles.welcomeText}>Bienvenido, {user.email}</Text>}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Button title="Reintentar" onPress={handleRefresh} />
        </View>
      )}

      {loading && !refreshing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#001E60" />
          <Text style={styles.loadingText}>Cargando productos...</Text>
        </View>
      )}

      {!loading && products.length === 0 && !error && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay productos disponibles</Text>
        </View>
      )}

      {!loading && products.length > 0 && (
        <FlatList
          data={products}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}

      <View style={styles.footer}>
        <Button title="Cerrar Sesión" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  welcomeText: {
    fontSize: 14,
    color: "#666",
    marginHorizontal: 24,
    marginBottom: 16,
    fontWeight: "500",
  },
  errorContainer: {
    backgroundColor: "#fee",
    borderLeftWidth: 4,
    borderLeftColor: "#c33",
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  errorText: {
    color: "#c33",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 80,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  productCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: "100%",
    height: 140,
    backgroundColor: "#e0e0e0",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#001E60",
  },
  stock: {
    fontSize: 11,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  inStock: {
    color: "#2ecc71",
    backgroundColor: "#eefaf0",
  },
  outOfStock: {
    color: "#e74c3c",
    backgroundColor: "#fadbd8",
  },
  footer: {
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
});
