import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Navigation } from './components/Navigation'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/Auth/LoginPage'
import { RegisterPage } from './pages/Auth/RegisterPage'
import { DealsPage } from './pages/Deals/DealsPage'
import { DealDetailPage } from './pages/Deals/DealDetailPage'
import { ProfilePage } from './pages/User/ProfilePage'
import { ClaimsPage } from './pages/User/ClaimsPage'
import { useAuthStore } from './store/authStore'

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth)

  useEffect(() => {
    initializeAuth()
  }, [])

  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route
          path="/deals"
          element={
            <ProtectedRoute>
              <DealsPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/deals/:dealId"
          element={
            <ProtectedRoute>
              <DealDetailPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/claims"
          element={
            <ProtectedRoute>
              <ClaimsPage />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/deals" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
