'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, LogIn } from 'lucide-react'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const savedPassword = localStorage.getItem('admin_password')
    if (savedPassword) {
      router.push('/admin/dashboard')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/registrations', {
        headers: {
          'Authorization': `Bearer ${password}`
        }
      })

      if (response.ok) {
        localStorage.setItem('admin_password', password)
        router.push('/admin/dashboard')
      } else {
        setError('Nesprávné heslo')
      }
    } catch (err) {
      setError('Chyba při přihlašování')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(200, 16, 46, 0.1)' }}>
            <Lock className="w-8 h-8" style={{ color: '#C8102E' }} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Admin přihlášení</h1>
          <p className="text-gray-500 mt-1">Dětské trhy 2026</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heslo</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none"
              placeholder="Zadejte heslo"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{ backgroundColor: '#C8102E' }}
            className="w-full text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50"
          >
            {isLoading ? (
              'Přihlašuji...'
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Přihlásit se
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
