import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FilterBarProps {
  filters: Array<{ id: string; label: string }>;
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
  showViewOptions?: boolean;
  viewMode?: "grid" | "branches";
  onViewModeChange?: (mode: "grid" | "branches") => void;
}

export default function FilterBar({
  filters,
  activeFilter,
  onFilterChange,
  showViewOptions = true,
  viewMode = "grid",
  onViewModeChange,
}: FilterBarProps) {
  return (
    <View style={styles.container}>
      {/* Opciones de vista */}
      {showViewOptions && (
        <View style={styles.viewOptionsContainer}>
          <TouchableOpacity
            style={[
              styles.viewOption,
              viewMode === "grid" && styles.activeViewOption,
            ]}
            onPress={() => onViewModeChange?.("grid")}
          >
            <Ionicons
              name="grid"
              size={20}
              color={viewMode === "grid" ? "#001E60" : "#999"}
            />
            <Text
              style={[
                styles.viewOptionText,
                viewMode === "grid" && styles.activeViewOptionText,
              ]}
            >
              Grid
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.viewOption,
              viewMode === "branches" && styles.activeViewOption,
            ]}
            onPress={() => onViewModeChange?.("branches")}
          >
            <Ionicons
              name="layers"
              size={20}
              color={viewMode === "branches" ? "#001E60" : "#999"}
            />
            <Text
              style={[
                styles.viewOptionText,
                viewMode === "branches" && styles.activeViewOptionText,
              ]}
            >
              Sucursales
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filtros */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              activeFilter === filter.id && styles.activeFilter,
            ]}
            onPress={() => onFilterChange(filter.id)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter.id && styles.activeFilterText,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  viewOptionsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  viewOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    gap: 6,
  },
  activeViewOption: {
    backgroundColor: "#E8F0FE",
  },
  viewOptionText: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  activeViewOptionText: {
    color: "#001E60",
  },
  filterScroll: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  filterContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  activeFilter: {
    backgroundColor: "#001E60",
  },
  filterText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  activeFilterText: {
    color: "white",
  },
});
