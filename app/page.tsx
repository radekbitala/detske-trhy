'use client'

import { useState } from 'react'
import { Send, CheckCircle, User, Baby, Package } from 'lucide-react'

const CONSENT_TEXT = `Souhlasím se zpracováním osobních údajů svého dítěte (jméno, příjmení, věk, fotografie a videa pořízená v rámci aktivit) spolkem Calm2be, z.s., IČO: 17901006, se sídlem Na Vinici 109/9, 290 01 Poděbrady. Tyto údaje mohou být použity pro organizaci akcí a také pro jejich propagaci (web, sociální sítě, propagační materiály). Souhlas je platný po dobu účasti dítěte na aktivitách a nejdéle 5 let od jeho udělení.

Byl/a jsem informován/a o svých právech – mohu kdykoliv požádat o přístup k údajům, jejich opravu nebo výmaz, vznést námitku proti jejich zpracování, případně souhlas odvolat na e-mailu: veronika@calm2be.cz.

Rozumím pravidlům dozoru – po dobu aktivit jsem přítomen/a a vykonávám nad dítětem dohled. Pokud dítě svěříme dozorujícím osobám spolku, účastní se aktivit na vlastní odpovědnost.`

export default function RegistrationPage() {
  const [formData, setFormData] = useState({
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    parentBirthDate: '',
    parentAddress: '',
    childName: '',
    childAge: '',
    city: '',
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
          parent_address: formData.parentAddress,
          child_name: formData.childName,
          child_age: parseInt(formData.childAge),
          city: formData.city,
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
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
                parentAddress: '', childName: '', childAge: '', city: '', stallName: '',
                products: '', consentGiven: false
              })
            }}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Zaregistrovat další dítě
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎪</div>
          <h1 className="text-3xl font-bold text-purple-800 mb-2">Dětské trhy</h1>
          <p className="text-lg text-purple-600">Srdcem pro lepší svět</p>
          <p className="text-gray-500 mt-1">24. května 2026 • Poděbrady</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Registrace stánku</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Zákonný zástupce */}
            <div className="border-b pb-6">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-purple-600" />
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Datum narození *</label>
                  <input
                    type="date"
                    required
                    value={formData.parentBirthDate}
                    onChange={e => setFormData({...formData, parentBirthDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresa trvalého bydliště *</label>
                  <input
                    type="text"
                    required
                    value={formData.parentAddress}
                    onChange={e => setFormData({...formData, parentAddress: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    placeholder="Ulice, číslo, město, PSČ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                  <input
                    type="email"
                    required
                    value={formData.parentEmail}
                    onChange={e => setFormData({...formData, parentEmail: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
                  <input
                    type="tel"
                    required
                    value={formData.parentPhone}
                    onChange={e => setFormData({...formData, parentPhone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Dítě */}
            <div className="border-b pb-6">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
                <Baby className="w-5 h-5 mr-2 text-purple-600" />
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="md:col-span-2 md:w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Město, kde žijete *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={e => setFormData({...formData, city: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Stánek */}
            <div className="border-b pb-6">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2 text-purple-600" />
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                    placeholder="Popište co budete prodávat/nabízet..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Sortiment bude telefonicky validován pořadatelem</p>
                </div>
              </div>
            </div>

            {/* Souhlas */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  required
                  id="consent"
                  checked={formData.consentGiven}
                  onChange={e => setFormData({...formData, consentGiven: e.target.checked})}
                  className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <div className="flex-1">
                  <label htmlFor="consent" className="text-sm text-gray-700 cursor-pointer">
                    <strong>Souhlasím s podmínkami účasti *</strong>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowFullConsent(!showFullConsent)}
                    className="ml-2 text-purple-600 text-sm underline hover:text-purple-800"
                  >
                    {showFullConsent ? 'Skrýt' : 'Zobrazit celé znění'}
                  </button>
                  
                  {showFullConsent && (
                    <div className="mt-3 p-3 bg-white rounded-lg text-xs text-gray-600 border border-purple-200">
                      <div className="font-semibold mb-2 text-gray-800">
                        Souhlas zákonného zástupce se zapojením dítěte do aktivit spolku Calm2be, z.s.
                      </div>
                      <div className="whitespace-pre-wrap">{CONSENT_TEXT}</div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-white rounded-lg">
                <p className="text-sm text-gray-600">
                  💰 <strong>Poplatek za stánek:</strong> 500 Kč – vybírá se na místě, až si stánek vydělá.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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

        <div className="mt-6 text-center text-sm text-gray-500">
          Pořádá <strong>Calm2be z.s.</strong> • Kontakt: <a href="mailto:veronika@calm2be.cz" className="text-purple-600 hover:underline">veronika@calm2be.cz</a>
        </div>
      </div>
    </div>
  )
}
