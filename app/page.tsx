'use client'

import { useState } from 'react'
import { Send, CheckCircle, User, Baby, Package, Calendar, MapPin } from 'lucide-react'

const CONSENT_TEXT = `Souhlasím se zpracováním osobních údajů svého dítěte (jméno, příjmení, věk, fotografie a videa pořízená v rámci aktivit) spolkem Calm2be, z.s., IČO: 17901006, se sídlem Na Vinici 109/9, 290 01 Poděbrady. Tyto údaje mohou být použity pro organizaci akcí a také pro jejich propagaci (web, sociální sítě, propagační materiály). Souhlas je platný po dobu účasti dítěte na aktivitách a nejdéle 5 let od jeho udělení.

Byl/a jsem informován/a o svých právech – mohu kdykoliv požádat o přístup k údajům, jejich opravu nebo výmaz, vznést námitku proti jejich zpracování, případně souhlas odvolat na e-mailu: veronika@calm2be.cz.

Rozumím pravidlům dozoru – po dobu aktivit jsem přítomen/a a vykonávám nad dítětem dohled. Pokud dítě svěříme dozorujícím osobám spolku, účastní se aktivit na vlastní odpovědnost.`

export default function RegistrationPage() {
  const [formData, setFormData] = useState({
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    parentBirthDate: '',
    addressStreet: '',
    addressNumber: '',
    addressCity: '',
    addressPostalCode: '',
    childName: '',
    childAge: '',
    stallName: '',
    products: '',
    consentGiven: false
  })
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [showFullConsent, setShowFullConsent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_name: formData.parentName,
          parent_email: formData.parentEmail,
          parent_phone: formData.parentPhone,
          parent_birth_date: formData.parentBirthDate,
          address_street: formData.addressStreet,
          address_number: formData.addressNumber,
          address_city: formData.addressCity,
          address_postal_code: formData.addressPostalCode,
          child_name: formData.childName,
          child_age: parseInt(formData.childAge),
          stall_name: formData.stallName,
          products: formData.products,
          consent_given: formData.consentGiven
        })
      })

      if (!response.ok) {
        throw new Error('Nepodařilo se odeslat registraci')
      }

      setFormSubmitted(true)
    } catch (err) {
      setError('Nepodařilo se odeslat registraci. Zkuste to prosím znovu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (formSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Registrace odeslána!</h2>
          <p className="text-gray-600 mb-6">
            Děkujeme za registraci na Dětské trhy. Brzy Vás budeme kontaktovat ohledně validace tématu stánku.
          </p>
          <button
            onClick={() => {
              setFormSubmitted(false)
              setFormData({
                parentName: '', parentEmail: '', parentPhone: '', parentBirthDate: '',
                addressStreet: '', addressNumber: '', addressCity: '', addressPostalCode: '',
                childName: '', childAge: '', stallName: '', products: '', consentGiven: false
              })
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
          <a href="https://calm2be.cz" target="_blank" rel="noopener noreferrer" style={{ color: '#C8102E' }} className="text-2xl font-bold">
            calm<span className="font-normal">2</span>be
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
                    onChange={e => setFormData({...formData, parentName: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Datum narození *</label>
                  <input
                    type="date"
                    required
                    value={formData.parentBirthDate}
                    onChange={e => setFormData({...formData, parentBirthDate: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ulice *</label>
                  <input
                    type="text"
                    required
                    value={formData.addressStreet}
                    onChange={e => setFormData({...formData, addressStreet: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-colors"
                    placeholder="např. Hlavní"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Číslo popisné *</label>
                  <input
                    type="text"
                    required
                    value={formData.addressNumber}
                    onChange={e => setFormData({...formData, addressNumber: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-colors"
                    placeholder="např. 123/4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Město *</label>
                  <input
                    type="text"
                    required
                    value={formData.addressCity}
                    onChange={e => setFormData({...formData, addressCity: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-colors"
                    placeholder="např. Praha"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PSČ *</label>
                  <input
                    type="text"
                    required
                    value={formData.addressPostalCode}
                    onChange={e => setFormData({...formData, addressPostalCode: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-colors"
                    placeholder="např. 110 00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                  <input
                    type="email"
                    required
                    value={formData.parentEmail}
                    onChange={e => setFormData({...formData, parentEmail: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
                  <input
                    type="tel"
                    required
                    value={formData.parentPhone}
                    onChange={e => setFormData({...formData, parentPhone: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-colors"
                  />
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jméno a příjmení dítěte *</label>
                  <input
                    type="text"
                    required
                    value={formData.childName}
                    onChange={e => setFormData({...formData, childName: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Věk dítěte *</label>
                  <input
                    type="number"
                    required
                    min="5"
                    max="18"
                    value={formData.childAge}
                    onChange={e => setFormData({...formData, childAge: e.target.value})}
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
                    onChange={e => setFormData({...formData, stallName: e.target.value})}
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
                    onChange={e => setFormData({...formData, products: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-colors resize-none"
                    placeholder="Popište co budete prodávat/nabízet..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Sortiment bude telefonicky validován pořadatelem</p>
                </div>
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
                  onChange={e => setFormData({...formData, consentGiven: e.target.checked})}
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
