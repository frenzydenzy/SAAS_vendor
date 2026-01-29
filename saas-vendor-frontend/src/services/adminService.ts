import api from './api'
import * as Types from '../types/api.types'

export const adminService = {
  approveKYC: async (
    userId: string
  ): Promise<Types.ApproveKYCResponse> => {
    const response = await api.post<Types.ApproveKYCResponse>(
      `/admin/approve-kyc`,
      { userId }
    )
    return response.data
  },

  rejectKYC: async (
    userId: string
  ): Promise<Types.RejectKYCResponse> => {
    const response = await api.post<Types.RejectKYCResponse>(
      `/admin/reject-kyc`,
      { userId }
    )
    return response.data
  },

  getStats: async (): Promise<Types.AdminStatsResponse> => {
    const response = await api.get<Types.AdminStatsResponse>('/admin/stats')
    return response.data
  },
}
