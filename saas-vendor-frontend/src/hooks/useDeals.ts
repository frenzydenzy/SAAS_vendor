import { useDealsStore } from '../store/dealsStore'





















export const useDeals = () => {
  const {
    deals,
    currentDeal,
    isLoading,
    error,
    pagination,
    fetchDeals,
    fetchDealDetail,
    clearError,
    clearCurrentDeal,
  } = useDealsStore()

  return {
    deals,
    currentDeal,
    isLoading,
    error,
    pagination,
    fetchDeals,
    fetchDealDetail,
    clearError,
    clearCurrentDeal,
  }
}
