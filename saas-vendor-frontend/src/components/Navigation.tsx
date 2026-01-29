import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export const Navigation = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
    setShowMenu(false)
  }

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.container}>
        <Link to="/" style={styles.logo}>
          <h1>SaaS Vendor</h1>
        </Link>

        <div style={styles.menu}>
          {!isAuthenticated ? (
            <div style={styles.authLinks}>
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
              <Link to="/register" className="btn btn-secondary" style={{ marginLeft: '1rem' }}>
                Register
              </Link>
            </div>
          ) : (
            <div style={styles.userMenu}>
              <Link to="/deals" style={styles.link}>
                Deals
              </Link>
              <Link to="/claims" style={styles.link}>
                Claims
              </Link>
              <div style={styles.dropdown}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  style={styles.userButton}
                >
                  {user?.firstName} ▼
                </button>
                {showMenu && (
                  <div style={styles.dropdownMenu}>
                    <Link to="/profile" style={styles.dropdownItem}>
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      style={styles.dropdownItem}
                      className="btn btn-danger"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    backgroundColor: '#1f2937',
    color: 'white',
    padding: '1rem 0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  container: {
    display: 'flex' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  logo: {
    textDecoration: 'none',
    color: 'white',
    marginRight: '2rem',
  },
  menu: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '2rem',
  },
  authLinks: {
    display: 'flex' as const,
    gap: '1rem',
  },
  userMenu: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '2rem',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  dropdown: {
    position: 'relative' as const,
  },
  userButton: {
    backgroundColor: '#6366f1',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
  },
  dropdownMenu: {
    position: 'absolute' as const,
    top: '100%',
    right: 0,
    backgroundColor: 'white',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    borderRadius: '0.375rem',
    marginTop: '0.5rem',
    minWidth: '150px',
    zIndex: 1000,
  },
  dropdownItem: {
    display: 'block' as const,
    width: '100%',
    padding: '0.75rem 1rem',
    textAlign: 'left' as const,
    color: '#1f2937',
    textDecoration: 'none',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'backgroundColor 0.2s',
  },
}
