import { create } from 'zustand'
import { User } from '../types/api.types'
import { userService } from '../services'

interface UserState {
  profile: User | null
  isLoading: boolean
  error: string | null

  // Actions
  fetchProfile: () => Promise<void>
  updateProfile: (firstName?: string, lastName?: string, phone?: string) => Promise<void>
  uploadProfilePicture: (file: File) => Promise<void>
  setProfile: (profile: User | null) => void
  clearError: () => void
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null })
    try {
      const profile = await userService.getProfile()
      set({ profile, isLoading: false })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch profile',
        isLoading: false,
      })
    }
  },

  updateProfile: async (firstName, lastName, phone) => {
    set({ isLoading: true, error: null })
    try {
      const response = await userService.updateProfile({ firstName, lastName, phone })
      set({ profile: response.user, isLoading: false })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update profile',
        isLoading: false,
      })
      throw error
    }
  },

  uploadProfilePicture: async (file) => {
    set({ isLoading: true, error: null })
    try {
      const response = await userService.uploadProfilePicture(file)
      set({ profile: response.user, isLoading: false })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to upload profile picture',
        isLoading: false,
      })
      throw error
    }
  },

  setProfile: (profile) => {
    set({ profile })
  },

  clearError: () => {
    set({ error: null })
  },
}))
