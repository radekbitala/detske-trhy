'use client'

import { useState } from 'react'
import { Send, CheckCircle, User, Baby, Package, Calendar, MapPin, Upload, X, FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const KRAJE_CR = [
  'Hlavní město Praha',
  'Středočeský kraj',
  'Jihočeský kraj',
  'Plzeňský kraj',
  'Karlovarský kraj',
  'Ústecký kraj',
  'Liberecký kraj',
  'Královéhradecký kraj',
  'Pardubický kraj',
  'Kraj Vysočina',
  'Jihomoravský kraj',
  'Olomoucký kraj',
  'Zlínský kraj',
  'Moravskoslezský kraj',
]

const CONSENT_TEXT = `Souhlasím se zpracováním osobních údajů svého dítěte (jméno, příjmení, věk, fotografie a videa pořízená v rámci aktivit) spolkem Calm2be, z.s., IČO: 17901006, se sídlem Na Vinici 109/9, 290 01 Poděbrady. Tyto údaje mohou být použity pro organizaci akcí a také pro jejich propagaci (web, sociální sítě, propagační materiály). Souhlas je platný po dobu účasti dítěte na aktivitách a nejdéle 5 let od jeho udělení.

Byl/a jsem informován/a o svých právech – mohu kdykoliv požádat o přístup k údajům, jejich opravu nebo výmaz, vznést námitku proti jejich zpracování, případně souhlas odvolat na e-mailu: veronika@calm2be.cz.

Rozumím pravidlům dozoru – po dobu aktivit jsem přítomen/a a vykonávám nad dítětem dohled. Pokud dítě svěříme dozorujícím osobám spolku, účastní se aktivit na vlastní odpovědnost.`

// Validation patterns
const PATTERNS = {
  name: /^[a-zA-ZáčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ\s\-]+$/,
  phone: /^(\+420)?[0-9]{9}$/,
  city: /^[a-zA-ZáčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ0-9\s\.\-\/]+$/,
}

const validateField = (field: string, value: string): string | null => {
  switch (field) {
    case 'parentName':
    case 'childName':
      if (!value.trim()) return 'Toto pole je povinné'
      if (value.length < 3) return 'Jméno musí mít alespoň 3 znaky'
      if (!PATTERNS.name.test(value)) return 'Jméno obsahuje neplatné znaky'
      return null
    case 'parentPhone':
      const cleanPhone = value.replace(/\s/g, '')
      if (!cleanPhone) return 'Toto pole je povinné'
      if (!PATTERNS.phone.test(cleanPhone)) return 'Zadejte platné telefonní číslo (9 číslic)'
      return null
    case 'parentCity':
      if (!value.trim()) return 'Toto pole je povinné'
      if (!PATTERNS.city.test(value)) return 'Pole obsahuje neplatné znaky'
      return null
    case 'parentRegion':
      if (!value) return 'Vyberte prosím kraj'
      return null
    default:
      return null
  }
}

export default function RegistrationPage() {
  const [formData, setFormData] = useState({
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    parentCity: '',
    parentRegion: '',
    childName: '',
    childAge: '',
    stallName: '',
    products: '',
    consentGiven: false
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({})
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [registrationResult, setRegistrationResult] = useState<{
    upload_token: string
    hasVideo: boolean
    stall_name: string
  } | null>(null)
  const [showFullConsent, setShowFullConsent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [presentationFile, setPresentationFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const handleFieldChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value })
    if (fieldErrors[field]) {
      setFieldErrors({ ...fieldErrors, [field]: null })
    }
  }

  const handleFieldBlur = (field: string, value: string) => {
    const error = validateField(field, value)
    setFieldErrors({ ...fieldErrors, [field]: error })
  }

  const getInputClass = (field: string) => {
    const baseClass = "w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-colors"
    return fieldErrors[field]
      ? `${baseClass} border-red-500 bg-red-50`
      : `${baseClass} border-gray-300`
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    // Validate all fields
    const errors: Record<string, string | null> = {}
    const fieldsToValidate = ['parentName', 'parentPhone', 'parentCity', 'parentRegion', 'childName']

    for (const field of fieldsToValidate) {
      const fieldError = validateField(field, formData[field as keyof typeof formData] as string)
      if (fieldError) errors[field] = fieldError
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setError('Opravte prosím chyby ve formuláři')
      setIsSubmitting(false)
      return
    }

    try {
      let presentationUrl: string | null = null

      // Upload presentation file if provided - with real progress tracking
      if (presentationFile) {
        setIsUploading(true)
        setUploadProgress(0)

        const fileExt = presentationFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        // Get Supabase credentials from the client instance
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        const uploadUrl = `${supabaseUrl}/storage/v1/object/presentations/${fileName}`

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

          xhr.open('POST', uploadUrl)
          xhr.setRequestHeader('Authorization', `Bearer ${supabaseKey}`)
          xhr.setRequestHeader('Content-Type', presentationFile.type)
          xhr.timeout = 600000 // 10 minut timeout pro velké soubory
          xhr.send(presentationFile)
        })

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('presentations')
          .getPublicUrl(fileName)

        presentationUrl = urlData.publicUrl
        setIsUploading(false)
        setUploadProgress(100)
      }

      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_name: formData.parentName.trim(),
          parent_email: formData.parentEmail.trim(),
          parent_phone: formData.parentPhone.replace(/\s/g, ''),
          parent_city: formData.parentCity.trim(),
          parent_region: formData.parentRegion,
          child_name: formData.childName.trim(),
          child_age: parseInt(formData.childAge),
          stall_name: formData.stallName.trim(),
          products: formData.products.trim(),
          presentation_url: presentationUrl,
          consent_given: formData.consentGiven
        })
      })

      if (!response.ok) {
        throw new Error('Nepodařilo se odeslat registraci')
      }

      const result = await response.json()
      setRegistrationResult({
        upload_token: result.upload_token,
        hasVideo: result.hasVideo,
        stall_name: result.stall_name
      })
      setFormSubmitted(true)
    } catch (err) {
      console.error('Registration error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Neznámá chyba'
      setError(`Nepodařilo se odeslat registraci: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
      setIsUploading(false)
    }
  }

  if (formSubmitted) {
    const uploadUrl = registrationResult?.upload_token
      ? `${typeof window !== 'undefined' ? window.location.origin : ''}/upload/${registrationResult.upload_token}`
      : null

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Registrace odeslána!</h2>

          {registrationResult?.hasVideo ? (
            <p className="text-gray-600 mb-6">
              Děkujeme za registraci na Dětské trhy. Vaše video bylo nahráno a brzy se ozveme s výsledkem hodnocení.
            </p>
          ) : (
            <>
              <p className="text-gray-600 mb-4">
                Děkujeme za registraci na Dětské trhy. Brzy Vás budeme kontaktovat ohledně validace tématu stánku.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-yellow-800 mb-2">
                  <strong>Video můžete nahrát kdykoliv do 28. února 2026</strong>
                </p>
                <p className="text-xs text-yellow-700 mb-2">
                  Pro nové účastníky doporučujeme nahrát krátké video (20-40s) představující váš projekt.
                </p>
                {uploadUrl && (
                  <div className="mt-3 p-2 bg-white rounded border border-yellow-300">
                    <p className="text-xs text-gray-500 mb-1">Odkaz pro nahrání videa:</p>
                    <a
                      href={uploadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#C8102E' }}
                      className="text-sm font-medium hover:underline break-all"
                    >
                      {uploadUrl}
                    </a>
                  </div>
                )}
              </div>
            </>
          )}

          <button
            onClick={() => {
              setFormSubmitted(false)
              setRegistrationResult(null)
              setFormData({
                parentName: '', parentEmail: '', parentPhone: '',
                parentCity: '', parentRegion: '',
                childName: '', childAge: '', stallName: '', products: '', consentGiven: false
              })
              setFieldErrors({})
              setPresentationFile(null)
            }}
            style={{ backgroundColor: '#C8102E' }}
            className="text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Zaregistrovat další dítě
          </button>
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

      {/* Hero section */}
      <div style={{ backgroundColor: '#C8102E' }} className="text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-5xl mb-4">🎪</div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">Dětské trhy</h1>
          <p className="text-xl text-white opacity-90">Srdcem pro lepší svět</p>
          <div className="mt-6 inline-flex items-center gap-4 text-white">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              24. května 2026
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Poděbrady
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Registrace stánku</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Zákonný zástupce */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" style={{ color: '#C8102E' }} />
                Zákonný zástupce
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jméno a příjmení *</label>
                  <input
                    type="text"
                    required
                    value={formData.parentName}
                    onChange={e => handleFieldChange('parentName', e.target.value)}
                    onBlur={e => handleFieldBlur('parentName', e.target.value)}
                    className={getInputClass('parentName')}
                  />
                  {fieldErrors.parentName && <p className="text-red-500 text-xs mt-1">{fieldErrors.parentName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                  <input
                    type="email"
                    required
                    value={formData.parentEmail}
                    onChange={e => handleFieldChange('parentEmail', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
                  <input
                    type="tel"
                    required
                    value={formData.parentPhone}
                    onChange={e => handleFieldChange('parentPhone', e.target.value)}
                    onBlur={e => handleFieldBlur('parentPhone', e.target.value)}
                    className={getInputClass('parentPhone')}
                    placeholder="např. 602282276"
                  />
                  {fieldErrors.parentPhone && <p className="text-red-500 text-xs mt-1">{fieldErrors.parentPhone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Město *</label>
                  <input
                    type="text"
                    required
                    value={formData.parentCity}
                    onChange={e => handleFieldChange('parentCity', e.target.value)}
                    onBlur={e => handleFieldBlur('parentCity', e.target.value)}
                    className={getInputClass('parentCity')}
                    placeholder="např. Praha"
                  />
                  {fieldErrors.parentCity && <p className="text-red-500 text-xs mt-1">{fieldErrors.parentCity}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kraj *</label>
                  <select
                    required
                    value={formData.parentRegion}
                    onChange={e => handleFieldChange('parentRegion', e.target.value)}
                    onBlur={e => handleFieldBlur('parentRegion', e.target.value)}
                    className={getInputClass('parentRegion')}
                  >
                    <option value="">Vyberte kraj</option>
                    {KRAJE_CR.map(kraj => (
                      <option key={kraj} value={kraj}>{kraj}</option>
                    ))}
                  </select>
                  {fieldErrors.parentRegion && <p className="text-red-500 text-xs mt-1">{fieldErrors.parentRegion}</p>}
                </div>
              </div>
            </div>

            {/* Dítě */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
                <Baby className="w-5 h-5 mr-2" style={{ color: '#C8102E' }} />
                Údaje o dítěti
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jméno dítěte *</label>
                  <input
                    type="text"
                    required
                    value={formData.childName}
                    onChange={e => handleFieldChange('childName', e.target.value)}
                    onBlur={e => handleFieldBlur('childName', e.target.value)}
                    className={getInputClass('childName')}
                  />
                  {fieldErrors.childName && <p className="text-red-500 text-xs mt-1">{fieldErrors.childName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Věk dítěte *</label>
                  <input
                    type="number"
                    required
                    min="5"
                    max="18"
                    value={formData.childAge}
                    onChange={e => handleFieldChange('childAge', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Stánek */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" style={{ color: '#C8102E' }} />
                Informace o stánku
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Název stánku *</label>
                  <input
                    type="text"
                    required
                    value={formData.stallName}
                    onChange={e => handleFieldChange('stallName', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-colors"
                    placeholder="např. Tomíkovy výtvory"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Konkrétní sortiment (produkt/služba) *</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.products}
                    onChange={e => handleFieldChange('products', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-colors resize-none"
                    placeholder="Popište co budete prodávat/nabízet..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Sortiment bude telefonicky validován pořadatelem</p>
                </div>
              </div>
            </div>

            {/* Prezentace - volitelné */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2" style={{ color: '#C8102E' }} />
                Prezentace projektu (volitelné)
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Pro nové účastníky: Nahrajte video, prezentaci, fotky nebo popis vašeho business plánu.
                Ukažte nám, čím jste jedineční a proč by to měl být na trhu právě VÁŠ projekt.
              </p>
              <p className="text-sm text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg mb-4">
                Video můžete nahrát nyní nebo kdykoliv později <strong>do 28. února 2026</strong>. Po odeslání registrace obdržíte odkaz pro dodatečné nahrání.
              </p>
              <div className="space-y-4">
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
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="mb-1 text-sm text-gray-500">
                        <span className="font-semibold">Klikněte pro nahrání</span> nebo přetáhněte soubor
                      </p>
                      <p className="text-xs text-gray-400">Video (MP4, MOV), obrázky (JPG, PNG) nebo PDF (max 50MB)</p>
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
              </div>
            </div>

            {/* Souhlas */}
            <div className="bg-gray-50 p-5 rounded-xl">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  required
                  id="consent"
                  checked={formData.consentGiven}
                  onChange={e => handleFieldChange('consentGiven', e.target.checked)}
                  className="mt-1 w-5 h-5 border-gray-300 rounded focus:ring-red-500 accent-red-600"
                />
                <div className="flex-1">
                  <label htmlFor="consent" className="text-sm text-gray-700 cursor-pointer">
                    <strong>Souhlasím s podmínkami účasti *</strong>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowFullConsent(!showFullConsent)}
                    style={{ color: '#C8102E' }}
                    className="ml-2 text-sm underline hover:opacity-80"
                  >
                    {showFullConsent ? 'Skrýt' : 'Zobrazit celé znění'}
                  </button>

                  {showFullConsent && (
                    <div className="mt-3 p-3 bg-white rounded-lg text-xs text-gray-600 border border-gray-200">
                      <div className="font-semibold mb-2 text-gray-800">
                        Souhlas zákonného zástupce se zapojením dítěte do aktivit spolku Calm2be, z.s.
                      </div>
                      <div className="whitespace-pre-wrap">{CONSENT_TEXT}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">
                  💰 <strong>Poplatek za stánek:</strong> 500 Kč – vybírá se na místě, až si stánek vydělá.
                </p>
              </div>

              <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">
                  📅 <strong>Deadline pro registraci:</strong> 28. února 2026 (1. kolo)
                </p>
                <p className="text-sm text-gray-600">
                  📬 <strong>Výsledky:</strong> nejpozději do půlky března 2026
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{ backgroundColor: '#C8102E' }}
              className="w-full text-white py-3.5 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isSubmitting ? (
                <span>Odesílám...</span>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Odeslat registraci
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Pořádá <strong>Calm2be z.s.</strong></p>
          <p className="mt-1">
            <a href="mailto:veronika@calm2be.cz" style={{ color: '#C8102E' }} className="hover:underline">veronika@calm2be.cz</a>
            <span className="mx-2">•</span>
            <a href="tel:+420602282276" style={{ color: '#C8102E' }} className="hover:underline">602 282 276</a>
          </p>
          <p className="mt-3">
            <a href="https://calm2be.cz" target="_blank" rel="noopener noreferrer" style={{ color: '#C8102E' }} className="hover:underline">
              www.calm2be.cz
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
