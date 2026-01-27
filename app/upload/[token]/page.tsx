'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Upload, FileText, X, CheckCircle, AlertCircle, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Registration {
  id: string
  child_name: string
  stall_name: string
  presentation_url: string | null
  parent_email: string
}

const UPLOAD_DEADLINE = new Date('2026-02-28T23:59:59')

export default function UploadPage() {
  const params = useParams()
  const token = params.token as string

  const [registration, setRegistration] = useState<Registration | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [presentationFile, setPresentationFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const isDeadlinePassed = new Date() > UPLOAD_DEADLINE

  useEffect(() => {
    const fetchRegistration = async () => {
      try {
        const response = await fetch(`/api/upload/${token}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('Registrace nebyla nalezena nebo je odkaz neplatny.')
          } else {
            setError('Nepodařilo se načíst registraci.')
          }
          return
        }
        const data = await response.json()
        setRegistration(data)
      } catch (err) {
        setError('Nepodařilo se načíst registraci.')
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchRegistration()
    }
  }, [token])

  const handleUpload = async () => {
    if (!presentationFile || !registration) return

    setIsUploading(true)
    setUploadProgress(0)
    setError('')

    try {
      const fileExt = presentationFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      // Get signed upload URL from Supabase
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('presentations')
        .createSignedUploadUrl(fileName)

      if (signedUrlError || !signedUrlData) {
        throw new Error('Chyba při přípravě uploadu: ' + (signedUrlError?.message || 'Neznámá chyba'))
      }

      // Upload with XMLHttpRequest for real progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100)
            setUploadProgress(progress)
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error('Upload selhal: ' + xhr.status))
          }
        }

        xhr.onerror = () => reject(new Error('Chyba sítě při nahrávání'))
        xhr.ontimeout = () => reject(new Error('Upload vypršel'))

        xhr.open('PUT', signedUrlData.signedUrl)
        xhr.setRequestHeader('Content-Type', presentationFile.type)
        xhr.timeout = 600000 // 10 minut timeout pro velké soubory
        xhr.send(presentationFile)
      })

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('presentations')
        .getPublicUrl(fileName)

      // Update registration with presentation URL via API
      const updateResponse = await fetch(`/api/upload/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presentation_url: urlData.publicUrl })
      })

      if (!updateResponse.ok) {
        throw new Error('Nepodařilo se uložit video k registraci')
      }

      setUploadSuccess(true)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Nepodařilo se nahrát soubor')
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Načítám registraci...</p>
        </div>
      </div>
    )
  }

  if (error && !registration) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Chyba</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (uploadSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Video nahráno!</h2>
          <p className="text-gray-600 mb-6">
            Děkujeme! Video pro stánek <strong>{registration?.stall_name}</strong> bylo úspěšně nahráno.
            Brzy se ozveme s výsledkem hodnocení.
          </p>
          <a
            href="/"
            style={{ backgroundColor: '#C8102E' }}
            className="inline-block text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Zpět na hlavní stránku
          </a>
        </div>
      </div>
    )
  }

  if (registration?.presentation_url) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Video již nahráno</h2>
          <p className="text-gray-600 mb-6">
            Pro stánek <strong>{registration.stall_name}</strong> už bylo video nahráno.
          </p>
          <a
            href={registration.presentation_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#C8102E' }}
            className="inline-flex items-center gap-2 hover:underline"
          >
            <FileText className="w-4 h-4" />
            Zobrazit nahrané video
          </a>
        </div>
      </div>
    )
  }

  if (isDeadlinePassed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Deadline vypršel</h2>
          <p className="text-gray-600 mb-6">
            Bohužel, termín pro nahrání videa (28. února 2026) již vypršel.
            Kontaktujte nás prosím na <a href="mailto:veronika@calm2be.cz" style={{ color: '#C8102E' }}>veronika@calm2be.cz</a>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="https://calm2be.cz" target="_blank" rel="noopener noreferrer">
            <img src="/logo.png" alt="Calm2be logo" className="h-10" />
          </a>
          <span className="text-sm text-gray-500">Dětské trhy 2026</span>
        </div>
      </header>

      {/* Hero */}
      <div style={{ backgroundColor: '#C8102E' }} className="text-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-4xl mb-3">🎬</div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white">Nahrání videa</h1>
          <p className="text-white opacity-90">Stánek: {registration?.stall_name}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Dítě:</strong> {registration?.child_name}<br />
              <strong>Stánek:</strong> {registration?.stall_name}
            </p>
          </div>

          <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <Calendar className="w-4 h-4 inline mr-1" />
              <strong>Deadline:</strong> 28. února 2026
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <Upload className="w-5 h-5 mr-2" style={{ color: '#C8102E' }} />
              Nahrajte video nebo prezentaci
            </h3>

            <p className="text-sm text-gray-600">
              Ukažte nám váš projekt! Nahrajte video (doporučujeme 20-40 sekund), prezentaci nebo fotky.
            </p>

            {presentationFile ? (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-700">{presentationFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(presentationFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPresentationFile(null)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-1 text-sm text-gray-500">
                    <span className="font-semibold">Klikněte pro nahrání</span> nebo přetáhněte soubor
                  </p>
                  <p className="text-xs text-gray-400">Video (MP4, MOV), obrázky nebo PDF (max 50MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".mp4,.mov,.webm,.jpg,.jpeg,.png,.gif,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      if (file.size > 50 * 1024 * 1024) {
                        setError('Soubor je příliš velký. Maximální velikost je 50MB.')
                        return
                      }
                      setPresentationFile(file)
                      setError('')
                    }
                  }}
                />
              </label>
            )}

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Nahrávám soubor...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!presentationFile || isUploading}
              style={{ backgroundColor: '#C8102E' }}
              className="w-full text-white py-3.5 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isUploading ? (
                <span>Nahrávám...</span>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Nahrát video
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Pořádá <strong>Calm2be z.s.</strong></p>
          <p className="mt-1">
            <a href="mailto:veronika@calm2be.cz" style={{ color: '#C8102E' }} className="hover:underline">veronika@calm2be.cz</a>
            <span className="mx-2">•</span>
            <a href="tel:+420602282276" style={{ color: '#C8102E' }} className="hover:underline">602 282 276</a>
          </p>
        </div>
      </div>
    </div>
  )
}
