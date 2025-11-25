import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface Branch {
  id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  descriptionbranch?: string;
}

interface BranchDetailsCardProps {
  branch: Branch | null;
  onClose: () => void;
  visible: boolean;
}

export default function BranchDetailsCard({
  branch,
  onClose,
  visible,
}: BranchDetailsCardProps) {
  const slideAnim = React.useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    if (visible && branch) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, branch]);

  if (!branch) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="restaurant" size={24} color="#FF6B35" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>{branch.name}</Text>
            {branch.address && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {branch.address}
              </Text>
            )}
          </View>
        </View>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close-circle" size={28} color="#999" />
        </Pressable>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Details */}
      <View style={styles.details}>
        {/* Descripción */}
        {branch.descriptionbranch && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>{branch.descriptionbranch}</Text>
          </View>
        )}

        {/* Dirección completa */}
        {branch.address && (
          <View style={styles.detailRow}>
            <Ionicons name="map-outline" size={20} color="#666" />
            <Text style={styles.detailText}>{branch.address}</Text>
          </View>
        )}

        {/* Coordenadas */}
        {branch.latitude && branch.longitude && (
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.detailText}>
              {branch.latitude.toFixed(4)}, {branch.longitude.toFixed(4)}
            </Text>
          </View>
        )}

        {/* Placeholder para información adicional */}
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={20} color="#666" />
          <Text style={styles.detailText}>Lun - Dom: 10:00 AM - 10:00 PM</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={20} color="#666" />
          <Text style={styles.detailText}>+57 (1) 234-5678</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Pressable 
          style={styles.actionButton}
          onPress={() => {
            Linking.openURL('https://www.google.com/maps/place/Universidad+de+La+Sabana/@4.8617826,-74.0372174,16z/data=!4m6!3m5!1s0x8e3f87fe88d0dcd1:0x590e68a0f80af0a4!8m2!3d4.8615787!4d-74.0325368!16s%2Fg%2F11bc5ltjpg?entry=ttu&g_ep=EgoyMDI1MTEyMy4xIKXMDSoASAFQAw%3D%3D');
          }}
        >
          <Ionicons name="navigate" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Cómo llegar</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 120,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    maxHeight: "70%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF0EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#001E60",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  closeButton: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginBottom: 16,
  },
  details: {
    marginBottom: 20,
  },
  descriptionContainer: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    backgroundColor: "#001E60",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  actionButtonSecondary: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#001E60",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  actionButtonTextSecondary: {
    color: "#001E60",
    fontSize: 15,
    fontWeight: "600",
  },
});
