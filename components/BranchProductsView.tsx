import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import ProductGrid from "./ProductGrid";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  image_url_public?: string | null;
  category_id: string;
  // Campos opcionales de product_branches
  stock?: number;
  is_available?: boolean;
  branch_id?: string;
}

interface Branch {
  id: string;
  name: string;
}

interface BranchProductsViewProps {
  products: Product[];
  branches: Branch[];
  onProductPress: (product: Product) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export default function BranchProductsView({
  products,
  branches,
  onProductPress,
  refreshing = false,
  onRefresh,
}: BranchProductsViewProps) {
  // Agrupar productos por sucursal
  const productsByBranch = branches.map((branch) => ({
    branch,
    products: products.filter((p) => p.branch_id === branch.id),
  }));

  const renderBranchSection = ({ item }: any) => {
    const { branch, products: branchProducts } = item;

    if (branchProducts.length === 0) {
      return null;
    }

    return (
      <View style={styles.branchSection}>
        <Text style={styles.branchTitle}>{branch.name}</Text>
        <ProductGrid
          products={branchProducts}
          onProductPress={onProductPress}
          numColumns={2}
        />
      </View>
    );
  };

  return (
    <FlatList
      data={productsByBranch}
      renderItem={renderBranchSection}
      keyExtractor={(item) => item.branch.id}
      contentContainerStyle={styles.container}
      scrollEnabled={true}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingBottom: 80,
  },
  branchSection: {
    marginBottom: 24,
  },
  branchTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#001E60",
    marginHorizontal: 16,
    marginBottom: 12,
  },
});
