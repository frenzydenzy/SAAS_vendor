import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDeals } from '../../hooks/useDeals'
import { useClaims } from '../../hooks/useClaims'

export const DealDetailPage = () => {
  const { dealId } = useParams<{ dealId: string }>()
  const navigate = useNavigate()
  const { currentDeal, isLoading, error, fetchDealDetail, clearCurrentDeal } = useDeals()
  const { createClaim, isLoading: claimLoading } = useClaims()

  useEffect(() => {
    if (dealId) {
      fetchDealDetail(dealId)
    }
    return () => clearCurrentDeal()
  }, [dealId])

  const handleClaim = async () => {
    if (!dealId) return
    try {
      await createClaim(dealId)
      alert('Claim created successfully!')
      navigate('/claims')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create claim')
    }
  }

  if (isLoading) return <div className="container">Loading deal details...</div>
  if (error) return <div className="container"><div className="alert alert-danger">{error}</div></div>
  if (!currentDeal) return <div className="container">Deal not found</div>

  return (
    <div className="container" style={styles.container}>
      <button onClick={() => navigate('/deals')} className="btn btn-primary" style={styles.backBtn}>
        ← Back to Deals
      </button>

      <div style={styles.content}>
        {currentDeal.image && (
          <div style={styles.imageContainer}>
            <img src={currentDeal.image} alt={currentDeal.title} style={styles.image} />
          </div>
        )}

        <div style={styles.details}>
          <h1 style={styles.title}>{currentDeal.title}</h1>
          <p style={styles.vendor}>by {currentDeal.vendorName}</p>
          <p style={styles.category}>{currentDeal.category}</p>

          <p style={styles.description}>{currentDeal.description}</p>

          <div style={styles.pricing}>
            <div style={styles.priceBlock}>
              <span style={styles.label}>Original Price</span>
              <span style={styles.originalPrice}>${currentDeal.price}</span>
            </div>

            <div style={styles.priceBlock}>
              <span style={styles.label}>Discount</span>
              <span style={styles.discount}>{currentDeal.discount}%</span>
            </div>

            <div style={styles.priceBlock}>
              <span style={styles.label}>Final Price</span>
              <span style={styles.finalPrice}>${currentDeal.discountedPrice}</span>
            </div>
          </div>

          <div style={styles.meta}>
            <p>
              <strong>Status:</strong> {currentDeal.status}
            </p>
            <p>
              <strong>Expires:</strong> {new Date(currentDeal.expiresAt).toLocaleDateString()}
            </p>
            <p>
              <strong>Created:</strong> {new Date(currentDeal.createdAt).toLocaleDateString()}
            </p>
          </div>

          <button
            onClick={handleClaim}
            className="btn btn-secondary"
            style={styles.claimBtn}
            disabled={claimLoading}
          >
            {claimLoading ? 'Creating Claim...' : 'Claim This Deal'}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    paddingTop: '2rem',
    paddingBottom: '2rem',
  },
  backBtn: {
    marginBottom: '2rem',
  },
  content: {
    display: 'grid' as const,
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
  },
  imageContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: '0.5rem',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '400px',
    objectFit: 'cover' as const,
  },
  details: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
  },
  vendor: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  category: {
    display: 'inline-block',
    backgroundColor: '#dbeafe',
    color: '#0c4a6e',
    padding: '0.25rem 0.75rem',
    borderRadius: '0.25rem',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  description: {
    fontSize: '1rem',
    color: '#374151',
    lineHeight: '1.6',
  },
  pricing: {
    display: 'grid' as const,
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  priceBlock: {
    backgroundColor: '#f9fafb',
    padding: '1rem',
    borderRadius: '0.375rem',
    textAlign: 'center' as const,
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '0.5rem',
  },
  originalPrice: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#6b7280',
  },
  discount: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#ef4444',
  },
  finalPrice: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#10b981',
  },
  meta: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  claimBtn: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
  },
}
