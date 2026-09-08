'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction } from './actions'

export default function AdminLogin() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const result = await loginAction(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else if (result.success) {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background-alt)' }}>
      <div className="card" style={{ padding: '2rem', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Administration</h1>
        
        {error && (
          <div style={{ backgroundColor: 'var(--danger)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Nom d'utilisateur</label>
            <input 
              id="username"
              name="username" 
              type="text" 
              className="form-input" 
              required 
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" htmlFor="password">Mot de passe</label>
            <input 
              id="password"
              name="password" 
              type="password" 
              className="form-input" 
              required 
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
