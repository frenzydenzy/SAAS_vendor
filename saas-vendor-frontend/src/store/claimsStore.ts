import { create } from 'zustand'
import { Claim } from '../types/api.types'
import { claimService } from '../services/claimService'

interface ClaimsState {
  claims: Claim[]
  isLoading: boolean
  error: string | null

  // Actions
  fetchClaims: () => Promise<void>
  createClaim: (dealId: string) => Promise<void>
  approveClaim: (claimId: string) => Promise<void>
  rejectClaim: (claimId: string) => Promise<void>
  clearError: () => void
}

// By using create<ClaimsState>, 'set' and 'get' should be automatically typed.
// If error persists, ensure your TS version is 4.5+
export const useClaimsStore = create<ClaimsState>((set) => ({
  claims: [],
  isLoading: false,
  error: null,

  fetchClaims: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await claimService.getClaims()
      set({ claims: response.claims, isLoading: false })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch claims',
        isLoading: false,
      })
    }
  },

  createClaim: async (dealId: string): Promise<void> => {
    set({ isLoading: true, error: null })
    try {
      const response = await claimService.createClaim({ dealId })
      set((state: ClaimsState) => ({
        claims: [...state.claims, response.claim],
        isLoading: false,
      }))
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create claim',
        isLoading: false,
      })
      throw error
    }
  },

  approveClaim: async (claimId: string): Promise<void> => {
    set({ isLoading: true, error: null })
    try {
      const response = await claimService.approveClaim(claimId)
      set((state: ClaimsState) => ({
        claims: state.claims.map((c: Claim) => (c._id === claimId ? response.claim : c)),
        isLoading: false,
      }))
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to approve claim',
        isLoading: false,
      })
      throw error
    }
  },

  rejectClaim: async (claimId: string): Promise<void> => {
    set({ isLoading: true, error: null })
    try {
      const response = await claimService.rejectClaim(claimId)
      set((state: ClaimsState) => ({
        claims: state.claims.map((c: Claim) => (c._id === claimId ? response.claim : c)),
        isLoading: false,
      }))
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to reject claim',
        isLoading: false,
      })
      throw error
    }
  },

  clearError: (): void => {
    set({ error: null })
  },
}))
