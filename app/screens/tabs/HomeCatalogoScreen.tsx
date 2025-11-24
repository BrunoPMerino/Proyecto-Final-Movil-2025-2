import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View
} from "react-native";
import BranchProductsView from "../../../components/BranchProductsView";
import FilterBar from "../../../components/FilterBar";
import Header from "../../../components/Header";
import SafeAreaContainer from "../../../components/SafeAreaContainer";
import SearchBar from "../../../components/SearchBar";
import { useData } from "../../../contexts/DataContext";

export default function HomeCatalogoScreen() {
  const router = useRouter();
  const { products, branches, loadAllProducts, loadBranches, loading, error } =
    useData();
  const [refreshing, setRefreshing] = React.useState(false);
  const [searchText, setSearchText] = useState("");
  // mantenemos el estado por compatibilidad con FilterBar,
  // pero la app siempre mostrará la vista por sucursales
  const [viewMode, setViewMode] = useState<"grid" | "branches">("branches");
  const [activeFilter, setActiveFilter] = useState("todos");

  // Cargar productos y sucursales al montar
  useEffect(() => {
    loadAllProducts();
    loadBranches();
  }, []);

  // Filtrar productos según búsqueda y filtro
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchText.toLowerCase()) ||
      product.description.toLowerCase().includes(searchText.toLowerCase());

    const matchesFilter =
      activeFilter === "todos" || product.category_id === activeFilter;

    return matchesSearch && matchesFilter;
  });

  // Crear opciones de filtro desde categorías
  const filterOptions = [
    { id: "todos", label: "Todos" },
    ...Array.from(
      new Map(
        products.map((p) => [
          p.category_id,
          { id: p.category_id, label: p.category_id },
        ])
      ).values()
    ),
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllProducts();
    setRefreshing(false);
  };

  const handleProductPress = (product: any) => {
    router.push({
      pathname: "/screens/modals/ProductDetailsScreen",
      params: {
        productId: product.id,
        productName: product.name,
      },
    });
  };

  return (
    <SafeAreaContainer backgroundColor="#ffffff">
      {/* Header azul con logo y título, como en el Figma */}
      <View style={styles.header}>
        <Header />
      </View>

      {/* Barra de búsqueda: opcional pero alineada al estilo limpio */}
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Buscar productos..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Título "Filtros" como en el diseño */}
      <Text style={styles.filterTitle}>Filtros</Text>

      {/* Chips de filtro horizontales */}
      <FilterBar
        filters={filterOptions}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        // ocultamos las opciones de cambiar entre grid / lista
        showViewOptions={false}
      />

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={20} color="#c33" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#001E60" />
          <Text style={styles.loadingText}>Cargando productos...</Text>
        </View>
      ) : filteredProducts.length === 0 && !error ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="basket-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No hay productos disponibles</Text>
        </View>
      ) : (
        // Vista por sucursales, como en la pantalla de Figma
        <BranchProductsView
          products={filteredProducts}
          branches={branches}
          onProductPress={handleProductPress}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: "white",
  },
  filterTitle: {
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 4,
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
  },
  errorContainer: {
    backgroundColor: "#fee",
    borderLeftWidth: 4,
    borderLeftColor: "#c33",
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    color: "#c33",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
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
    paddingBottom: 80,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 12,
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    paddingBottom: 80,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});
