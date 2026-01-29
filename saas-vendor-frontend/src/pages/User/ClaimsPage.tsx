import { useEffect } from 'react'
import { useClaims } from '../../hooks/useClaims'

export const ClaimsPage = () => {
  const { claims, isLoading, error, fetchClaims, approveClaim, rejectClaim } = useClaims()

  useEffect(() => {
    fetchClaims()
  }, [])

  const handleApprove = async (claimId: string) => {
    try {
      await approveClaim(claimId)
      alert('Claim approved!')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve claim')
    }
  }

  const handleReject = async (claimId: string) => {
    try {
      await rejectClaim(claimId)
      alert('Claim rejected!')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject claim')
    }
  }

  return (
    <div className="container" style={styles.container}>
      <h1 style={styles.title}>My Claims</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {isLoading ? (
        <p>Loading claims...</p>
      ) : claims.length === 0 ? (
        <p>You haven't made any claims yet.</p>
      ) : (
        <div style={styles.table}>
          <table style={styles.tableElement}>
            <thead>
              <tr style={styles.headerRow}>
                <th style={styles.th}>Deal</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim._id} style={styles.row}>
                  <td style={styles.td}>{claim.dealTitle}</td>
                  <td style={styles.td}>
                    <span style={getStatusStyle(claim.status)}>{claim.status}</span>
                  </td>
                  <td style={styles.td}>{new Date(claim.createdAt).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    {claim.status === 'pending' && (
                      <div style={styles.actions}>
                        <button
                          onClick={() => handleApprove(claim._id)}
                          className="btn btn-primary"
                          style={styles.smallBtn}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(claim._id)}
                          className="btn btn-danger"
                          style={styles.smallBtn}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const getStatusStyle = (status: string) => {
  const baseStyle = { padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontSize: '0.875rem', fontWeight: '600' }
  switch (status) {
    case 'approved':
      return { ...baseStyle, backgroundColor: '#d1fae5', color: '#065f46' }
    case 'rejected':
      return { ...baseStyle, backgroundColor: '#fee2e2', color: '#991b1b' }
    default:
      return { ...baseStyle, backgroundColor: '#fef3c7', color: '#92400e' }
  }
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
  table: {
    overflowX: 'auto' as const,
  },
  tableElement: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  headerRow: {
    backgroundColor: '#f9fafb',
    borderBottom: '2px solid #e5e7eb',
  },
  th: {
    padding: '1rem',
    textAlign: 'left' as const,
    fontWeight: '600',
    color: '#374151',
  },
  row: {
    borderBottom: '1px solid #e5e7eb',
  },
  td: {
    padding: '1rem',
    color: '#374151',
  },
  actions: {
    display: 'flex' as const,
    gap: '0.5rem',
  },
  smallBtn: {
    padding: '0.375rem 0.75rem',
    fontSize: '0.875rem',
  },
}
