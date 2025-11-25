import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  View
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import BranchDetailsCard from "../../../components/BranchDetailsCard";
import SafeAreaContainer from "../../../components/SafeAreaContainer";
import { useData } from "../../../contexts/DataContext";
import { useLocation } from "../../../utils/useLocation";

interface Branch {
  id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
}

export default function MapaScreen() {
  const { branches, loadBranches } = useData();
  const { location, errorMsg, loading: locationLoading } = useLocation();
  const [mapReady, setMapReady] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  useEffect(() => {
    loadBranches();
  }, []);

  // Mostrar error si no se puede obtener la ubicación
  useEffect(() => {
    if (errorMsg) {
      Alert.alert(
        "Ubicación no disponible",
        "No se pudo obtener tu ubicación. Aún puedes ver las sucursales en el mapa.",
        [{ text: "OK" }]
      );
    }
  }, [errorMsg]);

  // Calcular región inicial basada en las sucursales o ubicación del usuario
  const getInitialRegion = () => {
    // Si hay sucursales con coordenadas, centrar en la primera
    const branchWithCoords = branches.find(
      (b) => b.latitude && b.longitude
    );
    
    if (branchWithCoords && branchWithCoords.latitude && branchWithCoords.longitude) {
      return {
        latitude: branchWithCoords.latitude,
        longitude: branchWithCoords.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }

    // Si hay ubicación del usuario, centrar ahí
    if (location) {
      return {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }

    // Por defecto, centrar en Bogotá, Colombia
    return {
      latitude: 4.6097,
      longitude: -74.0817,
      latitudeDelta: 0.15,
      longitudeDelta: 0.15,
    };
  };

  if (locationLoading) {
    return (
      <SafeAreaContainer backgroundColor="#f5f5f5" paddingHorizontal={0}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#001E60" />
          <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
        </View>
      </SafeAreaContainer>
    );
  }

  return (
    <SafeAreaContainer backgroundColor="#f5f5f5" paddingHorizontal={0}>
      <View style={styles.header}>
        <Ionicons name="map" size={28} color="#001E60" />
        <Text style={styles.title}>Mapa de Sucursales</Text>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={getInitialRegion()}
          showsUserLocation={!!location}
          showsMyLocationButton={!!location}
          showsCompass={true}
          onMapReady={() => setMapReady(true)}
        >
          {/* Marcadores de sucursales */}
          {branches.map((branch) => {
            if (!branch.latitude || !branch.longitude) return null;

            return (
              <Marker
                key={branch.id}
                coordinate={{
                  latitude: branch.latitude,
                  longitude: branch.longitude,
                }}
                title={branch.name}
                description={branch.address || "Sucursal"}
                onPress={() => setSelectedBranch(branch)}
              >
                <View
                  style={[
                    styles.customMarker,
                    selectedBranch?.id === branch.id &&
                      styles.customMarkerSelected,
                  ]}
                >
                  <Image
                    source={
                      selectedBranch?.id === branch.id
                        ? require("../../../assets/images/map icons/ubicacionIn.png")
                        : require("../../../assets/images/map icons/ubicacionOut.png")
                    }
                    style={styles.markerImage}
                    resizeMode="contain"
                  />
                </View>
              </Marker>
            );
          })}
        </MapView>

        {/* Indicador de sucursales - Solo mostrar si no hay sucursal seleccionada */}
        {!selectedBranch && (
          <View style={styles.infoCard}>
            <Ionicons name="location" size={20} color="#001E60" />
            <Text style={styles.infoText}>
              {branches.filter((b) => b.latitude && b.longitude).length}{" "}
              sucursales disponibles
            </Text>
          </View>
        )}

        {/* Branch Details Card */}
        <BranchDetailsCard
          branch={selectedBranch}
          visible={!!selectedBranch}
          onClose={() => setSelectedBranch(null)}
        />
      </View>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  customMarker: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  customMarkerSelected: {
    transform: [{ scale: 1.2 }],
  },
  markerImage: {
    width: 40,
    height: 40,
  },
  infoCard: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
});
