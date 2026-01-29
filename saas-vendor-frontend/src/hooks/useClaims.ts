import { useClaimsStore } from '../store/claimsStore'

export const useClaims = () => {
  const {
    claims,
    isLoading,
    error,
    fetchClaims,
    createClaim,
    approveClaim,
    rejectClaim,
    clearError,
  } = useClaimsStore()

  return {
    claims,
    isLoading,
    error,
    fetchClaims,
    createClaim,
    approveClaim,
    rejectClaim,
    clearError,
  }
}
