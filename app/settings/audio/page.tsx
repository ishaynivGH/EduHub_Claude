'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AudioSettingsPage() {
  const [uploadedClips, setUploadedClips] = useState<Record<string, string>>({})
  const [selectedContext, setSelectedContext] = useState('letters')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [clipName, setClipName] = useState('')

  const contexts = ['letters', 'words', 'feedback', 'instructions']

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUploadClip = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile || !clipName) return

    // In a real implementation, this would upload to a server
    // For now, we'll store the file locally
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      const clipId = `${selectedContext}/${clipName.toLowerCase()}`
      setUploadedClips((prev) => ({
        ...prev,
        [clipId]: dataUrl,
      }))
      setClipName('')
      setSelectedFile(null)
      alert(`✅ Audio clip uploaded: ${clipId}`)
    }
    reader.readAsDataURL(selectedFile)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pastel-light-blue via-white to-pastel-light-green p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <button className="text-pastel-blue hover:text-pastel-green transition mb-4">
              ← חזור לדשבורד
            </button>
          </Link>
          <h1 className="text-4xl font-bold text-pastel-blue mb-2">🎤 הגדרות קול מותאם</h1>
          <p className="text-gray-600">
            העלו קטעי אודיו משלכם כדי להחליף את קול ה-TTS המכני בקול טבעי שלכם
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📤 העלו קטעי אודיו</h2>

          <form onSubmit={handleUploadClip} className="space-y-6">
            {/* Context Selection */}
            <div>
              <label className="block text-gray-700 font-semibold mb-3">קטגוריה</label>
              <select
                value={selectedContext}
                onChange={(e) => setSelectedContext(e.target.value)}
                className="w-full px-4 py-3 border-2 border-pastel-blue rounded-lg focus:outline-none focus:border-pastel-green"
              >
                {contexts.map((ctx) => (
                  <option key={ctx} value={ctx}>
                    {ctx === 'letters' && 'אותיות'}
                    {ctx === 'words' && 'מילים'}
                    {ctx === 'feedback' && 'משוב (נכון/לא נכון)'}
                    {ctx === 'instructions' && 'הנחיות'}
                  </option>
                ))}
              </select>
            </div>

            {/* Clip Name */}
            <div>
              <label className="block text-gray-700 font-semibold mb-3">שם הקטע</label>
              <input
                type="text"
                value={clipName}
                onChange={(e) => setClipName(e.target.value)}
                placeholder="למשל: apple, ball, correct"
                className="w-full px-4 py-3 border-2 border-pastel-blue rounded-lg focus:outline-none focus:border-pastel-green"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-gray-700 font-semibold mb-3">בחרו קובץ אודיו (MP3/WAV)</label>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="w-full px-4 py-3 border-2 border-pastel-blue rounded-lg focus:outline-none"
              />
            </div>

            {/* Upload Button */}
            <button
              type="submit"
              disabled={!selectedFile || !clipName}
              className="w-full bg-pastel-green text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 disabled:opacity-50 transition"
            >
              ✅ העלו קטע אודיו
            </button>
          </form>
        </div>

        {/* Instructions */}
        <div className="bg-pastel-light-blue rounded-3xl p-8 mb-8">
          <h3 className="text-xl font-bold text-pastel-blue mb-4">📋 הנחיות</h3>
          <ul className="space-y-3 text-gray-700">
            <li>
              <strong>אותיות:</strong> העלו קטעי אודיו לכל אות (a.mp3, b.mp3, וכו')
            </li>
            <li>
              <strong>מילים:</strong> העלו קטעים של מילים שלמות (apple.mp3, ball.mp3, וכו')
            </li>
            <li>
              <strong>משוב:</strong> העלו &quot;correct.mp3&quot; ו-&quot;wrong.mp3&quot;
            </li>
            <li>
              <strong>הנחיות:</strong> העלו &quot;listen.mp3&quot;, &quot;speak.mp3&quot;, וכו'
            </li>
          </ul>
        </div>

        {/* Uploaded Clips */}
        {Object.keys(uploadedClips).length > 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">✅ קטעים שהועלו</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(uploadedClips).map(([id, _]) => (
                <div key={id} className="bg-pastel-light-green p-4 rounded-lg flex items-center justify-between">
                  <span className="font-semibold text-gray-800">{id}</span>
                  <button
                    onClick={() => {
                      const audio = new Audio(uploadedClips[id])
                      audio.play()
                    }}
                    className="bg-pastel-blue text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
                  >
                    ▶️ השמעה
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Note */}
        <div className="mt-8 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            💡 <strong>הערה:</strong> קטעי האודיו מאוחסנים כרגע בדפדפן. בעתיד, נוכל להעלות אותם לשרת כדי לשמור אותם בצמיתות.
          </p>
        </div>
      </div>
    </main>
  )
}
