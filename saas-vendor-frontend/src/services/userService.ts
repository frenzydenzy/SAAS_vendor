import api from './api'
import * as Types from '../types/api.types'

export const userService = {
  getProfile: async (): Promise<Types.User> => {
    const response = await api.get<Types.User>('/user/profile')
    return response.data
  },

  updateProfile: async (
    data: Types.UpdateProfileRequest
  ): Promise<Types.UpdateProfileResponse> => {
    const response = await api.patch<Types.UpdateProfileResponse>(
      '/user/profile',
      data
    )
    return response.data
  },

  uploadProfilePicture: async (
    file: File
  ): Promise<Types.ProfilePictureUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post<Types.ProfilePictureUploadResponse>(
      '/user/upload-profile-picture',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    )
    return response.data
  },
}
