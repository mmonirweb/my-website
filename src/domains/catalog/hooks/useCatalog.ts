import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogService } from '../services/catalogService';
import { productService } from '../services/productService';
import { BrandFormData, CategoryFormData } from '../types';

export const useBrands = (page = 1, search = '') => {
  const queryClient = useQueryClient();

  const brandsQuery = useQuery({
    queryKey: ['brands', page, search],
    queryFn: () => catalogService.getBrands(page, search),
  });

  const createBrandMutation = useMutation({
    mutationFn: (data: BrandFormData) => catalogService.createBrand(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brands'] }),
  });

  const updateBrandMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BrandFormData }) =>
      catalogService.updateBrand(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brands'] }),
  });

  const deleteBrandMutation = useMutation({
    mutationFn: (id: number) => catalogService.deleteBrand(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brands'] }),
  });

  return {
    brandsQuery,
    createBrandMutation,
    updateBrandMutation,
    deleteBrandMutation,
  };
};

export const useCategories = (page = 1, search = '') => {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ['categories', page, search],
    queryFn: () => catalogService.getCategories(page, search),
  });

  const categoryTreeQuery = useQuery({
    queryKey: ['category-tree'],
    queryFn: () => catalogService.getCategoryTree(),
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: CategoryFormData) => catalogService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-tree'] });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryFormData }) =>
      catalogService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-tree'] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => catalogService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-tree'] });
    },
  });

  return {
    categoriesQuery,
    categoryTreeQuery,
    createCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation,
  };
};

export const useProducts = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getProducts(params),
  });
};

export const useProductMutations = () => {
  const queryClient = useQueryClient();

  const createProductMutation = useMutation({
    mutationFn: (formData: FormData) => productService.createProduct(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
      productService.updateProduct(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    createProductMutation,
    updateProductMutation,
    deleteProductMutation,
  };
};