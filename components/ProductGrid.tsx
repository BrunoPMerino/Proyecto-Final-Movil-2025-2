import React from "react";
import { FlatList, StyleSheet } from "react-native";
import ProductCard from "./ProductCard";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url?: string;
  image_url_public?: string | null;
  is_available: boolean;
  category_id: string;
  branch_id: string;
}

interface ProductGridProps {
  products: Product[];
  onProductPress: (product: Product) => void;
  numColumns?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export default function ProductGrid({
  products,
  onProductPress,
  numColumns = 2,
  refreshing = false,
  onRefresh,
}: ProductGridProps) {
  const renderProductCard = ({ item }: { item: Product }) => (
    <ProductCard
      id={item.id}
      name={item.name}
      description={item.description}
      price={item.price}
      imageUrl={item.image_url_public ?? undefined}
      stock={item.stock}
      onPress={() => onProductPress(item)}
      style={{ flex: 1, marginHorizontal: 4 }}
    />
  );

  return (
    <FlatList
      data={products}
      renderItem={renderProductCard}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={styles.listContent}
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});
