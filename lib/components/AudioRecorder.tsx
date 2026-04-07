'use client'

import { useState, useRef, useEffect } from 'react'

interface AudioRecorderProps {
  onSave: (blob: Blob, fileName: string) => void
  label?: string
}

export default function AudioRecorder({ onSave, label = 'Record Audio' }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isRecording) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
      return
    }

    timerIntervalRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [isRecording])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioChunksRef.current = []
      setRecordingTime(0)
      setRecordedAudio(null)

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        setRecordedAudio(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('❌ לא ניתן לגשת למיקרופון. אנא בדקו את ההרשאות.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const playRecording = () => {
    if (recordedAudio) {
      const url = URL.createObjectURL(recordedAudio)
      const audio = new Audio(url)
      audio.play()
    }
  }

  const saveRecording = (fileName: string) => {
    if (!recordedAudio || !fileName) {
      alert('⚠️ אנא הזינו שם קובץ')
      return
    }

    onSave(recordedAudio, fileName)
    setRecordedAudio(null)
    setRecordingTime(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-pastel-blue">
      <h3 className="text-xl font-bold text-gray-800 mb-6">🎤 {label}</h3>

      {/* Recording Controls */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={startRecording}
          disabled={isRecording}
          className="flex-1 bg-pastel-red text-white font-bold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition"
        >
          🔴 התחל הקלטה
        </button>
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className="flex-1 bg-pastel-blue text-white font-bold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition"
        >
          ⏹️ עצור
        </button>
      </div>

      {/* Recording Time Display */}
      {isRecording && (
        <div className="text-center mb-6">
          <p className="text-3xl font-bold text-pastel-red animate-pulse">
            ⏱️ {formatTime(recordingTime)}
          </p>
          <p className="text-sm text-gray-600 mt-2">מקליט...</p>
        </div>
      )}

      {/* Recorded Audio Preview */}
      {recordedAudio && (
        <div className="bg-pastel-light-green rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-gray-800">✅ הקלטה שמורה</p>
              <p className="text-sm text-gray-600">משך: {formatTime(recordingTime)}</p>
            </div>
            <button
              onClick={playRecording}
              className="bg-pastel-blue text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
            >
              ▶️ השמע
            </button>
          </div>

          <input
            type="text"
            placeholder="שם הקובץ (למשל: apple)"
            id="fileName"
            className="w-full px-4 py-2 border-2 border-pastel-blue rounded-lg mb-3 focus:outline-none focus:border-pastel-green"
          />

          <button
            onClick={() => {
              const fileName = (document.getElementById('fileName') as HTMLInputElement)?.value
              saveRecording(fileName)
            }}
            className="w-full bg-pastel-green text-white font-bold py-3 rounded-lg hover:opacity-90 transition"
          >
            ✅ שמור הקלטה
          </button>
        </div>
      )}

      {/* Help Text */}
      <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
        <p className="mb-2">💡 <strong>טיפים:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>בדקו שהמיקרופון פועל כראוי</li>
          <li>דברו בבירור וברומה טבעית</li>
          <li>הקלטה קצרה היא בדרך כלל טובה יותר</li>
          <li>תנו שם משמעותי לכל הקלטה</li>
        </ul>
      </div>
    </div>
  )
}
