import api from './api'
import * as Types from '../types/api.types'

export const dealService = {
  getDeals: async (page = 1, limit = 10): Promise<Types.DealsListResponse> => {
    const response = await api.get<Types.DealsListResponse>('/deal/list', {
      params: { page, limit },
    })
    return response.data
  },

  getDealDetail: async (dealId: string): Promise<Types.DealDetailResponse> => {
    const response = await api.get<Types.DealDetailResponse>(`/deal/${dealId}`)
    return response.data
  },

  createDeal: async (data: Types.CreateDealRequest): Promise<Types.CreateDealResponse> => {
    const response = await api.post<Types.CreateDealResponse>('/deal/create', data)
    return response.data
  },

  updateDeal: async (
    dealId: string,
    data: Types.UpdateDealRequest
  ): Promise<Types.UpdateDealResponse> => {
    const response = await api.patch<Types.UpdateDealResponse>(
      `/deal/${dealId}`,
      data
    )
    return response.data
  },

  approveDeal: async (
    dealId: string
  ): Promise<Types.ApproveDealResponse> => {
    const response = await api.post<Types.ApproveDealResponse>(
      `/deal/${dealId}/approve`,
      {}
    )
    return response.data
  },
}
