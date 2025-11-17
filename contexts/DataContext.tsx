import React, { createContext, ReactNode, useContext, useState } from "react";
import { getAllProducts, getProducts } from "../api/productsApi";
import { getPublicUrl } from "../api/storageApi";
import { supabase } from "../utils/supabase";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  image_url_public?: string | null;
  is_available: boolean;
  category_id: string;
  branch_id: string;
}

interface Branch {
  id: string;
  name: string;
}

interface DataContextType {
  products: Product[];
  categories: any[];
  branches: Branch[];
  currentBranchId: string | null;
  setCurrentBranchId: (id: string) => void;
  loadProducts: (branchId: string) => Promise<void>;
  loadAllProducts: () => Promise<void>;
  loadBranches: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentBranchId, setCurrentBranchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todas las sucursales
  const loadBranches = async () => {
    try {
      const { data, error: err } = await supabase
        .from("branches")
        .select("id, name")
        .limit(10);

      if (err) throw err;
      if (data && data.length > 0) {
        setBranches(data);
        setCurrentBranchId(data[0].id); // Seleccionar la primera sucursal por defecto
      }
    } catch (err: any) {
      console.error("Error loading branches:", err);
      setError("No se pudieron cargar las sucursales");
    }
  };

  // Cargar productos de una sucursal específica
  const loadProducts = async (branchId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts(branchId);

      const normalized = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        stock: item.stock,
        image_url: item.image_url,
        is_available: item.is_available,
        category_id: item.category_id,
        branch_id: item.branch_id ?? branchId,
      }));

      setProducts(normalized);
    } catch (err: any) {
      setError(err.message || "Error al cargar productos");
      console.error("Error loading productos:", err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar productos de TODAS las sucursales
  const loadAllProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllProducts();

      const normalized = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        stock: item.stock,
        image_url: item.image_url,
        image_url_public: item.image_url ? getPublicUrl(item.image_url) : null,
        is_available: item.is_available,
        category_id: item.category_id,
        branch_id: item.branch_id,
      }));

      setProducts(normalized);
    } catch (err: any) {
      setError(err.message || "Error al cargar productos");
      console.error("Error loading all products:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DataContext.Provider
      value={{
        products,
        categories,
        branches,
        currentBranchId,
        setCurrentBranchId,
        loadProducts,
        loadAllProducts,
        loadBranches,
        loading,
        error,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
