import { apiClient } from '@/lib/axios';
import { TaxRate, Unit, TaxRateInput, UnitInput } from '../types/catalog';

// Tax Rates API
export const taxRateService = {
  async getTaxRates(): Promise<{ status: string; data: TaxRate[] }> {
    const response = await apiClient.get('/catalog/tax-rates');
    return response.data;
  },

  async getTaxRate(id: number): Promise<{ status: string; data: TaxRate }> {
    const response = await apiClient.get(`/catalog/tax-rates/${id}`);
    return response.data;
  },

  async createTaxRate(data: TaxRateInput): Promise<{ status: string; message: string; data: TaxRate }> {
    const response = await apiClient.post('/catalog/tax-rates', data);
    return response.data;
  },

  async updateTaxRate(id: number, data: TaxRateInput): Promise<{ status: string; message: string; data: TaxRate }> {
    const response = await apiClient.put(`/catalog/tax-rates/${id}`, data);
    return response.data;
  },

  async deleteTaxRate(id: number): Promise<{ status: string; message: string }> {
    const response = await apiClient.delete(`/catalog/tax-rates/${id}`);
    return response.data;
  },
};

// Units API
export const unitService = {
  async getUnits(): Promise<{ status: string; data: Unit[] }> {
    const response = await apiClient.get('/catalog/units');
    return response.data;
  },

  async getUnit(id: number): Promise<{ status: string; data: Unit }> {
    const response = await apiClient.get(`/catalog/units/${id}`);
    return response.data;
  },

  async createUnit(data: UnitInput): Promise<{ status: string; message: string; data: Unit }> {
    const response = await apiClient.post('/catalog/units', data);
    return response.data;
  },

  async updateUnit(id: number, data: UnitInput): Promise<{ status: string; message: string; data: Unit }> {
    const response = await apiClient.put(`/catalog/units/${id}`, data);
    return response.data;
  },

  async deleteUnit(id: number): Promise<{ status: string; message: string }> {
    const response = await apiClient.delete(`/catalog/units/${id}`);
    return response.data;
  },
};