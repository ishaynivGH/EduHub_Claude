// Custom voice system using audio clips
// Users can provide their own audio files for different game contexts

interface AudioClip {
  id: string
  text: string
  audioPath: string
}

// This will be loaded from uploaded audio files
let customAudioLibrary: Map<string, AudioClip> = new Map()

/**
 * Initialize custom audio library with user-provided clips
 * Audio files should be organized by context: /public/audio/voices/[context]/[filename].mp3
 *
 * Example structure:
 * /public/audio/voices/letters/a.mp3
 * /public/audio/voices/letters/b.mp3
 * /public/audio/voices/words/apple.mp3
 * /public/audio/voices/words/ball.mp3
 * /public/audio/voices/feedback/correct.mp3
 * /public/audio/voices/feedback/wrong.mp3
 */
export function initializeCustomVoice(audioLibrary: Record<string, string>) {
  customAudioLibrary.clear()
  Object.entries(audioLibrary).forEach(([key, path]) => {
    customAudioLibrary.set(key, {
      id: key,
      text: key,
      audioPath: path,
    })
  })
  console.log('✅ Custom voice library initialized with', customAudioLibrary.size, 'clips')
}

/**
 * Play a custom audio clip
 * @param textOrId - The text to speak or the audio clip ID
 * @param context - The context (e.g., 'letters', 'words', 'feedback')
 */
export async function playCustomVoice(textOrId: string, context: string = 'default'): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Try to find audio clip by ID first
      let audioPath = null
      const clipId = `${context}/${textOrId.toLowerCase()}`

      if (customAudioLibrary.has(clipId)) {
        const clip = customAudioLibrary.get(clipId)
        audioPath = clip?.audioPath
      } else if (customAudioLibrary.has(textOrId)) {
        const clip = customAudioLibrary.get(textOrId)
        audioPath = clip?.audioPath
      }

      if (!audioPath) {
        console.warn(`⚠️ No audio clip found for: ${textOrId} (context: ${context})`)
        resolve()
        return
      }

      // Create and play audio element
      const audio = new Audio(audioPath)
      audio.onended = () => resolve()
      audio.onerror = (error) => {
        console.error('Error playing audio:', error)
        resolve() // Resolve anyway so game doesn't break
      }

      audio.play().catch((error) => {
        console.error('Error playing audio file:', error)
        resolve()
      })
    } catch (error) {
      console.error('Custom voice error:', error)
      resolve()
    }
  })
}

/**
 * Check if custom audio is available for a specific text
 */
export function hasCustomAudio(textOrId: string, context: string = 'default'): boolean {
  const clipId = `${context}/${textOrId.toLowerCase()}`
  return customAudioLibrary.has(clipId) || customAudioLibrary.has(textOrId)
}

/**
 * Get list of all available audio clips
 */
export function getAvailableAudioClips(): string[] {
  return Array.from(customAudioLibrary.keys())
}

/**
 * Add a single audio clip to the library
 * @param id - Unique identifier (e.g., 'letters/a' or 'words/apple')
 * @param audioPath - Path to the audio file (relative to /public)
 */
export function addAudioClip(id: string, audioPath: string) {
  customAudioLibrary.set(id, {
    id,
    text: id,
    audioPath,
  })
  console.log(`✅ Added audio clip: ${id}`)
}

/**
 * Remove an audio clip from the library
 */
export function removeAudioClip(id: string) {
  customAudioLibrary.delete(id)
  console.log(`✅ Removed audio clip: ${id}`)
}
