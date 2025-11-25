import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import BranchProductsView from "../../../components/BranchProductsView";
import FilterBar from "../../../components/FilterBar";
import Header from "../../../components/Header";
import SafeAreaContainer from "../../../components/SafeAreaContainer";
import SearchBar from "../../../components/SearchBar";
import { useData } from "../../../contexts/DataContext";

export default function HomeCatalogoScreen() {
  const router = useRouter();
  const { branchId } = useLocalSearchParams<{ branchId?: string }>();

  const { products, branches, loadAllProducts, loadBranches, loading, error } =
    useData();

  const [refreshing, setRefreshing] = React.useState(false);
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "branches">("branches");
  const [activeFilter, setActiveFilter] = useState("todos");
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  // Cargar productos y sucursales al montar
  useEffect(() => {
    loadAllProducts();
    loadBranches();
  }, []);

  // Si venimos desde el QR con un branchId, lo guardamos
  useEffect(() => {
    if (typeof branchId === "string") {
      setSelectedBranchId(branchId);
    }
  }, [branchId]);

  // ---------- Helpers ----------

  // Mapa id -> nombre de categoría para que el filtro no muestre IDs raros
  const categoryMap = new Map<string, string>();
  products.forEach((p: any) => {
    if (!p.category_id) return;
    const label =
      p.category_name ||            // si tu DataContext lo trae así
      p.category?.name ||           // si viene anidado en category
      String(p.category_id);        // fallback (último recurso)

    if (!categoryMap.has(p.category_id)) {
      categoryMap.set(p.category_id, label);
    }
  });

  // Crear opciones de filtro desde categorías
  const filterOptions = [
    { id: "todos", label: "Todos" },
    ...Array.from(categoryMap.entries()).map(([id, label]) => ({
      id,
      label,
    })),
  ];

  // Filtrar productos según búsqueda, filtro y sucursal
  const filteredProducts = products.filter((product: any) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchText.toLowerCase()) ||
      product.description.toLowerCase().includes(searchText.toLowerCase());

    const matchesFilter =
      activeFilter === "todos" || product.category_id === activeFilter;

    const matchesBranch =
      !selectedBranchId || product.branch_id === selectedBranchId;

    return matchesSearch && matchesFilter && matchesBranch;
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllProducts();
    setRefreshing(false);
  };

  const handleProductPress = (product: any) => {
    router.push({
      pathname: "./modals/ProductDetailsScreen",
      params: {
        productId: product.id,
        productName: product.name,
      },
    });
  };

  return (
    <SafeAreaContainer backgroundColor="#ffffff">
      {/* Header (menos padding para que se vea más contenido) */}
      <View style={styles.header}>
        <Header />
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Buscar productos..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Título "Filtros" */}
      <Text style={styles.filterTitle}>Filtros</Text>

      {/* Chips de filtro horizontales (con nombres bonitos) */}
      <FilterBar
        filters={filterOptions}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
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
        // Vista por sucursales: si viene branchId del QR solo se verá esa
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
    paddingVertical: 6, // 🔹 antes era 12, ahora menos padding
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
});
