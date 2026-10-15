import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Play, X, AlertTriangle } from 'lucide-react'
import type { Lang } from '../data/translations'
import { GUIDE_VIDEOS, findVideoPart, videoSources } from '../data/stepVideos'
import { VIDEO_PARTS_TEXT, VIDEO_UI } from '../data/videoGuideText'

export type GuideMode = 'text' | 'video'

export interface OpenVideoRequest {
  id: string
  title: string
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Comutator TEXT / VIDEO — se pune deasupra primului pas al unui ghid. */
export function GuideModeToggle({
  mode,
  onChange,
  lang,
}: {
  mode: GuideMode
  onChange: (mode: GuideMode) => void
  lang: Lang
}) {
  const ui = VIDEO_UI[lang] || VIDEO_UI.en
  return (
    <div className="guide-mode-toggle" role="group" aria-label={ui.modeLabel}>
      <button
        type="button"
        className={`guide-mode-btn ${mode === 'text' ? 'active' : ''}`}
        aria-pressed={mode === 'text'}
        onClick={() => onChange('text')}
      >
        <BookOpen size={15} />
        <span>TEXT</span>
      </button>
      <button
        type="button"
        className={`guide-mode-btn ${mode === 'video' ? 'active' : ''}`}
        aria-pressed={mode === 'video'}
        onClick={() => onChange('video')}
      >
        <Play size={15} fill="currentColor" />
        <span>VIDEO</span>
      </button>
    </div>
  )
}

/** Lista de clipuri a unui ghid, cu textul „ce facem în fiecare clip". */
export function VideoGuide({
  guideId,
  lang,
  onOpen,
  extras,
  footer,
}: {
  guideId: string
  lang: Lang
  onOpen: (req: OpenVideoRequest) => void
  /** Conținut suplimentar în cardul unui clip (ex: butoanele de download), cheia = id-ul clipului */
  extras?: Record<string, ReactNode>
  /** Conținut după ultimul clip (ex: o avertizare) */
  footer?: ReactNode
}) {
  const ui = VIDEO_UI[lang] || VIDEO_UI.en
  const texts = VIDEO_PARTS_TEXT[lang] || VIDEO_PARTS_TEXT.en
  const parts = GUIDE_VIDEOS[guideId] || []

  return (
    <div className="video-guide-stack">
      {parts.map((part, i) => {
        const text = texts[part.id] || VIDEO_PARTS_TEXT.en[part.id]
        if (!text) return null
        const stepLabel = `${part.steps.includes('–') ? ui.steps : ui.step} ${part.steps}`
        const fullTitle = `${stepLabel} · ${text.title}`
        return (
          <div className="video-part-card" key={part.id}>
            <button
              type="button"
              className="video-part-thumb"
              onClick={() => onOpen({ id: part.id, title: fullTitle })}
              aria-label={`${ui.tapToWatch}: ${text.title}`}
            >
              <span className="video-part-chip video-part-chip-steps">{stepLabel}</span>
              <span className="video-part-chip video-part-chip-time">{part.duration}</span>
              <span className="video-part-play">
                <Play size={30} fill="currentColor" />
              </span>
              <span className="video-part-hint">{ui.tapToWatch}</span>
            </button>
            <div className="video-part-body">
              <div className="video-part-kicker">
                {String(i + 1).padStart(2, '0')} · {ui.clipHeading}
              </div>
              <h3>{text.title}</h3>
              <ul className="video-part-list">
                {text.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              {extras?.[part.id]}
            </div>
          </div>
        )
      })}
      {footer}
    </div>
  )
}

/** Modal aproape full-screen cu clipul în loop. */
export function StepVideoModal({
  request,
  lang,
  onClose,
}: {
  request: OpenVideoRequest
  lang: Lang
  onClose: () => void
}) {
  const ui = VIDEO_UI[lang] || VIDEO_UI.en
  const part = findVideoPart(request.id)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [paused, setPaused] = useState(false)
  const [failed, setFailed] = useState(false)
  const [time, setTime] = useState({ cur: 0, dur: 0 })
  const [scrubbing, setScrubbing] = useState(false)

  // Escape închide modalul
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Pornește clipul; dacă iOS blochează autoplay (Low Power Mode), arătăm butonul de play
  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    // Fără sunet, indiferent dacă fișierul are pistă audio sau nu
    el.muted = true
    el.volume = 0
    el.play().catch(() => setPaused(true))
  }, [])

  const keepSilent = () => {
    const el = videoRef.current
    if (el && (!el.muted || el.volume > 0)) {
      el.muted = true
      el.volume = 0
    }
  }

  const syncTime = () => {
    const el = videoRef.current
    if (!el || scrubbing) return
    setTime({ cur: el.currentTime, dur: Number.isFinite(el.duration) ? el.duration : 0 })
  }

  const togglePlay = () => {
    const el = videoRef.current
    if (!el) return
    if (el.paused) {
      el.play().then(() => setPaused(false)).catch(() => setPaused(true))
    } else {
      el.pause()
      setPaused(true)
    }
  }

  const seek = (value: number) => {
    const el = videoRef.current
    setTime((t) => ({ ...t, cur: value }))
    if (el) el.currentTime = value
  }

  if (!part) return null
  const src = videoSources(part)

  return (
    <motion.div
      className="step-video-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={request.title}
    >
      <motion.div
        className="step-video-card"
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="step-video-header">
          <span className="step-video-title">{request.title}</span>
          <button type="button" className="step-video-close" onClick={onClose} aria-label={ui.close}>
            <X size={20} />
          </button>
        </div>

        <div className="step-video-stage" onClick={togglePlay}>
          {failed ? (
            <div className="step-video-error">
              <AlertTriangle size={28} />
              <span>{ui.loadError}</span>
            </div>
          ) : (
            <video
              ref={videoRef}
              className="step-video-el"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              onTimeUpdate={syncTime}
              onLoadedMetadata={syncTime}
              onVolumeChange={keepSilent}
            >
              <source src={src.webm} type="video/webm" onError={src.mp4 ? undefined : () => setFailed(true)} />
              {src.mp4 && <source src={src.mp4} type="video/mp4" onError={() => setFailed(true)} />}
            </video>
          )}
          {paused && !failed && (
            <div className="step-video-playicon" aria-hidden="true">
              <Play size={34} fill="currentColor" />
            </div>
          )}
        </div>

        {!failed && (
          <div className="step-video-controls">
            <input
              type="range"
              className="step-video-range"
              min={0}
              max={time.dur || 1}
              step={0.05}
              value={Math.min(time.cur, time.dur || 1)}
              onChange={(e) => seek(Number(e.target.value))}
              onPointerDown={() => setScrubbing(true)}
              onPointerUp={() => setScrubbing(false)}
              onPointerCancel={() => setScrubbing(false)}
              onBlur={() => setScrubbing(false)}
              aria-label="Seek"
            />
            <span className="step-video-time">
              {formatTime(time.cur)} / {formatTime(time.dur)}
            </span>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
