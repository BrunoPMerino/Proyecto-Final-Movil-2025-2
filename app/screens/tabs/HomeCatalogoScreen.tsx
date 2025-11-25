import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

type WeatherData = {
  temperature: number;
  windspeed: number;
  time: string;
  isDay: boolean;
};

export default function HomeCatalogoScreen() {
  const router = useRouter();
  const {
    products,
    branches,
    loadAllProducts,
    loadBranches,
    loading,
    error,
  } = useData();

  const [refreshing, setRefreshing] = React.useState(false);
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "branches">("branches");
  const [activeFilter, setActiveFilter] = useState("todos");

  // ESTADO DEL CLIMA
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // --------- Cargar productos + sucursales ----------
  useEffect(() => {
    loadAllProducts();
    loadBranches();
  }, []);

  // --------- Fetch de clima (Open-Meteo) ----------
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setWeatherLoading(true);
        setWeatherError(null);

        const url =
          "https://api.open-meteo.com/v1/forecast?latitude=4.8619&longitude=-74.0325&current_weather=true&timezone=auto";

        const res = await fetch(url);
        const data = await res.json();

        if (!data.current_weather) {
          throw new Error("No se encontró información de clima.");
        }

        const cw = data.current_weather;
        setWeather({
          temperature: cw.temperature,
          windspeed: cw.windspeed,
          time: cw.time,
          isDay: cw.is_day === 1 || cw.is_day === true,
        });
      } catch (err) {
        console.error("[HomeCatalogoScreen] Error cargando clima:", err);
        setWeatherError("No se pudo cargar el clima.");
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
  }, []);

  // --------- Lógica de productos / filtros ----------
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchText.toLowerCase()) ||
      product.description.toLowerCase().includes(searchText.toLowerCase());

    const matchesFilter =
      activeFilter === "todos" || product.category_id === activeFilter;

    return matchesSearch && matchesFilter;
  });

  // Mapeo simple para mostrar nombres bonitos en filtros
  const categoryLabels: Record<string, string> = {
    burgers: "Hamburguesas",
    drinks: "Bebidas",
    desserts: "Postres",
    snacks: "Snacks",
  };

  const filterOptions = [
    { id: "todos", label: "Todos" },
    ...Array.from(
      new Map(
        products.map((p) => [
          p.category_id,
          {
            id: p.category_id,
            label: categoryLabels[p.category_id] || p.category_id,
          },
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
      pathname: "./modals/ProductDetailsScreen",
      params: {
        productId: product.id,
        productName: product.name,
      },
    });
  };

  // ================== RENDER ==================
  return (
    <SafeAreaContainer backgroundColor="#ffffff">
      {/* HEADER (menos padding) */}
      <View style={styles.header}>
        <Header />
      </View>

      {/* CLIMA */}
      <View style={styles.weatherWrapper}>
        {weatherLoading && (
          <View style={styles.weatherBox}>
            <ActivityIndicator size="small" color="#001E60" />
            <Text style={styles.weatherMini}>Cargando clima...</Text>
          </View>
        )}

        {!weatherLoading && weather && (
          <View style={styles.weatherBox}>
            <Ionicons
              name={weather.isDay ? "sunny-outline" : "moon-outline"}
              size={26}
              color="#001E60"
              style={{ marginRight: 10 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.weatherTitle}>Clima en la Universidad</Text>
              <Text style={styles.weatherTemp}>
                {weather.temperature.toFixed(1)}°C
              </Text>
              <Text style={styles.weatherMini}>
                Viento: {weather.windspeed.toFixed(1)} km/h
              </Text>
            </View>
          </View>
        )}

        {!weatherLoading && weatherError && (
          <View style={styles.weatherBox}>
            <Ionicons
              name="warning-outline"
              size={22}
              color="#c33"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.weatherMini}>{weatherError}</Text>
          </View>
        )}
      </View>

      {/* BUSCADOR */}
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Buscar productos..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* TÍTULO FILTROS */}
      <Text style={styles.filterTitle}>Filtros</Text>

      {/* BARRA DE FILTROS */}
      <FilterBar
        filters={filterOptions}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewOptions={false}
      />

      {/* ERRORES DE PRODUCTOS */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={20} color="#c33" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* LISTADO / CONTENIDO PRINCIPAL */}
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
    paddingTop: 4,
    paddingBottom: 4,
    backgroundColor: "white",
  },

  weatherWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    backgroundColor: "white",
  },
  weatherBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f6ff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  weatherTitle: {
    fontSize: 13,
    color: "#001E60",
    fontWeight: "600",
  },
  weatherTemp: {
    fontSize: 18,
    fontWeight: "700",
    color: "#001E60",
  },
  weatherMini: {
    fontSize: 12,
    color: "#444",
  },

  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 4,
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

  // ---- ERROR (para que no dé el error de TypeScript) ----
  errorContainer: {
    backgroundColor: "#fee",
    borderLeftWidth: 4,
    borderLeftColor: "#c33",
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  errorText: {
    color: "#c33",
    fontSize: 14,
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

