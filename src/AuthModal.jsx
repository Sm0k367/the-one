import { useState } from 'react'
import { useAuth } from './AuthContext'

export default function AuthModal({ colors, onClose }) {
  const [mode, setMode] = useState('login') // 'login', 'signup', 'reset'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const { signIn, signUp, resetPassword } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password)
        if (error) throw error
        onClose()
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password)
        if (error) throw error
        setMessage('Check your email to confirm your account!')
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email)
        if (error) throw error
        setMessage('Password reset link sent to your email!')
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: colors.messageBg,
        border: `1px solid ${colors.border}`,
        borderRadius: '24px',
        padding: '40px',
        backdropFilter: 'blur(20px)',
        boxShadow: `0 8px 32px ${colors.shadow}`
      }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #00f0ff, #ff00aa)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 8px 0'
          }}>
            {mode === 'login' ? 'Welcome Back!' : mode === 'signup' ? 'Join Epic Tech AI' : 'Reset Password'}
          </h2>
          <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>
            {mode === 'login' ? 'Sign in to access your chat history' : mode === 'signup' ? 'Create an account to save your chats' : 'Enter your email to reset password'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              opacity: 0.9
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: `2px solid ${colors.border}`,
                background: colors.inputBg,
                color: colors.text,
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease',
                fontWeight: '400'
              }}
            />
          </div>

          {mode !== 'reset' && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '0.9rem',
                fontWeight: '600',
                opacity: 0.9
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: `2px solid ${colors.border}`,
                  background: colors.inputBg,
                  color: colors.text,
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  fontWeight: '400'
                }}
              />
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              marginBottom: '20px',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#22c55e',
              marginBottom: '20px',
              fontSize: '0.9rem'
            }}>
              {message}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              background: loading ? 'rgba(100, 100, 100, 0.5)' : 'linear-gradient(135deg, #00f0ff, #ff00aa)',
              color: loading ? '#666' : '#000',
              border: 'none',
              fontWeight: '700',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: !loading ? `0 4px 16px ${colors.shadow}` : 'none',
              marginBottom: '16px'
            }}
          >
            {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
          </button>

          {/* Mode Switchers */}
          <div style={{ textAlign: 'center', fontSize: '0.9rem' }}>
            {mode === 'login' && (
              <>
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: colors.text,
                    opacity: 0.7,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: '0.9rem',
                    marginBottom: '8px',
                    display: 'block',
                    width: '100%'
                  }}
                >
                  Forgot password?
                </button>
                <div>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#00f0ff',
                      cursor: 'pointer',
                      fontWeight: '600',
                      textDecoration: 'underline'
                    }}
                  >
                    Sign Up
                  </button>
                </div>
              </>
            )}

            {mode === 'signup' && (
              <div>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#00f0ff',
                    cursor: 'pointer',
                    fontWeight: '600',
                    textDecoration: 'underline'
                  }}
                >
                  Sign In
                </button>
              </div>
            )}

            {mode === 'reset' && (
              <div>
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#00f0ff',
                    cursor: 'pointer',
                    fontWeight: '600',
                    textDecoration: 'underline'
                  }}
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </form>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '8px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1.2rem',
            color: colors.text,
            transition: 'all 0.3s ease'
          }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
