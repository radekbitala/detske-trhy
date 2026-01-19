'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, User, Baby, Package, FileText, CheckCircle } from 'lucide-react'

interface Registration {
  id: string
  created_at: string
  parent_name: string
  parent_email: string
  parent_phone: string
  parent_birth_date: string
  parent_address: string
  child_name: string
  child_age: number
  city: string
  stall_name: string
  products: string
  status: 'pending' | 'theme_approved' | 'video_approved'
  consent_given: boolean
  emails_sent: string[]
  theme_approved_at: string | null
  video_approved_at: string | null
}

export default function RegistrationDetailPage() {
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const password = localStorage.getItem('admin_password')
    if (!password) {
      router.push('/admin')
      return
    }
    fetchRegistration()
  }, [params.id, router])

  const fetchRegistration = async () => {
    const password = localStorage.getItem('admin_password')
    try {
      const response = await fetch(`/api/registrations/${params.id}`, {
        headers: { 'Authorization': `Bearer ${password}` }
      })
      if (response.ok) {
        const data = await response.json()
        setRegistration(data)
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

  const handleApprove = async (action: 'approve_theme' | 'approve_video') => {
    const password = localStorage.getItem('admin_password')
    setActionLoading(true)
    
    try {
      const response = await fetch(`/api/registrations/${params.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${password}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        await fetchRegistration()
      }
    } catch (error) {
      console.error('Failed to approve:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('cs-CZ')
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Čeká na schválení' },
      theme_approved: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Čeká na video' },
      video_approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Schváleno ✓' }
    }
    const badge = badges[status]
    return (
      <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
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

  if (!registration) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Registrace nenalezena</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div style={{ backgroundColor: '#C8102E' }} className="text-white">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="flex items-center text-red-100 hover:text-white mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Zpět na seznam
          </button>
          <h1 className="text-xl font-bold">Detail registrace</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Status card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-2xl font-bold text-gray-800">{registration.stall_name}</div>
              <div className="text-gray-500">{registration.child_name} ({registration.child_age} let)</div>
            </div>
            <div className="flex items-center gap-4">
              {getStatusBadge(registration.status)}
              {registration.status === 'pending' && (
                <button
                  onClick={() => handleApprove('approve_theme')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  {actionLoading ? 'Zpracovávám...' : 'Schválit téma'}
                </button>
              )}
              {registration.status === 'theme_approved' && (
                <button
                  onClick={() => handleApprove('approve_video')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  {actionLoading ? 'Zpracovávám...' : 'Schválit video'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Zákonný zástupce */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" style={{ color: '#C8102E' }} />
              Zákonný zástupce
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-gray-500 uppercase">Jméno a příjmení</dt>
                <dd className="text-gray-800 font-medium">{registration.parent_name}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase">Datum narození</dt>
                <dd className="text-gray-800">{formatDate(registration.parent_birth_date)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase">Adresa</dt>
                <dd className="text-gray-800">{registration.parent_address || '-'}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase">E-mail</dt>
                <dd className="text-gray-800">
                  <a href={`mailto:${registration.parent_email}`} style={{ color: '#C8102E' }} className="hover:underline">
                    {registration.parent_email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase">Telefon</dt>
                <dd className="text-gray-800">
                  <a href={`tel:${registration.parent_phone}`} style={{ color: '#C8102E' }} className="hover:underline">
                    {registration.parent_phone}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          {/* Dítě */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <Baby className="w-5 h-5 mr-2" style={{ color: '#C8102E' }} />
              Údaje o dítěti
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-gray-500 uppercase">Jméno a příjmení</dt>
                <dd className="text-gray-800 font-medium">{registration.child_name}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase">Věk</dt>
                <dd className="text-gray-800">{registration.child_age} let</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase">Město</dt>
                <dd className="text-gray-800">{registration.city}</dd>
              </div>
            </dl>
          </div>

          {/* Stánek */}
          <div className="bg-white rounded-xl shadow-sm p-6 md:col-span-2">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" style={{ color: '#C8102E' }} />
              Informace o stánku
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-gray-500 uppercase">Název stánku</dt>
                <dd className="text-gray-800 font-medium text-lg">{registration.stall_name}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase">Sortiment</dt>
                <dd className="text-gray-800 bg-gray-50 p-3 rounded-lg">{registration.products}</dd>
              </div>
            </dl>
          </div>

          {/* Meta info */}
          <div className="bg-white rounded-xl shadow-sm p-6 md:col-span-2">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" style={{ color: '#C8102E' }} />
              Informace o registraci
            </h3>
            <dl className="grid md:grid-cols-3 gap-4">
              <div>
                <dt className="text-xs text-gray-500 uppercase">Datum registrace</dt>
                <dd className="text-gray-800">{formatDate(registration.created_at)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase">Souhlas GDPR</dt>
                <dd className="text-gray-800">
                  {registration.consent_given ? (
                    <span className="text-green-600 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Udělen
                    </span>
                  ) : (
                    <span className="text-red-600">Neudělen</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase">Odeslané emaily</dt>
                <dd className="text-gray-800">
                  {!registration.emails_sent || registration.emails_sent.length === 0 ? (
                    <span className="text-gray-400">Žádné</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {registration.emails_sent.includes('theme_approved') && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          Schválení tématu
                        </span>
                      )}
                      {registration.emails_sent.includes('video_approved') && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          Schválení videa
                        </span>
                      )}
                    </div>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
