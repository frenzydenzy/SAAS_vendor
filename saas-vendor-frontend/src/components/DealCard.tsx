import { Link } from 'react-router-dom'
import { Deal } from '../types/api.types'

interface DealCardProps {
  deal: Deal
  onClaim?: (dealId: string) => void
}

export const DealCard = ({ deal, onClaim }: DealCardProps) => {
  return (
    <div style={styles.card}>
      {deal.image && <img src={deal.image} alt={deal.title} style={styles.image} />}
      <div style={styles.content}>
        <h3 style={styles.title}>{deal.title}</h3>
        <p style={styles.description}>{deal.description}</p>

        <div style={styles.pricing}>
          <span style={styles.originalPrice}>
            <s>${deal.price}</s>
          </span>
          <span style={styles.discountedPrice}>${deal.discountedPrice}</span>
          <span style={styles.discount}>-{deal.discount}%</span>
        </div>

        <p style={styles.vendor}>by {deal.vendorName}</p>

        <div style={styles.footer}>
          <Link to={`/deals/${deal._id}`} className="btn btn-primary">
            View Details
          </Link>
          {onClaim && (
            <button
              onClick={() => onClaim(deal._id)}
              className="btn btn-secondary"
              style={{ marginLeft: '0.5rem' }}
            >
              Claim
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  card: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    transition: 'box-shadow 0.2s, transform 0.2s',
  },
  image: {
    width: '100%',
    height: '200px',
    objectFit: 'cover' as const,
  },
  content: {
    padding: '1.5rem',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#1f2937',
  },
  description: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '1rem',
    lineHeight: '1.5',
  },
  pricing: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '1rem',
    marginBottom: '1rem',
  },
  originalPrice: {
    fontSize: '0.875rem',
    color: '#9ca3af',
  },
  discountedPrice: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#10b981',
  },
  discount: {
    backgroundColor: '#fecaca',
    color: '#991b1b',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  vendor: {
    fontSize: '0.875rem',
    color: '#9ca3af',
    marginBottom: '1rem',
  },
  footer: {
    display: 'flex' as const,
    gap: '0.5rem',
  },
}
