// Game utilities for audio, scoring, and speech recognition

let preferredVoice: SpeechSynthesisVoice | null = null
let recognition: SpeechRecognition | null = null

// Initialize best voice for text-to-speech
export function initializeBestVoice() {
  const voices = window.speechSynthesis.getVoices()

  if (voices.length === 0) {
    console.log('No voices available yet')
    return
  }

  // Priority order for natural, clear female voices
  // These are curated for best sound quality and natural pronunciation
  const voicePreferences = [
    // Chrome/Edge on Windows - Premium voices (most natural)
    (v: SpeechSynthesisVoice) => v.lang === 'en-US' && v.name === 'Microsoft Zira - English (United States)',
    (v: SpeechSynthesisVoice) => v.lang === 'en-US' && v.name.includes('Zira'),

    // Windows - Other natural sounding Microsoft voices
    (v: SpeechSynthesisVoice) => v.lang === 'en-US' && v.name.includes('Microsoft Aria'),
    (v: SpeechSynthesisVoice) => v.lang === 'en-US' && v.name.includes('Aria'),

    // Google Voices (if available)
    (v: SpeechSynthesisVoice) => v.lang === 'en-US' && v.name.includes('Google US English Female'),
    (v: SpeechSynthesisVoice) => v.lang === 'en-US' && v.name.includes('Google') && v.name.includes('Female'),

    // Apple voices (macOS/iOS)
    (v: SpeechSynthesisVoice) => v.lang === 'en-US' && (v.name.includes('Victoria') || v.name.includes('Moira')),
    (v: SpeechSynthesisVoice) => v.lang === 'en-US' && (v.name.includes('Samantha') || v.name.includes('Fiona')),

    // Any female voice
    (v: SpeechSynthesisVoice) => v.lang === 'en-US' && v.name.includes('Female'),
    (v: SpeechSynthesisVoice) => v.lang === 'en-US' && (v.name.toLowerCase().includes('woman') || v.name.toLowerCase().includes('girl')),

    // Any en-US voice
    (v: SpeechSynthesisVoice) => v.lang === 'en-US',
    (v: SpeechSynthesisVoice) => v.lang && v.lang.startsWith('en'),
  ]

  for (const matcher of voicePreferences) {
    const found = voices.find(matcher)
    if (found) {
      preferredVoice = found
      console.log('Voice selected:', found.name, '(', found.lang, ')')
      return
    }
  }

  // Last resort: use first available voice
  preferredVoice = voices[0]
  console.log('Fallback voice selected:', preferredVoice?.name)
}

// Load voices when available
export function setupVoiceListeners() {
  if ('onvoiceschanged' in window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = initializeBestVoice
  }
  setTimeout(initializeBestVoice, 100)
}

// Speak text using text-to-speech
export function speakText(text: string, isSingleLetter = false): Promise<void> {
  return new Promise((resolve) => {
    window.speechSynthesis.cancel()

    let textToSpeak = isSingleLetter ? text.toLowerCase() + '.' : text
    if (textToSpeak.includes('___')) {
      textToSpeak = textToSpeak.replace('___', '...')
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    utterance.lang = 'en-US'

    if (isSingleLetter) {
      utterance.rate = 0.8       // Slightly slower for clarity
      utterance.pitch = 1.1      // Slightly higher for friendliness (educational context)
      utterance.volume = 1.0     // Full volume
    } else {
      utterance.rate = 0.9       // Natural, conversational speed
      utterance.pitch = 1.0      // Natural pitch
      utterance.volume = 1.0     // Full volume
    }

    if (!preferredVoice) initializeBestVoice()
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    utterance.onend = () => resolve()
    utterance.onerror = () => resolve()

    window.speechSynthesis.speak(utterance)
  })
}

// Initialize speech recognition
export function initializeSpeechRecognition(): boolean {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

  if (!SpeechRecognition) {
    console.warn('Speech Recognition not supported')
    return false
  }

  try {
    recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.maxAlternatives = 3
    recognition.continuous = false
    return true
  } catch (e) {
    console.error('Failed to initialize speech recognition:', e)
    return false
  }
}

// Start listening for speech
export function startListening(
  onResult: (transcript: string) => void,
  onError?: (error: string) => void,
  timeout = 6000
): Promise<void> {
  return new Promise((resolve) => {
    if (!recognition) {
      onError?.('Speech recognition not available')
      resolve()
      return
    }

    let timeoutHandle: NodeJS.Timeout

    recognition.onstart = () => {
      console.log('Listening...')
      timeoutHandle = setTimeout(() => {
        try {
          recognition?.abort()
        } catch (e) {
          console.log('Error aborting:', e)
        }
        onError?.('No speech detected')
        resolve()
      }, timeout)
    }

    recognition.onresult = (event) => {
      clearTimeout(timeoutHandle)

      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript = event.results[i][0].transcript
          break
        }
      }

      if (transcript) {
        const clean = transcript.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
        onResult(clean)
        resolve()
      }
    }

    recognition.onerror = (event) => {
      clearTimeout(timeoutHandle)
      console.error('Speech error:', event.error)
      onError?.(event.error)
      resolve()
    }

    recognition.onend = () => {
      clearTimeout(timeoutHandle)
      resolve()
    }

    try {
      recognition.start()
    } catch (e) {
      console.error('Error starting recognition:', e)
      onError?.(String(e))
      resolve()
    }
  })
}

// Stop listening
export function stopListening() {
  if (recognition) {
    try {
      recognition.abort()
    } catch (e) {
      console.log('Error stopping recognition:', e)
    }
  }
}

// Check microphone permission
export async function checkMicrophonePermission(): Promise<boolean> {
  try {
    const permission = await navigator.permissions.query({ name: 'microphone' as any })
    return permission.state !== 'denied'
  } catch (e) {
    console.log('Permission check not supported')
    return true
  }
}

// Play sound effect
export function playSound(type: 'correct' | 'wrong' | 'bonus' = 'correct') {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  if (type === 'correct') {
    oscillator.frequency.value = 800
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.2)
  } else if (type === 'wrong') {
    oscillator.frequency.value = 300
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  } else if (type === 'bonus') {
    oscillator.frequency.value = 1200
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4)
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.4)
  }
}

// Export setup function to call from app
export function setupGameAudio() {
  setupVoiceListeners()
  initializeSpeechRecognition()
}
