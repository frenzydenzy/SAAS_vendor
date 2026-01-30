import api from './api'
import * as Types from '../types/api.types'

export const dealService = {
  getDeals: async (page = 1, limit = 10): Promise<Types.DealsListResponse> => {
    const response = await api.get<Types.DealsListResponse>('/deals', {
      params: { page, limit },
    })
    return response.data
  },

  getDealDetail: async (slug: string): Promise<Types.DealDetailResponse> => {
    const response = await api.get<Types.DealDetailResponse>(`/deals/${slug}`)
    return response.data
  },

  createDeal: async (data: Types.CreateDealRequest): Promise<Types.CreateDealResponse> => {
    const response = await api.post<Types.CreateDealResponse>('/deals', data)
    return response.data
  },

  updateDeal: async (
    dealId: string,
    data: Types.UpdateDealRequest
  ): Promise<Types.UpdateDealResponse> => {
    const response = await api.put<Types.UpdateDealResponse>(
      `/deals/${dealId}`,
      data
    )
    return response.data
  },

  approveDeal: async (
    dealId: string
  ): Promise<Types.ApproveDealResponse> => {
    const response = await api.post<Types.ApproveDealResponse>(
      `/deals/${dealId}/approve`,
      {}
    )
    return response.data
  },
}
