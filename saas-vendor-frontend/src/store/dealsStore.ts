import { create } from 'zustand'
import { Deal } from '../types/api.types'
import { dealService } from '../services'

interface DealsState {
  deals: Deal[]
  currentDeal: Deal | null
  isLoading: boolean
  error: string | null
  pagination: { page: number; limit: number; total: number }

  // Actions
  fetchDeals: (page?: number, limit?: number) => Promise<void>
  fetchDealDetail: (dealId: string) => Promise<void>
  clearError: () => void
  clearCurrentDeal: () => void
}

export const useDealsStore = create<DealsState>((set) => ({
  deals: [],
  currentDeal: null,
  isLoading: false,
  error: null,
  pagination: { page: 1, limit: 10, total: 0 },

  fetchDeals: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null })
    try {
      const response = await dealService.getDeals(page, limit)
      set({
        deals: response.deals,
        pagination: { page, limit, total: response.total },
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch deals',
        isLoading: false,
      })
    }
  },

  fetchDealDetail: async (dealId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await dealService.getDealDetail(dealId)
      set({
        currentDeal: response.deal,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch deal details',
        isLoading: false,
      })
    }
  },

  clearError: () => {
    set({ error: null })
  },

  clearCurrentDeal: () => {
    set({ currentDeal: null })
  },
}))
