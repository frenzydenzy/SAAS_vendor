import api from './api'
import * as Types from '../types/api.types'

export const adminService = {
  approveKYC: async (
    userId: string
  ): Promise<Types.ApproveKYCResponse> => {
    const response = await api.patch<Types.ApproveKYCResponse>(
      `/admin/kyc-requests/${userId}/approve`,
      {}
    )
    return response.data
  },

  rejectKYC: async (
    userId: string,
    rejectionReason: string
  ): Promise<Types.RejectKYCResponse> => {
    const response = await api.patch<Types.RejectKYCResponse>(
      `/admin/kyc-requests/${userId}/reject`,
      { rejectionReason }
    )
    return response.data
  },

  getStats: async (): Promise<Types.AdminStatsResponse> => {
    const response = await api.get<Types.AdminStatsResponse>('/admin/dashboard')
    return response.data
  },

  seedDeals: async (): Promise<any> => {
    const response = await api.post('/admin/seed-deals', {})
    return response.data
  },
}
