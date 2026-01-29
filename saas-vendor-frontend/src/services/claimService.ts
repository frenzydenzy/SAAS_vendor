import api from './api'
import * as Types from '../types/api.types'

export const claimService = {
  createClaim: async (
    data: Types.CreateClaimRequest
  ): Promise<Types.CreateClaimResponse> => {
    const response = await api.post<Types.CreateClaimResponse>('/claim/create', data)
    return response.data
  },

  getClaims: async (): Promise<Types.UserClaimsListResponse> => {
    const response = await api.get<Types.UserClaimsListResponse>('/claim/get')
    return response.data
  },

  approveClaim: async (
    claimId: string
  ): Promise<Types.ApproveClaimResponse> => {
    const response = await api.post<Types.ApproveClaimResponse>(
      `/claim/${claimId}/approve`,
      {}
    )
    return response.data
  },

  rejectClaim: async (
    claimId: string
  ): Promise<Types.RejectClaimResponse> => {
    const response = await api.post<Types.RejectClaimResponse>(
      `/claim/${claimId}/reject`,
      {}
    )
    return response.data
  },
}
