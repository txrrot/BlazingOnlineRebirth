import React, { useState, useEffect, useRef } from 'react'

export interface SectionBgVideoProps {
  /** Relative or absolute URL to WebM video (e.g. /videos/bg/hero-bg.webm) */
  src: string
  /** Video opacity once loaded (default: 0.22) */
  opacity?: number
  /** Custom overlay gradient CSS string to ensure optimal contrast */
  overlayGradient?: string
  /** CSS mix-blend-mode (normal, screen, overlay, soft-light, etc.) */
  blendMode?: 'normal' | 'screen' | 'overlay' | 'soft-light' | 'luminosity'
  /** Render video in high-contrast Black & White / Grayscale (default: true) */
  grayscale?: boolean
  /** Custom CSS filter override */
  filter?: string
  /** Additional custom class names */
  className?: string
}

/**
 * Premium background looping WebM video component.
 * Features:
 * - Viewport-pinned Sticky container: tall sections NEVER stretch or distort the video!
 * - Subtle parallax movement (-35px to +35px) as the user scrolls through the section.
 * - IntersectionObserver lifecycle: only plays when near viewport (+/- 450px),
 *   pauses offscreen videos to save 100% CPU/GPU decoding!
 * - High-contrast black & white manga cinematic filter with deep moodiness.
 * - Protective vignette/gradient overlay for crystal-clear readability.
 */
export const SectionBgVideo: React.FC<SectionBgVideoProps> = ({
  src,
  opacity = 0.22,
  overlayGradient,
  blendMode = 'normal',
  grayscale = true,
  filter,
  className = '',
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isNearViewport, setIsNearViewport] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const BASE = import.meta.env.BASE_URL || '/'
  const basePath = src.startsWith('http://') || src.startsWith('https://')
    ? src
    : `${BASE.replace(/\/$/, '')}/${src.replace(/^\//, '')}`
  const resolvedSrc = basePath.includes('?') ? basePath : `${basePath}?v=3`

  const videoFilter =
    filter ||
    (grayscale
      ? 'grayscale(100%) contrast(1.15) brightness(0.72)'
      : 'brightness(0.75)')

  const syncPosition = () => {
    const container = containerRef.current
    const video = videoRef.current
    if (!container || !video) return

    const rect = container.getBoundingClientRect()
    const windowH = window.innerHeight
    // Video is 35vh taller than viewport, giving 35vh of travel room
    const extraTravel = windowH * 0.35

    let progress = 0
    if (rect.height > windowH) {
      // Content scrolls through section from rect.top = 0 to rect.bottom = windowH
      const maxScroll = rect.height - windowH
      progress = Math.max(0, Math.min(1, -rect.top / maxScroll))
    } else {
      // Section is shorter than 100vh
      const totalDist = rect.height + windowH
      progress = Math.max(0, Math.min(1, (windowH - rect.top) / totalDist))
    }

    const translateY = -progress * extraTravel
    video.style.transform = `translate3d(-50%, ${translateY.toFixed(1)}px, 0)`
  }

  // 1. Intersection Observer: only play when within 450px of viewport
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inRange = entry.isIntersecting
        setIsNearViewport(inRange)

        const video = videoRef.current
        if (!video) return

        if (inRange) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      {
        rootMargin: '450px 0px 450px 0px',
        threshold: 0,
      }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // 2. Parallax scroll: elements move fast, video pans proportionally from top to max bottom
  useEffect(() => {
    if (!isNearViewport) return

    let rafId: number
    const onScroll = () => {
      rafId = requestAnimationFrame(syncPosition)
    }

    syncPosition()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [isNearViewport])

  // 3. Reload video when src changes
  useEffect(() => {
    setIsLoaded(false)
    setHasError(false)
    if (videoRef.current && isNearViewport) {
      videoRef.current.load()
      videoRef.current.play().catch(() => {})
      syncPosition()
    }
  }, [resolvedSrc, isNearViewport])

  if (hasError) return null

  return (
    <div
      ref={containerRef}
      className={`section-video-bg-container ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'clip',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden="true"
    >
      {/* Viewport-pinned Sticky Window: video NEVER distorts and stays 100vh frame */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          src={resolvedSrc}
          onLoadedData={() => {
            setIsLoaded(true)
            syncPosition()
          }}
          onCanPlay={() => {
            setIsLoaded(true)
            syncPosition()
            if (isNearViewport) {
              videoRef.current?.play().catch(() => {})
            }
          }}
          onError={() => setHasError(true)}
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            minWidth: '100%',
            minHeight: 'calc(100vh + 35vh)',
            width: '100%',
            height: 'calc(100vh + 35vh)',
            transform: 'translate3d(-50%, 0px, 0)',
            willChange: 'transform',
            objectFit: 'cover',
            opacity: isLoaded ? opacity : 0,
            transition: 'opacity 0.6s ease-in-out',
            mixBlendMode: blendMode,
            filter: videoFilter,
          }}
        >
          <source src={resolvedSrc} type="video/webm" />
        </video>

        {/* Protective deep contrast overlay with edge dissolves */}
        <div
          className="section-video-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              overlayGradient ||
              'linear-gradient(180deg, rgba(6, 8, 14, 0.95) 0%, transparent 120px, transparent calc(100% - 120px), rgba(6, 8, 14, 0.95) 100%), radial-gradient(ellipse at 50% 50%, rgba(6, 8, 14, 0.45) 0%, rgba(5, 6, 10, 0.92) 100%)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  )
}

export default SectionBgVideo
