/**
 * Speech Recognition (STT) and Speech Synthesis (TTS) Helper Utilities
 * Supports Indian regional languages (Telugu, Hindi, Tamil, Kannada, Malayalam, Marathi, Gujarati, Bengali, Punjabi) & English.
 */

export const LANGUAGE_BCP47_MAP: Record<string, string> = {
  English: 'en-IN',
  Hindi: 'hi-IN',
  Telugu: 'te-IN',
  Tamil: 'ta-IN',
  Kannada: 'kn-IN',
  Malayalam: 'ml-IN',
  Marathi: 'mr-IN',
  Gujarati: 'gu-IN',
  Bengali: 'bn-IN',
  Punjabi: 'pa-IN',
  Urdu: 'ur-IN',
  Odia: 'or-IN',
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
}

export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false
  return 'speechSynthesis' in window
}

export function speakText(text: string, languageName: string = 'English', onEnd?: () => void) {
  if (!isSpeechSynthesisSupported() || !text) return

  try {
    window.speechSynthesis.cancel() // Stop ongoing speech
    const utterance = new SpeechSynthesisUtterance(text)
    const bcp47 = LANGUAGE_BCP47_MAP[languageName] || 'en-IN'
    utterance.lang = bcp47
    utterance.rate = 0.95
    utterance.pitch = 1.0

    if (onEnd) {
      utterance.onend = onEnd
      utterance.onerror = onEnd
    }

    window.speechSynthesis.speak(utterance)
  } catch {
    // Ignore speech synthesis error
  }
}

export function stopSpeaking() {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel()
    } catch {
      // Ignore
    }
  }
}

export interface SpeechRecognitionOptions {
  languageName?: string
  onStart?: () => void
  onResult: (transcript: string) => void
  onError?: (error: string) => void
  onEnd?: () => void
}

export function startSpeechRecognition(options: SpeechRecognitionOptions) {
  if (!isSpeechRecognitionSupported()) {
    options.onError?.('Speech recognition is not supported in this browser.')
    return null
  }

  try {
    const SpeechRecognition =
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition ||
      (window as unknown as Record<string, unknown>).SpeechRecognition

    const instance = new (SpeechRecognition as new () => any)()
    const bcp47 = LANGUAGE_BCP47_MAP[options.languageName || 'English'] || 'en-IN'
    instance.lang = bcp47
    instance.interimResults = false
    instance.maxAlternatives = 1

    instance.onstart = () => options.onStart?.()
    instance.onresult = (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript || ''
      options.onResult(transcript)
    }
    instance.onerror = (event: any) => {
      options.onError?.(event.error || 'Voice input failed.')
    }
    instance.onend = () => options.onEnd?.()

    instance.start()
    return instance
  } catch (err) {
    options.onError?.(err instanceof Error ? err.message : 'Could not start microphone.')
    return null
  }
}
