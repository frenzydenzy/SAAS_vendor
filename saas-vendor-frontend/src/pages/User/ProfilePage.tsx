import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useUserStore } from '../../store/userStore'

export const ProfilePage = () => {
  const { user } = useAuth()
  const { profile, isLoading, error, fetchProfile, updateProfile, uploadProfilePicture } =
    useUserStore()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
      })
    }
  }, [profile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateProfile(formData.firstName, formData.lastName, formData.phone)
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update profile')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      await uploadProfilePicture(file)
      alert('Profile picture updated successfully!')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload profile picture')
    }
  }

  if (isLoading) return <div className="container">Loading profile...</div>
  if (error) return <div className="container"><div className="alert alert-danger">{error}</div></div>
  if (!profile) return <div className="container">Profile not found</div>

  return (
    <div className="container" style={styles.container}>
      <h1 style={styles.title}>My Profile</h1>

      <div style={styles.content}>
        <div style={styles.profileSection}>
          <div style={styles.avatarContainer}>
            {profile.profilePicture ? (
              <img src={profile.profilePicture} alt="Profile" style={styles.avatar} />
            ) : (
              <div style={styles.avatarPlaceholder}>
                {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
              </div>
            )}
          </div>

          <label htmlFor="profilePicture" className="btn btn-primary" style={styles.uploadBtn}>
            Upload Picture
          </label>
          <input
            id="profilePicture"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>

        <div style={styles.infoSection}>
          {!isEditing ? (
            <>
              <div style={styles.infoBlock}>
                <label>Email</label>
                <p>{profile.email}</p>
              </div>

              <div style={styles.infoBlock}>
                <label>First Name</label>
                <p>{profile.firstName}</p>
              </div>

              <div style={styles.infoBlock}>
                <label>Last Name</label>
                <p>{profile.lastName}</p>
              </div>

              <div style={styles.infoBlock}>
                <label>Phone</label>
                <p>{profile.phone || 'Not provided'}</p>
              </div>

              <div style={styles.infoBlock}>
                <label>KYC Status</label>
                <p style={getStatusStyle(profile.kycStatus)}>{profile.kycStatus}</p>
              </div>

              <div style={styles.infoBlock}>
                <label>Email Verified</label>
                <p>{profile.emailVerified ? 'Yes' : 'No'}</p>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary"
                style={styles.editBtn}
              >
                Edit Profile
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div style={styles.btnGroup}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ backgroundColor: '#6b7280' }}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

const getStatusStyle = (status: string) => {
  const baseStyle = { fontWeight: '600', padding: '0.25rem 0.75rem', borderRadius: '0.25rem' }
  switch (status) {
    case 'verified':
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
  content: {
    display: 'grid' as const,
    gridTemplateColumns: '300px 1fr',
    gap: '2rem',
  },
  profileSection: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    gap: '1rem',
  },
  avatarContainer: {
    marginBottom: '1rem',
  },
  avatar: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
    border: '4px solid #6366f1',
  },
  avatarPlaceholder: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    backgroundColor: '#6366f1',
    color: 'white',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    fontSize: '3rem',
    fontWeight: '700',
  },
  uploadBtn: {
    width: '100%',
  },
  infoSection: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  infoBlock: {
    paddingBottom: '1rem',
    borderBottom: '1px solid #e5e7eb',
  },
  editBtn: {
    marginTop: '1rem',
  },
  btnGroup: {
    display: 'flex' as const,
    gap: '1rem',
  },
}
