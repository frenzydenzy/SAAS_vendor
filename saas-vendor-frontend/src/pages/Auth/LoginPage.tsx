import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export const LoginPage = () => {
  const navigate = useNavigate()
  const { login, isLoading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')

    try {
      await login(email, password)
      navigate('/deals')
    } catch (err: any) {
      setLocalError(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <h2 style={styles.title}>Login</h2>

        {(error || localError) && (
          <div className="alert alert-danger">{error || localError}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={styles.text}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>

        <p style={styles.text}>
          <Link to="/forgot-password">Forgot your password?</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    minHeight: 'calc(100vh - 80px)',
    backgroundColor: '#f9fafb',
  },
  formWrapper: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: '700',
    marginBottom: '1.5rem',
    textAlign: 'center' as const,
  },
  text: {
    textAlign: 'center' as const,
    marginTop: '1rem',
    fontSize: '0.875rem',
  },
}
