// Reusable SVG Icons for the app
import React from 'react'

interface IconProps {
  className?: string
  color?: string
}

// Game Type Icons
export const LettersIcon = ({ className = 'w-12 h-12', color = 'currentColor' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" className={className}>
    <path d="M4 6h16M4 12h16M4 18h16M6 9v6M10 9v6M14 9v6M18 9v6" />
  </svg>
)

export const SoundsIcon = ({ className = 'w-12 h-12', color = 'currentColor' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" className={className}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 5.47a9 9 0 0 1 0 12.74M19.07 4.93a16 16 0 0 1 0 14.14" />
  </svg>
)

export const MissingLetterIcon = ({ className = 'w-12 h-12', color = 'currentColor' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" className={className}>
    <path d="M6 4h12v16H6z" />
    <text x="12" y="16" textAnchor="middle" fontSize="10" fill={color} fontWeight="bold">
      _
    </text>
    <path d="M9 8h6M9 12h6" />
  </svg>
)

export const EliminationIcon = ({ className = 'w-12 h-12', color = 'currentColor' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" className={className}>
    <circle cx="8" cy="8" r="3" />
    <circle cx="16" cy="8" r="3" />
    <circle cx="12" cy="16" r="3" />
    <line x1="8" y1="8" x2="16" y2="8" />
    <line x1="8" y1="8" x2="12" y2="16" />
    <line x1="16" y1="8" x2="12" y2="16" />
  </svg>
)

export const SentencesIcon = ({ className = 'w-12 h-12', color = 'currentColor' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" className={className}>
    <path d="M3 7v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7" />
    <line x1="5" y1="10" x2="19" y2="10" />
    <line x1="5" y1="14" x2="19" y2="14" />
  </svg>
)

export const SpeakingIcon = ({ className = 'w-12 h-12', color = 'currentColor' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" className={className}>
    <path d="M12 2C6.48 2 2 5.58 2 10c0 2.15.84 4.16 2.24 5.75.1.13.16.3.12.46l-.6 2.36c-.08.32.15.6.48.6.05 0 .1 0 .15-.02l2.55-1.1c.16-.07.36-.06.54.05 1.6.9 3.49 1.4 5.5 1.4 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
    <circle cx="9" cy="10" r="1" fill={color} />
    <circle cx="15" cy="10" r="1" fill={color} />
  </svg>
)

export const MemoryIcon = ({ className = 'w-12 h-12', color = 'currentColor' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" className={className}>
    <rect x="3" y="3" width="8" height="8" rx="1" />
    <rect x="13" y="3" width="8" height="8" rx="1" />
    <rect x="3" y="13" width="8" height="8" rx="1" />
    <rect x="13" y="13" width="8" height="8" rx="1" />
  </svg>
)

// UI Icons
export const PlayIcon = ({ className = 'w-6 h-6', color = 'currentColor' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill={color} className={className}>
    <path d="M8 5v14l11-7z" />
  </svg>
)

export const MicIcon = ({ className = 'w-6 h-6', color = 'currentColor' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" className={className}>
    <path d="M12 1a3 3 0 0 0-3 3v12a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
)

export const CheckIcon = ({ className = 'w-6 h-6', color = 'currentColor' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" className={className}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
)

export const XIcon = ({ className = 'w-6 h-6', color = 'currentColor' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" className={className}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

export const BackIcon = ({ className = 'w-6 h-6', color = 'currentColor' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" className={className}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
)

export const ListenIcon = ({ className = 'w-6 h-6', color = 'currentColor' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" className={className}>
    <path d="M9 18.5a4.5 4.5 0 1 0 9 0M1 12a11 11 0 0 1 22 0" />
  </svg>
)
