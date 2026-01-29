import api from './api'
import * as Types from '../types/api.types'

export const authService = {
  register: async (data: Types.RegisterRequest): Promise<Types.RegisterResponse> => {
    const response = await api.post<Types.RegisterResponse>('/auth/register', data)
    return response.data
  },

  login: async (data: Types.LoginRequest): Promise<Types.LoginResponse> => {
    const response = await api.post<Types.LoginResponse>('/auth/login', data)
    return response.data
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/logout', {})
    return response.data
  },

  verifyEmail: async (token: string): Promise<Types.VerifyEmailResponse> => {
    const response = await api.post<Types.VerifyEmailResponse>('/auth/verify-email', {
      token,
    })
    return response.data
  },

  refreshToken: async (
    refreshToken: string
  ): Promise<Types.RefreshTokenResponse> => {
    const response = await api.post<Types.RefreshTokenResponse>(
      '/auth/refresh-token',
      { refreshToken }
    )
    return response.data
  },

  forgotPassword: async (
    data: Types.ForgotPasswordRequest
  ): Promise<Types.ForgotPasswordResponse> => {
    const response = await api.post<Types.ForgotPasswordResponse>(
      '/auth/forgot-password',
      data
    )
    return response.data
  },

  resetPassword: async (
    data: Types.ResetPasswordRequest
  ): Promise<Types.ResetPasswordResponse> => {
    const response = await api.post<Types.ResetPasswordResponse>(
      '/auth/reset-password',
      data
    )
    return response.data
  },
}
