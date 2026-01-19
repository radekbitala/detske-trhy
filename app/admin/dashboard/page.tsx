'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Eye, CheckCircle, LogOut, Trash2 } from 'lucide-react'

interface Registration {
  id: string
  created_at: string
  parent_name: string
  parent_email: string
  parent_phone: string
  child_name: string
  child_age: number
  city: string
  stall_name: string
  products: string
  status: 'pending' | 'theme_approved' | 'video_approved'
}

export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const password = localStorage.getItem('admin_password')
    if (!password) {
      router.push('/admin')
      return
    }
    fetchRegistrations()
  }, [router])

  const fetchRegistrations = async () => {
    const password = localStorage.getItem('admin_password')
    try {
      const response = await fetch('/api/registrations', {
        headers: { 'Authorization': `Bearer ${password}` }
      })
      if (response.ok) {
        const data = await response.json()
        setRegistrations(data)
      } else if (response.status === 401) {
        localStorage.removeItem('admin_password')
        router.push('/admin')
      }
    } catch (error) {
      console.error('Failed to fetch:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (id: string, action: 'approve_theme' | 'approve_video') => {
    const password = localStorage.getItem('admin_password')
    setActionLoading(id)
    
    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${password}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        await fetchRegistrations()
      }
    } catch (error) {
      console.error('Failed to approve:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    const password = localStorage.getItem('admin_password')
    setActionLoading(id)
    
    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${password}`
        }
      })

      if (response.ok) {
        await fetchRegistrations()
      }
    } catch (error) {
      console.error('Failed to delete:', error)
    } finally {
      setActionLoading(null)
      setDeleteConfirm(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_password')
    router.push('/admin')
  }

  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'pending').length,
    themeApproved: registrations.filter(r => r.status === 'theme_approved').length,
    videoApproved: registrations.filter(r => r.status === 'video_approved').length
  }

  const filteredRegistrations = registrations.filter(reg => {
    if (statusFilter !== 'all' && reg.status !== statusFilter) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        reg.child_name.toLowerCase().includes(query) ||
        reg.parent_name.toLowerCase().includes(query) ||
        reg.parent_email.toLowerCase().includes(query) ||
        reg.stall_name.toLowerCase().includes(query) ||
        reg.city.toLowerCase().includes(query)
      )
    }
    return true
  })

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Čeká na schválení' },
      theme_approved: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Čeká na video' },
      video_approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Schváleno ✓' }
    }
    const badge = badges[status]
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Načítám...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Smazat registraci?</h3>
            <p className="text-gray-600 mb-4">Tato akce je nevratná. Opravdu chcete smazat tuto registraci?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Zrušit
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={actionLoading === deleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === deleteConfirm ? 'Mažu...' : 'Smazat'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ backgroundColor: '#C8102E' }} className="text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">🎪 Dětské trhy – Admin</h1>
              <p className="text-sm text-red-100">24. května 2026</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center text-sm bg-white/20 hover:bg-white/30 px-3 py-2 rounded transition-colors"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Odhlásit
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setStatusFilter('all')}
            className={`rounded-xl p-4 shadow-sm transition-all ${statusFilter === 'all' ? 'bg-red-100 ring-2 ring-red-500' : 'bg-white hover:bg-gray-50'}`}
          >
            <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-sm text-gray-500">Celkem</div>
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`rounded-xl p-4 shadow-sm transition-all ${statusFilter === 'pending' ? 'bg-yellow-200 ring-2 ring-yellow-500' : 'bg-yellow-50 hover:bg-yellow-100'}`}
          >
            <div className="text-3xl font-bold text-yellow-700">{stats.pending}</div>
            <div className="text-sm text-yellow-600">Čeká na schválení</div>
          </button>
          <button
            onClick={() => setStatusFilter('theme_approved')}
            className={`rounded-xl p-4 shadow-sm transition-all ${statusFilter === 'theme_approved' ? 'bg-blue-200 ring-2 ring-blue-500' : 'bg-blue-50 hover:bg-blue-100'}`}
          >
            <div className="text-3xl font-bold text-blue-700">{stats.themeApproved}</div>
            <div className="text-sm text-blue-600">Čeká na video</div>
          </button>
          <button
            onClick={() => setStatusFilter('video_approved')}
            className={`rounded-xl p-4 shadow-sm transition-all ${statusFilter === 'video_approved' ? 'bg-green-200 ring-2 ring-green-500' : 'bg-green-50 hover:bg-green-100'}`}
          >
            <div className="text-3xl font-bold text-green-700">{stats.videoApproved}</div>
            <div className="text-sm text-green-600">Plně schváleno</div>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Hledat podle jména, emailu, stánku, města..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            {(statusFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => { setStatusFilter('all'); setSearchQuery('') }}
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:text-red-800 bg-red-50 rounded-lg"
              >
                <X className="w-4 h-4 mr-1" />
                Zrušit filtry
              </button>
            )}
          </div>
          <div className="mt-3 text-sm text-gray-500">
            Zobrazeno {filteredRegistrations.length} z {registrations.length} registrací
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dítě / Stánek</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kontakt</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Sortiment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stav</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      {searchQuery || statusFilter !== 'all' 
                        ? 'Žádné registrace neodpovídají filtru'
                        : 'Zatím žádné registrace'
                      }
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map(reg => (
                    <tr key={reg.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-800">{reg.child_name}</div>
                        <div className="text-sm font-medium" style={{ color: '#C8102E' }}>{reg.stall_name}</div>
                        <div className="text-xs text-gray-400">{reg.child_age} let • {reg.city}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-800">{reg.parent_name}</div>
                        <div className="text-xs text-gray-500">{reg.parent_email}</div>
                        <div className="text-xs text-gray-500">{reg.parent_phone}</div>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <div className="text-sm text-gray-600 max-w-xs truncate">{reg.products}</div>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(reg.status)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => router.push(`/admin/dashboard/${reg.id}`)}
                            className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Detail
                          </button>
                          {reg.status === 'pending' && (
                            <button
                              onClick={() => handleApprove(reg.id, 'approve_theme')}
                              disabled={actionLoading === reg.id}
                              className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {actionLoading === reg.id ? '...' : 'Schválit téma'}
                            </button>
                          )}
                          {reg.status === 'theme_approved' && (
                            <button
                              onClick={() => handleApprove(reg.id, 'approve_video')}
                              disabled={actionLoading === reg.id}
                              className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {actionLoading === reg.id ? '...' : 'Schválit video'}
                            </button>
                          )}
                          {reg.status === 'video_approved' && (
                            <span className="text-green-600 text-xs font-medium flex items-center">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Dokončeno
                            </span>
                          )}
                          <button
                            onClick={() => setDeleteConfirm(reg.id)}
                            className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Smazat
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Help */}
        <div className="mt-6 rounded-xl p-4 text-sm" style={{ backgroundColor: 'rgba(200, 16, 46, 0.1)', color: '#991b1b' }}>
          <strong>💡 Tip:</strong> Klikněte na <strong>Detail</strong> pro zobrazení všech informací o registraci.
        </div>
      </div>
    </div>
  )
}
