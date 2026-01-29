import { useEffect } from 'react'
import { useDeals } from '../../hooks/useDeals'
import { useClaims } from '../../hooks/useClaims'
import { DealCard } from '../../components/DealCard'

export const DealsPage = () => {
  const { deals, isLoading, error, pagination, fetchDeals } = useDeals()
  const { createClaim, isLoading: claimLoading } = useClaims()

  useEffect(() => {
    fetchDeals()
  }, [])

  const handleClaim = async (dealId: string) => {
    try {
      await createClaim(dealId)
      alert('Claim created successfully!')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create claim')
    }
  }

  return (
    <div style={styles.container} className="container">
      <h1 style={styles.title}>Available Deals</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {isLoading ? (
        <p>Loading deals...</p>
      ) : deals.length === 0 ? (
        <p>No deals available at the moment.</p>
      ) : (
        <>
          <div className="grid grid-3">
            {deals.map((deal) => (
              <DealCard
                key={deal._id}
                deal={deal}
                onClaim={handleClaim}
              />
            ))}
          </div>

          <div style={styles.pagination}>
            <button
              onClick={() => fetchDeals(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
              className="btn btn-primary"
            >
              Previous
            </button>
            <span style={styles.pageInfo}>
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
            </span>
            <button
              onClick={() => fetchDeals(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              className="btn btn-primary"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}

const styles = {
  container: {
    paddingTop: '2rem',
    paddingBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '2rem',
  },
  pagination: {
    display: 'flex' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    gap: '2rem',
    marginTop: '2rem',
  },
  pageInfo: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
}
