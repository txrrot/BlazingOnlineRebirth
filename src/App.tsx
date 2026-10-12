import React, { useEffect, useState, useRef, useMemo } from 'react'
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion'
import Lenis from 'lenis'
import {
  Sparkles,
  Smartphone,
  Apple,
  Monitor,
  Flame,
  Zap,
  Download,
  Wrench,
  BookOpen,
  ShieldCheck,
  Globe,
  ChevronDown,
  ExternalLink,
  Menu,
  X,
  Check,
  CheckCircle2,
  AlertTriangle,
  Key,
  Cpu,
  ShieldAlert,
  RefreshCw,
  Copy,
  HardDrive,
  Wifi,
  ArrowRight,
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  Save,
} from 'lucide-react'
import { translations, type Lang } from './data/translations'
import heroArt from './assets/blazing_hero_banner.jpg'
import txrrotAvatar from './assets/txrrot_avatar.jpg'

// --- HELPER COMPONENT FOR CLEAN, SAFE RICH TEXT RENDERING ---
function FormattedText({
  text,
  className = '',
  as: Component = 'span',
  style,
}: {
  text?: string
  className?: string
  as?: React.ElementType
  style?: React.CSSProperties
}) {
  if (!text) return null
  return (
    <Component
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: text }}
    />
  )
}

// Chapter metadata for storytelling navigation
const CHAPTERS = [
  { id: 'online', num: '01', label: 'ONLINE', icon: Wifi },
  { id: 'offline', num: '02', label: 'OFFLINE', icon: HardDrive },
  { id: 'ios', num: '03', label: 'IOS', icon: Apple },
  { id: 'fixes', num: '04', label: 'FIXES', icon: Wrench },
  { id: 'notes', num: '05', label: 'NOTES', icon: BookOpen },
  { id: 'links', num: '06', label: 'LINKS', icon: ExternalLink },
  { id: 'updates', num: '07', label: 'UPDATE', icon: RefreshCw },
]

export default function App() {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('blazing-lang') as Lang) || 'en'
  })
  const [langOpen, setLangOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activePlatform, setActivePlatform] = useState<'all' | 'android' | 'ios' | 'pc'>('all')
  const [iosTab, setIosTab] = useState<'nopc' | 'pair' | 'pc' | 'game'>('nopc')
  const [faqCategory, setFaqCategory] = useState<'all' | 'online' | 'offline' | 'ios' | 'emu'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [openFaqs, setOpenFaqs] = useState<Record<string, boolean>>({
    on1: true,
    off1: true,
    ios1: true,
  })
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [activeChapter, setActiveChapter] = useState('online')
  const [isScrolled, setIsScrolled] = useState(false)

  const lenisRef = useRef<Lenis | null>(null)

  // Scroll Progress with smooth spring
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  // Translations dictionary
  const t = useMemo(() => {
    return translations[lang] || translations.en
  }, [lang])

  const changeLang = (newLang: Lang) => {
    setLang(newLang)
    localStorage.setItem('blazing-lang', newLang)
    document.documentElement.lang = newLang
    setLangOpen(false)
    setMobileMenuOpen(false)
  }

  // Toast notifier
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev))
    }, 2800)
  }

  // Copy with visual checkmark feedback
  const handleCopy = (text: string, label: string, keyId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(keyId)
      showToast(`Copied ${label} to clipboard!`)
      setTimeout(() => {
        setCopiedKey((prev) => (prev === keyId ? null : prev))
      }, 2000)
    })
  }

  // FAQ accordion toggle
  const toggleFaq = (id: string) => {
    setOpenFaqs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Lenis smooth scroll trigger + update URL hash for shareability
  const scrollTo = (target: string) => {
    setMobileMenuOpen(false)
    const el = document.querySelector(target)
    if (el && lenisRef.current) {
      lenisRef.current.scrollTo(el as HTMLElement, { offset: -70, duration: 1.2 })
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
    // Update URL hash without causing a page jump
    if (target.startsWith('#')) {
      history.replaceState(null, '', target)
    }
  }

  // On mount: if URL has a hash, scroll to that section after lenis is ready
  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      // Small delay to let Lenis initialize
      const timer = setTimeout(() => {
        const el = document.querySelector(hash)
        if (el && lenisRef.current) {
          lenisRef.current.scrollTo(el as HTMLElement, { offset: -70, duration: 1.2 })
        } else if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
        }
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [])

  // Initialize Lenis with buttery 60/120fps parameters
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.6,
    })
    lenisRef.current = lenis

    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    const onScroll = () => {
      const scrollPos = window.scrollY
      setIsScrolled(scrollPos > 40)

      // Active Chapter Detector + update URL hash for shareability
      for (const ch of CHAPTERS) {
        const el = document.getElementById(ch.id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 250 && rect.bottom >= 250) {
            setActiveChapter(ch.id)
            // Update URL hash silently (no scroll jump, no history stack pollution)
            if (window.location.hash !== `#${ch.id}`) {
              history.replaceState(null, '', `#${ch.id}`)
            }
            break
          }
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
      lenis.destroy()
    }
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = () => setLangOpen(false)
    window.addEventListener('click', handleOutsideClick)
    return () => window.removeEventListener('click', handleOutsideClick)
  }, [])

  // Comprehensive FAQ item definitions
  const allFaqs = [
    {
      id: 'on1',
      cat: 'online',
      tag: 'Play Protect',
      q: t.faq_on1_q || '1. Play Protect blocked the install',
      a: t.faq_on1_a || 'During installation you must press More info / Show more → Install anyway. If you skipped this, uninstall and reinstall correctly.',
      tip: 'Google Play Protect flags custom fan revivals by default. It is 100% safe to proceed.',
    },
    {
      id: 'on2',
      cat: 'online',
      tag: 'Network / DNS',
      q: t.faq_on2_q || '2. Antivirus / Firewall / Private DNS',
      a: t.faq_on2_a || 'Turn off antivirus, firewall and Private DNS temporarily. These often block the connection to the private server.',
      tip: 'Settings → Network & Internet → Private DNS → Set to Off.',
    },
    {
      id: 'on3',
      cat: 'online',
      tag: 'VPN Routing',
      q: t.faq_on3_q || '3. VPN needed (Europe recommended)',
      a: t.faq_on3_a || 'Some regions need a VPN. European servers are recommended. Connect to an EU location (Germany, France, UK) and try again.',
      tip: 'Free reliable VPNs include ProtonVPN Free or Windscribe.',
    },
    {
      id: 'off1',
      cat: 'offline',
      tag: 'Launcher Beta',
      q: t.faq_off1_q || '1. Outdated Launcher (Connection Error)',
      a: t.faq_off1_a || 'You must switch to Beta channel and update to the latest version (v0.28+). The old stable launcher gives connection errors.',
      tip: 'Launcher menu (top left) → Updates → Channel: Beta → Check for updates → Update now.',
    },
    {
      id: 'off2',
      cat: 'offline',
      tag: 'Play Protect',
      q: t.faq_off2_q || '2. Play Protect blocked during install',
      a: t.faq_off2_a || 'Same as Online: More info → Install anyway. If you continued without this, reinstall both launcher and game properly.',
      tip: 'Play Protect may trigger twice: once for the launcher, once for the game APK.',
    },
    {
      id: 'off3',
      cat: 'offline',
      tag: 'APK Corrupt',
      q: t.faq_off3_q || '3. Corrupted APK download',
      a: t.faq_off3_a || 'Delete the APK and redownload from #downloads. Incomplete downloads are common on mobile browsers.',
      tip: 'If Chrome pauses at 99%, use Firefox Mobile or download via the Discord app.',
    },
    {
      id: 'off4',
      cat: 'offline',
      tag: 'Freeze / Crash',
      q: t.faq_off4_q || '4. Black screen on launch / Game freeze',
      a: t.faq_off4_a || 'Force close the game completely and reopen, or restart your device. In the launcher, tap "Fix" again to re-verify assets.',
      tip: 'Ensure your device has at least 4 GB free internal storage.',
    },
    {
      id: 'off5',
      cat: 'offline',
      tag: 'Private DNS',
      q: t.faq_off5_q || '5. Antivirus / Private DNS (Offline mode)',
      a: t.faq_off5_a || 'Disable antivirus and Private DNS. Same requirements as Online mode for initial asset verification.',
      tip: 'AdBlockers and aggressive VPN profiles can cause asset integrity check fails.',
    },
    {
      id: 'off6',
      cat: 'offline',
      tag: 'EU VPN',
      q: t.faq_off6_q || '6. VPN (EU recommended)',
      a: t.faq_off6_a || 'Some regions require an EU VPN even for the offline data download stage.',
      tip: 'Once downloaded, the game can be played fully offline without internet.',
    },
    {
      id: 'ios1',
      cat: 'ios',
      tag: 'Cert Revoked',
      q: t.faq_ios1_q || '1. SideInstaller won\'t open / certificate revoked',
      a: t.faq_ios1_a || 'Go back to the official install page and try another available certificate. Certificates get revoked frequently by Apple.',
      tip: 'Always check the latest working certificate pin on the official Discord.',
    },
    {
      id: 'ios2',
      cat: 'ios',
      tag: 'Trust Cert',
      q: t.faq_ios2_q || '2. Unable to verify app on iOS',
      a: t.faq_ios2_a || 'Settings → General → VPN & Device Management → tap the developer profile → Trust.',
      tip: 'The profile might appear under an abbreviated corporate name.',
    },
    {
      id: 'ios3',
      cat: 'ios',
      tag: '7-Day Refresh',
      q: t.faq_ios3_q || '3. Refresh fails / apps expire',
      a: t.faq_ios3_a || 'Make sure LocalDevVPN is connected. Open SideStore → My Apps → tap the 7 DAYS timer to force a manual refresh.',
      tip: 'Keep LocalDevVPN installed permanently on your iPhone for this purpose.',
    },
    {
      id: 'ios4',
      cat: 'ios',
      tag: 'Apple ID Rate',
      q: t.faq_ios4_q || '4. Apple ID too new / rate limited',
      a: t.faq_ios4_a || 'Wait 15–30 minutes or use a different (older) Apple ID. Very new burner accounts are often rate limited by Apple servers.',
      tip: 'Creating an Apple ID on the web and waiting 1 hour before first sideload helps.',
    },
    {
      id: 'emu1',
      cat: 'emu',
      tag: 'Emulator Pie64',
      q: 'Emulator crashes immediately when starting offline game',
      a: 'You are likely running a Nougat (Android 7) 32-bit instance. Open your emulator Multi-Instance Manager (LDPlayer, BlueStacks, MuMu) and create a new instance with Android 9 64-bit (Pie64).',
      tip: 'Pie64 (64-bit) is strictly required for the offline game engine.',
    },
  ]

  // Filtered FAQ list by category and search
  const filteredFaqs = useMemo(() => {
    return allFaqs.filter((faq) => {
      const matchCat = faqCategory === 'all' || faq.cat === faqCategory
      const query = searchQuery.toLowerCase().trim()
      const matchQuery =
        !query ||
        faq.q.toLowerCase().includes(query) ||
        faq.a.toLowerCase().includes(query) ||
        faq.tag.toLowerCase().includes(query)
      return matchCat && matchQuery
    })
  }, [faqCategory, searchQuery, allFaqs])

  return (
    <div className="site-wrapper">
      {/* Subtle Noise Texture */}
      <div className="noise-overlay" />

      {/* Spring Scroll Progress Bar */}
      <motion.div className="scroll-progress-bar" style={{ scaleX }} />

      {/* FLOATING CHAPTER SIDE HUD (DESKTOP STORYTELLING) */}
      <aside className="floating-chapter-hud" aria-label="Chapter story progression">
        {CHAPTERS.map((ch) => {
          const isActive = activeChapter === ch.id
          return (
            <button
              key={ch.id}
              type="button"
              className={`hud-chapter-pill ${isActive ? 'active' : ''}`}
              onClick={() => scrollTo(`#${ch.id}`)}
            >
              <span className="hud-dot" />
              <span>{ch.num}</span>
              <span>{ch.label}</span>
            </button>
          )
        })}
      </aside>

      {/* LUXURY EDITORIAL HEADER NAVIGATION */}
      <header className={`header-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <a
            href="#hero"
            className="brand-logo"
            onClick={(e) => {
              e.preventDefault()
              scrollTo('#hero')
            }}
          >
            <span className="brand-pulse-dot" />
            <span>NARUTO BLAZING REBIRTH</span>
            <span className="brand-tag">COMPLETE GUIDE by TXRROT</span>
          </a>

          {/* Navigation Links */}
          <nav className="nav-menu-links">
            <a href="#online" className="nav-link-item" onClick={() => scrollTo('#online')}>
              {t.nav_online || 'Online'}
            </a>
            <a href="#offline" className="nav-link-item" onClick={() => scrollTo('#offline')}>
              {t.nav_offline || 'Offline'}
            </a>
            <a href="#ios" className="nav-link-item" onClick={() => scrollTo('#ios')}>
              {t.nav_ios || 'iOS'}
            </a>
            <a href="#fixes" className="nav-link-item" onClick={() => scrollTo('#fixes')}>
              {t.nav_fixes || 'Fixes'}
            </a>
            <a href="#notes" className="nav-link-item" onClick={() => scrollTo('#notes')}>
              {t.nav_notes || 'Notes'}
            </a>
            <a href="#links" className="nav-link-item" onClick={() => scrollTo('#links')}>
              Links
            </a>
            <a href="#updates" className="nav-link-item" onClick={() => scrollTo('#updates')}>
              {t.upd_title || 'Updates'}
            </a>
          </nav>

          {/* Right Action Cluster */}
          <div className="nav-actions">
            {/* Language Selector Popover */}
            <div className="lang-dropdown-wrapper" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className={`lang-trigger-btn ${langOpen ? 'open' : ''}`}
                onClick={() => setLangOpen(!langOpen)}
                aria-label="Select language"
              >
                <Globe size={14} />
                <span>{lang.toUpperCase()}</span>
                <ChevronDown size={12} />
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    className="lang-menu-popover"
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                  >
                    {[
                      { code: 'en', name: 'English', tag: 'EN' },
                      { code: 'ro', name: 'Română', tag: 'RO' },
                      { code: 'fr', name: 'Français', tag: 'FR' },
                      { code: 'es', name: 'Español', tag: 'ES' },
                      { code: 'ko', name: '한국어', tag: 'KO' },
                    ].map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        className={`lang-option-btn ${lang === item.code ? 'active' : ''}`}
                        onClick={() => changeLang(item.code as Lang)}
                      >
                        <span>{item.name}</span>
                        <span className="lang-badge-tag">{item.tag}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Official Discord Server Action */}
            <a
              href="https://discord.gg/blazingrebirth"
              target="_blank"
              rel="noopener noreferrer"
              className="discord-nav-btn"
            >
              <span>Discord</span>
              <ArrowUpRight size={14} />
            </a>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation drawer"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <button
          type="button"
          className="mobile-drawer-close"
          onClick={() => setMobileMenuOpen(false)}
        >
          <X size={24} />
        </button>
        <div className="mobile-nav-links">
          <a href="#online" onClick={() => scrollTo('#online')}>
            01. {t.nav_online || 'Online'}
          </a>
          <a href="#offline" onClick={() => scrollTo('#offline')}>
            02. {t.nav_offline || 'Offline'}
          </a>
          <a href="#ios" onClick={() => scrollTo('#ios')}>
            03. {t.nav_ios || 'iOS'}
          </a>
          <a href="#fixes" onClick={() => scrollTo('#fixes')}>
            04. {t.nav_fixes || 'Fixes'}
          </a>
          <a href="#notes" onClick={() => scrollTo('#notes')}>
            05. {t.nav_notes || 'Notes'}
          </a>
          <a href="#links" onClick={() => scrollTo('#links')}>
            06. Links
          </a>
          <a href="#updates" onClick={() => scrollTo('#updates')}>
            07. {t.upd_title || 'Updates'}
          </a>
        </div>
        <div className="mobile-lang-row">
          {(['en', 'ro', 'fr', 'es', 'ko'] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => changeLang(l)}
              style={{
                background: lang === l ? '#ffffff' : 'rgba(255,255,255,0.06)',
                color: lang === l ? '#000000' : '#ffffff',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '0.45rem 0.9rem',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.8rem',
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* HERO SECTION */}
      <section id="hero" className="hero-section">
        <div className="hero-ambient-layer">
          <div className="hero-glow-spot" />
          <div className="hero-grid-mesh" />
        </div>

        <div className="hero-inner">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="hero-badge-pill">
              <span className="badge-beacon" />
              <span>{t.hero_badge || 'COMPLETE GUIDE by TXRROT · FAN-MADE REVIVAL 2026'}</span>
            </div>
          </motion.div>

          <div style={{ fontSize: '0.825rem', color: 'var(--accent-amber)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
            {t.hero_author_sub || 'Unofficial Complete Guide & Documentation by TXRROT · Not the official game website'}
          </div>
          <motion.h1
            className="hero-main-title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <span className="hero-title-gradient">NARUTO BLAZING</span>
            <span className="hero-title-subline">REBIRTH</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <FormattedText
              text={
                t.hero_sub ||
                'Complete installation, troubleshooting and tips guide<br />for the community server. No bloat. Just what you need.'
              }
              as="p"
              className="hero-description"
            />
          </motion.div>

          {/* Primary Quick CTA Clusters */}
          <motion.div
            className="hero-cta-cluster"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <button
              type="button"
              className="cta-button-primary"
              onClick={() => scrollTo('#online')}
            >
              <span>{t.hero_cta_online || 'Online Guide'}</span>
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              className="cta-button-glass"
              onClick={() => scrollTo('#offline')}
            >
              <span>{t.hero_cta_offline || 'Offline Guide'}</span>
              <ChevronDown size={16} />
            </button>
            <button
              type="button"
              className="cta-button-glass"
              onClick={() => scrollTo('#ios')}
            >
              <span>{t.hero_cta_ios || 'iOS Sideload'}</span>
              <Apple size={16} />
            </button>
          </motion.div>

          {/* Quick Platform Filter Selector (All Lucide Icons, No Emojis) */}
          <div className="platform-filter-bar">
            <button
              type="button"
              className={`platform-pill-btn ${activePlatform === 'all' ? 'active' : ''}`}
              onClick={() => setActivePlatform('all')}
            >
              <Sparkles size={14} />
              <span>All Guides</span>
            </button>
            <button
              type="button"
              className={`platform-pill-btn ${activePlatform === 'android' ? 'active' : ''}`}
              onClick={() => {
                setActivePlatform('android')
                scrollTo('#online')
              }}
            >
              <Smartphone size={14} />
              <span>Android Mobile</span>
            </button>
            <button
              type="button"
              className={`platform-pill-btn ${activePlatform === 'ios' ? 'active' : ''}`}
              onClick={() => {
                setActivePlatform('ios')
                scrollTo('#ios')
              }}
            >
              <Apple size={14} />
              <span>iOS Sideload (No PC)</span>
            </button>
            <button
              type="button"
              className={`platform-pill-btn ${activePlatform === 'pc' ? 'active' : ''}`}
              onClick={() => {
                setActivePlatform('pc')
                scrollTo('#notes')
              }}
            >
              <Monitor size={14} />
              <span>PC Emulator (Pie64)</span>
            </button>
          </div>

          {/* Key Visual Hero Artwork Frame */}
          <div className="hero-art-showcase">
            <img
              src={heroArt}
              alt="Naruto Blazing Rebirth Key Visual Artwork"
              className="hero-art-img"
              loading="eager"
            />
            <div className="hero-art-gloss" />
            <div className="hero-art-badge-tag">
              <Flame size={13} />
              <span>OFFICIAL 2026 REVIVAL ARCHIVE</span>
            </div>
          </div>

          {/* Story Chapter Navigation Jump Strip */}
          <div className="story-chapter-strip">
            <button type="button" className="chapter-jump-btn" onClick={() => scrollTo('#online')}>
              <Zap size={13} />
              <span>01 Online Mode</span>
            </button>
            <button type="button" className="chapter-jump-btn" onClick={() => scrollTo('#offline')}>
              <Flame size={13} />
              <span>02 Offline Mode</span>
            </button>
            <button type="button" className="chapter-jump-btn" onClick={() => scrollTo('#ios')}>
              <Apple size={13} />
              <span>03 iOS Sideload</span>
            </button>
            <button type="button" className="chapter-jump-btn" onClick={() => scrollTo('#fixes')}>
              <Wrench size={13} />
              <span>04 Fixes & Debug</span>
            </button>
            <button type="button" className="chapter-jump-btn" onClick={() => scrollTo('#notes')}>
              <BookOpen size={13} />
              <span>05 Important Notes</span>
            </button>
            <button type="button" className="chapter-jump-btn" onClick={() => scrollTo('#links')}>
              <ExternalLink size={13} />
              <span>06 Verified Links</span>
            </button>
            <button type="button" className="chapter-jump-btn" onClick={() => scrollTo('#updates')}>
              <RefreshCw size={13} />
              <span>07 How to Update</span>
            </button>
          </div>

          {/* High-Contrast Luxury Metric Stats Panel */}
          <div className="hero-stats-panel">
            <div className="hero-stat-cell">
              <div className="stat-value">
                100<span className="stat-value-suffix">%</span>
              </div>
              <div className="stat-subtext">Free · No Paywalls</div>
            </div>
            <div className="hero-stat-cell">
              <div className="stat-value">2</div>
              <div className="stat-subtext">Online & Offline Modes</div>
            </div>
            <div className="hero-stat-cell">
              <div className="stat-value">
                1000<span className="stat-value-suffix">+</span>
              </div>
              <div className="stat-subtext">Pearls on Offline Start</div>
            </div>
            <div className="hero-stat-cell">
              <div className="stat-value">
                iOS<span className="stat-value-suffix">27</span>
              </div>
              <div className="stat-subtext">No-PC Sideload Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* WARNING STRIP */}
      <div className="warning-strip-wrapper">
        <div className="warning-strip-card">
          <div className="warning-icon-wrapper">
            <ShieldAlert size={22} />
          </div>
          <FormattedText
            text={
              t.warning ||
              '<strong>Warning:</strong> Fan-made, unofficial project. Not affiliated with Bandai Namco / GREE. Everything is free. Download the APK <em>only</em> from the official Discord / site.'
            }
            as="p"
          />
        </div>
      </div>

      {/* =========================================================================
          REBIRTH vs REVIVAL NOTICE BANNER
          ========================================================================= */}
      <div className="revival-notice-banner">
        <div className="revival-notice-inner">
          <div className="revival-notice-icon">
            <AlertTriangle size={20} />
          </div>
          <div className="revival-notice-content">
            <strong className="revival-notice-title">
              {t.revival_notice_title || 'Are you looking for Revival?'}
            </strong>
            <span className="revival-notice-text">
              {t.revival_notice_text ||
                'This guide is for Blazing REBIRTH only. Rebirth and Revival are completely separate communities, developers and apps — different servers, different teams. If you have issues with Revival, go to their server to find their APK files.'}
            </span>
          </div>
          <a
            href="https://discord.gg/blazingrebirth"
            target="_blank"
            rel="noopener noreferrer"
            className="revival-notice-cta"
          >
            {t.revival_notice_cta || 'Join Rebirth'}
            <ArrowUpRight size={13} />
          </a>
        </div>
      </div>

      {/* =========================================================================
          REBIRTH vs REVIVAL + ONLINE vs OFFLINE COMPARISON
          ========================================================================= */}
      <div className="differences-section-wrapper">
        <div className="differences-inner">
          <div className="differences-header">
            <div className="chapter-meta-tag" style={{marginBottom: '0.5rem'}}>
              <ShieldAlert size={14} />
              <span>REBIRTH vs REVIVAL — KEY DIFFERENCES</span>
            </div>
            <h2 className="differences-headline">
              {t.diff_title || 'Rebirth ≠ Revival'}
            </h2>
            <p className="differences-sub">
              {t.diff_sub || 'Two separate fan projects. Different servers, different dev teams, different game versions. If your game is broken and you are on Revival, this guide does NOT apply to you.'}
            </p>
          </div>
          <div className="differences-grid">
            <div className="diff-card diff-rebirth">
              <div className="diff-card-header">
                <Flame size={18} />
                <span>{t.diff_rebirth_title || 'REBIRTH (This Guide)'}</span>
              </div>
              <ul className="diff-list">
                {(t.diff_rebirth_points
                  ? t.diff_rebirth_points.split('|')
                  : [
                      'Maintained by TXRROT & the Rebirth team',
                      'Online mode with live Discord-linked servers',
                      'Offline mode with vanilla/all-data saves',
                      'iOS support via SideStore (No PC needed)',
                      'Active development & updates',
                    ]
                ).map((pt: string, i: number) => (
                  <li key={i}><Check size={13} /><span>{pt.trim()}</span></li>
                ))}
              </ul>
            </div>
            <div className="diff-divider">
              <span className="diff-vs-label">VS</span>
            </div>
            <div className="diff-card diff-revival">
              <div className="diff-card-header">
                <Globe size={18} />
                <span>{t.diff_revival_title || 'REVIVAL (Separate Project)'}</span>
              </div>
              <ul className="diff-list">
                {(t.diff_revival_points
                  ? t.diff_revival_points.split('|')
                  : [
                      'Completely separate dev team & community',
                      'Different application, servers & infrastructure',
                      'Different Discord server',
                      'Problems with Revival? Go to their server',
                      'Progress & accounts are NOT transferable',
                    ]
                ).map((pt: string, i: number) => (
                  <li key={i}><X size={13} className="diff-x-icon" /><span>{pt.trim()}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ONLINE vs OFFLINE FEATURE COMPARISON
          ========================================================================= */}
      <div className="online-offline-comparison-wrapper">
        <div className="differences-inner">
          <div className="differences-header">
            <div className="chapter-meta-tag" style={{marginBottom: '0.5rem'}}>
              <Wifi size={14} />
              <span>ONLINE vs OFFLINE — FEATURE COMPARISON</span>
            </div>
            <h2 className="differences-headline">
              {t.oo_title || 'Which mode is right for you?'}
            </h2>
            <p className="differences-sub">
              {t.oo_sub || 'Rebirth offers two completely different game experiences. Here is what sets them apart.'}
            </p>
          </div>
          <div className="differences-grid">
            <div className="diff-card diff-online">
              <div className="diff-card-header">
                <Zap size={18} />
                <span>{t.oo_online_title || 'ONLINE Mode'}</span>
              </div>
              <ul className="diff-list">
                {(t.oo_online_points
                  ? t.oo_online_points.split('|')
                  : [
                      'Account linked to Discord',
                      'Banners progress chronologically (PTS → Limited)',
                      'PVP & CO-OP multiplayer supported',
                      'Online leaderboards & global ranking',
                      'Progress saved via Discord cloud',
                      'Requires active internet connection',
                    ]
                ).map((pt: string, i: number) => (
                  <li key={i}><Check size={13} /><span>{pt.trim()}</span></li>
                ))}
              </ul>
            </div>
            <div className="diff-divider">
              <span className="diff-vs-label" style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)'}}>VS</span>
            </div>
            <div className="diff-card diff-offline">
              <div className="diff-card-header">
                <HardDrive size={18} />
                <span>{t.oo_offline_title || 'OFFLINE Mode'}</span>
              </div>
              <ul className="diff-list">
                {(t.oo_offline_points
                  ? t.oo_offline_points.split('|')
                  : [
                      'No account or Discord required',
                      'Choose Vanilla or All Data save mode',
                      'Starts with 1000+ Pearls in All Data mode',
                      'Fully playable without internet',
                      'No PVP or CO-OP (local only)',
                      'Manual save export/import management',
                    ]
                ).map((pt: string, i: number) => (
                  <li key={i}><Check size={13} /><span>{pt.trim()}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CHAPTER 01: ONLINE MODE (Neon Chakra Blue Luminescence Atmosphere)
          ========================================================================= */}
      <section id="online" className="story-section section-online">
        <div className="section-atmosphere-glow" />
        <div className="story-section-container">
          <div className="section-header-block">
            <div className="chapter-meta-tag">
              <Zap size={14} />
              <span>CHAPTER 01 // LIVE SERVERS</span>
            </div>
            <h2 className="section-headline">{t.online_title || 'Online Mode'}</h2>
            <FormattedText
              text={
                t.online_sub ||
                'Live servers · Discord-linked account · Banners progress chronologically'
              }
              as="p"
              className="section-subhead"
            />
          </div>

          {/* Timeline Steps Stack */}
          <div className="steps-timeline-stack">
            {/* Step 01 */}
            <div className="step-card">
              <div className="step-card-num">
                <div className="step-num-badge">01</div>
              </div>
              <div className="step-card-body">
                <h3>{t.on_s1_title || 'Join the Discord'}</h3>
                <FormattedText
                  text={
                    t.on_s1_desc ||
                    'Your game account is linked to Discord. Join the official server and verify.'
                  }
                  as="p"
                />
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <a
                    href="https://discord.gg/blazingrebirth"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-button-primary"
                    style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem' }}
                  >
                    <span>Discord Invite</span>
                    <ArrowUpRight size={14} />
                  </a>
                  <button
                    type="button"
                    className={`action-copy-btn ${copiedKey === 'discord_on' ? 'copied' : ''}`}
                    onClick={() =>
                      handleCopy('https://discord.gg/blazingrebirth', 'Discord Link', 'discord_on')
                    }
                  >
                    {copiedKey === 'discord_on' ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedKey === 'discord_on' ? 'Copied' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Step 02 */}
            <div className="step-card">
              <div className="step-card-num">
                <div className="step-num-badge">02</div>
              </div>
              <div className="step-card-body">
                <h3>{t.on_s2_title || 'Download the APK'}</h3>
                <FormattedText
                  text={
                    t.on_s2_desc ||
                    'From the official site or #downloads channel. If the download does not finish 100%, switch browser (Chrome to Firefox or vice versa) and try again.'
                  }
                  as="p"
                />
                <div className="step-callout-note">
                  <strong>Browser Pro Tip:</strong> If Google Chrome pauses at 99%, use Firefox Mobile or download directly through the Discord client.
                </div>
              </div>
            </div>

            {/* Step 03 */}
            <div className="step-card">
              <div className="step-card-num">
                <div className="step-num-badge">03</div>
              </div>
              <div className="step-card-body">
                <h3>{t.on_s3_title || 'Install'}</h3>
                <FormattedText
                  text={
                    t.on_s3_desc ||
                    'Open the APK. <strong>Play Protect will appear</strong> → tap <em>More info</em> / <em>Show more</em> → then <em>Install anyway</em>. Do not skip this step.'
                  }
                  as="p"
                />
                <div className="step-callout-note danger">
                  <strong>Play Protect Warning:</strong> Unsigned fan revivals trigger a red warning: ALWAYS tap <strong>More info</strong> → <strong>Install anyway</strong>.
                </div>
              </div>
            </div>

            {/* Step 04 */}
            <div className="step-card">
              <div className="step-card-num">
                <div className="step-num-badge">04</div>
              </div>
              <div className="step-card-body">
                <h3>{t.on_s4_title || 'Sign in with Discord'}</h3>
                <FormattedText
                  text={
                    t.on_s4_desc ||
                    'Open the game → Sign in with Discord. Account is created automatically. Let it download the ~220 MB game data (Wi-Fi, keep screen on).'
                  }
                  as="p"
                />
              </div>
            </div>
          </div>

          {/* Feature 3-Cards */}
          <div className="feature-cards-grid">
            <div className="feature-info-card">
              <div className="feature-icon-box">
                <Key size={20} />
              </div>
              <h4>{t.on_card1_title || 'Link Discord later'}</h4>
              <FormattedText
                text={
                  t.on_card1_desc ||
                  'Others → Account. DATA TRANSFER is not valid for Online — you must link from inside the game menu.'
                }
                as="p"
              />
            </div>

            <div className="feature-info-card">
              <div className="feature-icon-box">
                <Flame size={20} />
              </div>
              <h4>{t.on_card2_title || 'Banners'}</h4>
              <FormattedText
                text={
                  t.on_card2_desc ||
                  'Starts with the 2016 One Tail Naruto banner. Banners change chronologically as the server progresses.'
                }
                as="p"
              />
            </div>

            <div className="feature-info-card">
              <div className="feature-icon-box">
                <ShieldAlert size={20} />
              </div>
              <h4>{t.on_card3_title || 'Separate accounts'}</h4>
              <FormattedText
                text={
                  t.on_card3_desc ||
                  'Online and Offline are completely separate apps with separate accounts. Progress does not transfer between them.'
                }
                as="p"
              />
            </div>
          </div>

          {/* Chapter 01 Navigation Jump Cluster */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="cta-button-primary"
              onClick={() => scrollTo('#offline')}
              style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem' }}
            >
              <span>{t.nav_continue_offline || 'Continue to Chapter 02: Offline Mode →'}</span>
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              className="cta-button-glass"
              onClick={() => scrollTo('#updates')}
              style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem' }}
            >
              <span>{t.nav_continue_updates || 'See Chapter 07: How to Update →'}</span>
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CHAPTER 02: OFFLINE MODE (Solar Sage / Kyuubi Flame Amber Atmosphere)
          ========================================================================= */}
      <section id="offline" className="story-section section-offline">
        <div className="section-atmosphere-glow" />
        <div className="story-section-container">
          <div className="section-header-block">
            <div className="chapter-meta-tag">
              <Flame size={14} />
              <span>CHAPTER 02 // SAGE ARCHIVE</span>
            </div>
            <h2 className="section-headline">{t.offline_title || 'Offline Mode'}</h2>
            <FormattedText
              text={
                t.offline_sub ||
                'Launcher + game · Local save only · All banners available from the start'
              }
              as="p"
              className="section-subhead"
            />
          </div>

          {/* Storage Warning Note */}
          <div className="warning-strip-card" style={{ marginBottom: '2.5rem' }}>
            <div className="warning-icon-wrapper" style={{ color: 'var(--accent-amber)' }}>
              <AlertTriangle size={22} />
            </div>
            <FormattedText
              text={
                t.offline_warning ||
                '<strong>Important:</strong> Offline data is saved only on your device. Deleting the game = permanent loss of progress. There are 2 separate offline modes with separate local accounts.'
              }
              as="p"
            />
          </div>

          {/* Timeline Steps Stack */}
          <div className="steps-timeline-stack">
            {/* Step 01 */}
            <div className="step-card">
              <div className="step-card-num">
                <div className="step-num-badge">01</div>
              </div>
              <div className="step-card-body">
                <h3>{t.off_s1_title || 'Download the correct APK'}</h3>
                <FormattedText
                  text={
                    t.off_s1_desc ||
                    'From the <strong>#downloads</strong> channel on Discord:<br />• <strong>ARM</strong> → real Android phone<br />• <strong>x86_x64</strong> → emulator'
                  }
                  as="p"
                />
                <div style={{ marginTop: '0.75rem' }}>
                  <button
                    type="button"
                    className="action-tag-btn"
                    onClick={() => scrollTo('#notes')}
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}
                  >
                    <Monitor size={12} />
                    <span>Using PC Emulator (Pie64)? Check Chapter 05 Notes →</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Step 02 */}
            <div className="step-card">
              <div className="step-card-num">
                <div className="step-num-badge">02</div>
              </div>
              <div className="step-card-body">
                <h3>{t.off_s2_title || 'Install the Launcher'}</h3>
                <FormattedText
                  text={
                    t.off_s2_desc ||
                    '<strong>Play Protect will appear</strong> → <em>More info</em> → <em>Install anyway</em>. Open the app (Naruto Sage Mode icon).'
                  }
                  as="p"
                />
              </div>
            </div>

            {/* Step 03 */}
            <div className="step-card">
              <div className="step-card-num">
                <div className="step-num-badge">03</div>
              </div>
              <div className="step-card-body">
                <h3>{t.off_s3_title || 'Update pop-up → Later'}</h3>
                <FormattedText
                  text={
                    t.off_s3_desc ||
                    'An update pop-up appears. Tap <strong>Later</strong> (it is an older version).'
                  }
                  as="p"
                />
              </div>
            </div>

            {/* Step 04 */}
            <div className="step-card">
              <div className="step-card-num">
                <div className="step-num-badge">04</div>
              </div>
              <div className="step-card-body">
                <h3>{t.off_s4_title || 'Switch to Beta channel'}</h3>
                <FormattedText
                  text={
                    t.off_s4_desc ||
                    'Open the left-side menu → <strong>Updates</strong>. Change first setting from <em>Stable</em> to <em>Beta</em>. Then press <strong>Check for updates</strong>.'
                  }
                  as="p"
                />
              </div>
            </div>

            {/* Step 05 */}
            <div className="step-card">
              <div className="step-card-num">
                <div className="step-num-badge">05</div>
              </div>
              <div className="step-card-body">
                <h3>{t.off_s5_title || 'Update to latest (v0.28+)'}</h3>
                <FormattedText
                  text={
                    t.off_s5_desc ||
                    'Press <strong>Update now</strong>. Wait until it reinstalls the app (white UI like first install) → press Install when prompted.'
                  }
                  as="p"
                />
              </div>
            </div>

            {/* Step 06 */}
            <div className="step-card">
              <div className="step-card-num">
                <div className="step-num-badge">06</div>
              </div>
              <div className="step-card-body">
                <h3>{t.off_s6_title || 'Fix + download game data'}</h3>
                <FormattedText
                  text={
                    t.off_s6_desc ||
                    'Reopen the launcher → press <strong>Fix</strong>. The game (original icon) will download. <strong>Play Protect may appear again</strong> (sometimes twice) → always <em>More info</em> → <em>Install anyway</em> until the <strong>Play</strong> button appears.'
                  }
                  as="p"
                />
              </div>
            </div>

            {/* Step 07 */}
            <div className="step-card">
              <div className="step-card-num">
                <div className="step-num-badge">07</div>
              </div>
              <div className="step-card-body">
                <h3>{t.off_s7_title || 'Play'}</h3>
                <FormattedText
                  text={t.off_s7_desc || 'When the Play button is visible, tap it to launch the game.'}
                  as="p"
                />
              </div>
            </div>
          </div>

          {/* Feature 3-Cards */}
          <div className="feature-cards-grid">
            <div className="feature-info-card">
              <div className="feature-icon-box">
                <Sparkles size={20} />
              </div>
              <h4>{t.off_card1_title || 'Vanilla mode'}</h4>
              <FormattedText
                text={
                  t.off_card1_desc ||
                  'Starts at level 1 with 1000 pearls. All banners available from the start (unlike Online which starts in 2016 and progresses).'
                }
                as="p"
              />
            </div>

            <div className="feature-info-card">
              <div className="feature-icon-box">
                <SlidersHorizontal size={20} />
              </div>
              <h4>{t.off_card2_title || 'Rewards / Gameplay'}</h4>
              <FormattedText
                text={
                  t.off_card2_desc ||
                  'You can change rewards and gameplay options from the Launcher → GAMEPLAY settings.'
                }
                as="p"
              />
            </div>

            <div className="feature-info-card">
              <div className="feature-icon-box">
                <HardDrive size={20} />
              </div>
              <h4>{t.off_card3_title || 'Local save only'}</h4>
              <FormattedText
                text={
                  t.off_card3_desc ||
                  'Progress is stored on the device. Uninstalling the game deletes everything. No cloud backup.'
                }
                as="p"
              />
            </div>
          </div>

          {/* Chapter 02 Navigation Jump Cluster */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="cta-button-glass"
              onClick={() => scrollTo('#online')}
              style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem' }}
            >
              <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
              <span>{t.nav_back_online || '← Back to Online Guide'}</span>
            </button>
            <button
              type="button"
              className="cta-button-primary"
              onClick={() => scrollTo('#ios')}
              style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem' }}
            >
              <span>{t.nav_continue_ios || 'Continue to Chapter 03: iOS Sideloading →'}</span>
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              className="cta-button-glass"
              onClick={() => scrollTo('#updates')}
              style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem' }}
            >
              <span>{t.nav_continue_updates || 'See Chapter 07: How to Update →'}</span>
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CHAPTER 03: IOS SIDELOADING (Cupertino Silver & Lavender Violet Atmosphere)
          ========================================================================= */}
      <section id="ios" className="story-section section-ios">
        <div className="section-atmosphere-glow" />
        <div className="story-section-container">
          <div className="section-header-block">
            <div className="chapter-meta-tag">
              <Apple size={14} />
              <span>CHAPTER 03 // THE IOS GATE</span>
            </div>
            <h2 className="section-headline">{t.ios_title || 'iOS Sideloading'}</h2>
            <FormattedText
              text={
                t.ios_sub ||
                'SideStore + LiveContainer · Unlimited apps · No PC required on iOS 27'
              }
              as="p"
              className="section-subhead"
            />
          </div>

          {/* Malware Warning Note */}
          <div className="warning-strip-card" style={{ marginBottom: '2.5rem' }}>
            <div className="warning-icon-wrapper" style={{ color: 'var(--accent-violet)' }}>
              <ShieldAlert size={22} />
            </div>
            <FormattedText
              text={
                t.ios_warning ||
                '<strong>Important:</strong> Use only official sources. The site <em>sideinstaller.com</em> is <strong>fake / malware</strong>. Official: sideinstaller.net and frizzlem.github.io/SideInstaller'
              }
              as="p"
            />
          </div>

          {/* Critical iOS Version Warning Banner */}
          <div className="warning-strip-card" style={{ marginBottom: '2rem', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(20, 20, 25, 0.8) 100%)' }}>
            <div className="warning-icon-wrapper" style={{ color: '#ef4444' }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 style={{ color: '#ef4444', fontWeight: 700, marginBottom: '0.4rem', fontSize: '1rem' }}>
                {t.ios_crit_banner_title || 'CRITICAL: iOS 27 Required for No-PC Install'}
              </h4>
              <FormattedText
                text={
                  t.ios_crit_banner_desc ||
                  'No-PC installation via SideInstaller ONLY works directly on <strong>iOS 27</strong>. On <strong>iOS 18–26</strong>, you MUST generate a pairing file on a PC once before SideInstaller can install apps. Or use Method 2 (PC with Sideloadly) for any iOS version.'
                }
                as="p"
              />
              <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="cta-button-glass"
                  onClick={() => setIosTab('nopc')}
                  style={{ padding: '0.4rem 0.9rem', fontSize: '0.78rem', background: iosTab === 'nopc' ? 'rgba(255,255,255,0.15)' : undefined }}
                >
                  <span>iOS 27 (No-PC)</span>
                </button>
                <button
                  type="button"
                  className="cta-button-glass"
                  onClick={() => setIosTab('pair')}
                  style={{ padding: '0.4rem 0.9rem', fontSize: '0.78rem', background: iosTab === 'pair' ? 'rgba(255,255,255,0.15)' : undefined }}
                >
                  <span>iOS 18–26 Pairing File</span>
                  <ArrowRight size={12} />
                </button>
                <button
                  type="button"
                  className="cta-button-glass"
                  onClick={() => setIosTab('pc')}
                  style={{ padding: '0.4rem 0.9rem', fontSize: '0.78rem', background: iosTab === 'pc' ? 'rgba(255,255,255,0.15)' : undefined }}
                >
                  <span>Method 2: PC Sideloadly</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Method Tabs */}
          <div className="ios-tab-selector">
            <button
              type="button"
              className={`ios-tab-btn ${iosTab === 'nopc' ? 'active' : ''}`}
              onClick={() => setIosTab('nopc')}
            >
              <Smartphone size={15} />
              <span>{t.ios_nopc_h || 'Method 1 — No PC (iOS 27)'}</span>
            </button>
            <button
              type="button"
              className={`ios-tab-btn ${iosTab === 'pair' ? 'active' : ''}`}
              onClick={() => setIosTab('pair')}
            >
              <Key size={15} />
              <span>{t.ios_pair_h || 'Pairing File (iOS 18–26)'}</span>
            </button>
            <button
              type="button"
              className={`ios-tab-btn ${iosTab === 'pc' ? 'active' : ''}`}
              onClick={() => setIosTab('pc')}
            >
              <Monitor size={15} />
              <span>{t.ios_pc_h || 'Method 2 — With PC (iloader)'}</span>
            </button>
            <button
              type="button"
              className={`ios-tab-btn ${iosTab === 'game' ? 'active' : ''}`}
              onClick={() => setIosTab('game')}
            >
              <Download size={15} />
              <span>{t.ios_game_h || 'Install Game (.ipa)'}</span>
            </button>
          </div>

          {/* TAB CONTENT: Method 1 (No PC) */}
          {iosTab === 'nopc' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FormattedText
                text={
                  t.ios_nopc_intro ||
                  'Uses SideInstaller. Fully on-device on iOS 27. On iOS 18–26 you still need a pairing file generated once on a PC. Keep LocalDevVPN connected for the entire process.'
                }
                as="p"
                style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}
              />

              <div className="steps-timeline-stack">
                <div className="step-card">
                  <div className="step-card-num">
                    <div className="step-num-badge">01</div>
                  </div>
                  <div className="step-card-body">
                    <h3>{t.ios_s1_title || 'Install LocalDevVPN'}</h3>
                    <FormattedText
                      text={
                        t.ios_s1_desc ||
                        'Open App Store → search LocalDevVPN → install. Open the app and tap Connect. Keep the VPN on during the whole installation.'
                      }
                      as="p"
                    />
                  </div>
                </div>

                <div className="step-card">
                  <div className="step-card-num">
                    <div className="step-num-badge">02</div>
                  </div>
                  <div className="step-card-body">
                    <h3>{t.ios_s2_title || 'Install SideInstaller (official only)'}</h3>
                    <FormattedText
                      text={
                        t.ios_s2_desc ||
                        'Open <strong>Safari</strong> → go to frizzlem.github.io/SideInstaller. Install the DNS profile first.<br />• <strong>Test ONE certificate at a time:</strong> Tap Install on one certificate and check your Home Screen.<br />• <strong>Blue icon with download arrow / full app:</strong> Works! That certificate is valid on your phone.<br />• <strong>White cloud icon / greyed out:</strong> That certificate is revoked / incompatible on your phone — it will NOT work. Try the next certificate on the page.<br />• <strong>MANDATORY CLEANUP:</strong> Once you find a working one, immediately delete all failed / white-cloud icons from your Home Screen so they don\'t block installation!'
                      }
                      as="p"
                    />

                    {/* Copyable Verified Certificate */}
                    <div className="certificate-display-box" style={{ marginTop: '1rem' }}>
                      <FormattedText
                        text={
                          t.ios_s2_cert ||
                          '<strong>Certificate that worked (as of Oct 2026):</strong><br />China-Telecom-Corporation-Limited-XC-com-ctq-qmc-yiban-p<br />Expires ~2029 · long validity. If it is gone, pick any other available one on the page.'
                        }
                        as="div"
                      />
                      <div className="cert-code-row">
                        <span>China-Telecom-Corporation-Limited-XC-com-ctq-qmc-yiban-p</span>
                        <button
                          type="button"
                          className={`action-copy-btn ${copiedKey === 'cert' ? 'copied' : ''}`}
                          onClick={() =>
                            handleCopy(
                              'China-Telecom-Corporation-Limited-XC-com-ctq-qmc-yiban-p',
                              'Certificate Name',
                              'cert'
                            )
                          }
                        >
                          {copiedKey === 'cert' ? <Check size={14} /> : <Copy size={14} />}
                          <span>{copiedKey === 'cert' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="step-card" id="ios-s3">
                  <div className="step-card-num">
                    <div className="step-num-badge">03</div>
                  </div>
                  <div className="step-card-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <h3 style={{ margin: 0 }}>{t.ios_s3_title || 'Download & Import SideStore.ipa'}</h3>
                      <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', borderRadius: '4px', fontWeight: 600 }}>
                        {t.ios_s3_404_badge || '404 Error Fix'}
                      </span>
                    </div>

                    <div className="step-callout-note danger" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                      <FormattedText
                        text={
                          t.ios_s3_404_note ||
                          '<strong>Why 404 occurs:</strong> The automated download in SideInstaller fails because the LiveContainer repository is offline. Downloading standalone SideStore.ipa manually completely bypasses the 404 error!'
                        }
                        as="div"
                      />
                    </div>

                    <FormattedText
                      text={
                        t.ios_s3_steps ||
                        '1. Tap either download link below in Safari and save SideStore.ipa to the <strong>Files</strong> app.<br />2. Open <strong>SideInstaller</strong> (ensure <strong>Tunnel connected</strong> is green).<br />3. Sign in with an Apple ID (a secondary / burner account is recommended).<br />4. Tap <strong>Import IPA</strong> (or "Install from file") and select the SideStore.ipa you downloaded.<br />5. <em>iOS 27:</em> leave pairing file empty → tap Install.<br />• <em>iOS 18–26:</em> tap Import Pairing File first → select your pairing file → tap Install.<br />6. Wait until the installation finishes.'
                      }
                      as="p"
                    />

                    {/* Direct Download Buttons for SideStore.ipa */}
                    <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <a
                        href="https://drive.google.com/file/d/14AbuUR1d8WdwdvJkuLTROsYySsOteYdz/view?usp=sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cta-button-primary"
                        style={{ padding: '0.6rem 1.25rem', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                      >
                        <Download size={14} />
                        <span>{t.ios_s3_btn_gdrive || 'Download SideStore.ipa (Google Drive)'}</span>
                        <ArrowUpRight size={14} />
                      </a>
                      <a
                        href="https://github.com/SideStore/SideStore/releases/download/nightly/SideStore.ipa"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cta-button-glass"
                        style={{ padding: '0.6rem 1.25rem', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                      >
                        <Download size={14} />
                        <span>{t.ios_s3_btn_github || 'Download SideStore.ipa (GitHub Nightly)'}</span>
                        <ArrowUpRight size={14} />
                      </a>
                    </div>

                    {/* iOS 18-26 Pairing Link Note */}
                    <div className="step-callout-note" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <strong>Pairing file (iOS 18–26):</strong> If you are not on iOS 27, you must import a pairing file before tapping Install.
                      </div>
                      <button
                        type="button"
                        className="action-tag-btn"
                        onClick={() => setIosTab('pair')}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}
                      >
                        <span>{t.nav_jump_pairing || 'Generate Pairing File on PC →'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="step-card">
                  <div className="step-card-num">
                    <div className="step-num-badge">04</div>
                  </div>
                  <div className="step-card-body">
                    <h3>{t.ios_s4_title || 'Trust Certificate & Developer Mode'}</h3>
                    <FormattedText
                      text={
                        t.ios_s4_desc ||
                        '1. Open <strong>Settings → General → VPN & Device Management</strong>.<br />2. Scroll to the very bottom under Enterprise / Developer App, tap the company name from the working certificate, tap <strong>Trust</strong>, then tap <strong>Allow & Restart</strong>.<br />3. <em>Developer Mode:</em> Note that Developer Mode only appears in Settings <em>after</em> an app is installed from SideInstaller. Go to <strong>Settings → Privacy & Security → Developer Mode</strong> → turn ON → restart iPhone → confirm with passcode.'
                      }
                      as="p"
                    />
                    <div className="step-callout-note" style={{ marginTop: '0.75rem', borderColor: 'rgba(59, 130, 246, 0.4)' }}>
                      <FormattedText
                        text={
                          t.ios_s4_reassurance ||
                          '<strong>Security Dialog Note:</strong> Apple displays scary red warning buttons and "Untrusted Developer" alerts by default for all sideloaded apps. This is standard iOS security behavior and 100% safe for SideStore.'
                        }
                        as="div"
                      />
                    </div>
                  </div>
                </div>

                <div className="step-card">
                  <div className="step-card-num">
                    <div className="step-num-badge">05</div>
                  </div>
                  <div className="step-card-body">
                    <h3>{t.ios_s5_title || 'Clean up & WireGuard Refresh'}</h3>
                    <FormattedText
                      text={
                        t.ios_s5_desc ||
                        'After everything works, go to Settings → General → VPN & Device Management and remove the SideInstaller DNS profile. Keep LocalDevVPN installed — you need it for weekly refreshes.'
                      }
                      as="p"
                    />
                    <div style={{ marginTop: '1rem' }}>
                      <button
                        type="button"
                        className="cta-button-primary"
                        onClick={() => setIosTab('game')}
                        style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem' }}
                      >
                        <span>Next: Install Naruto Blazing Game IPA →</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB CONTENT: Pairing File */}
          {iosTab === 'pair' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FormattedText
                text={
                  t.ios_pair_intro ||
                  'Required only on <strong>iOS 18–26</strong> if you use SideInstaller without a full PC install. On <strong>iOS 27</strong> skip this. You only need a computer once; after that everything is on-device with LocalDevVPN.'
                }
                as="p"
                style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}
              />

              <div className="steps-timeline-stack">
                <div className="step-card">
                  <div className="step-card-num">
                    <div className="step-num-badge">01</div>
                  </div>
                  <div className="step-card-body">
                    <h3>{t.ios_pair1_title || 'Windows only — install iTunes'}</h3>
                    <FormattedText
                      text={
                        t.ios_pair1_desc ||
                        'Install iTunes 64-bit from Apple (needed for USB drivers). Mac and Linux do not need this.'
                      }
                      as="p"
                    />
                    <div style={{ marginTop: '0.75rem' }}>
                      <a
                        href="https://www.apple.com/itunes/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cta-button-glass"
                        style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}
                      >
                        <Download size={13} />
                        <span>{t.ios_pair_itunes_btn || 'Download iTunes 64-bit'}</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="step-card">
                  <div className="step-card-num">
                    <div className="step-num-badge">02</div>
                  </div>
                  <div className="step-card-body">
                    <h3>{t.ios_pair2_title || 'Connect iPhone + Trust'}</h3>
                    <FormattedText
                      text={
                        t.ios_pair2_desc ||
                        'Unlock the phone → plug in via USB → tap Trust on the phone and enter your passcode. Keep the phone unlocked on the Home Screen.'
                      }
                      as="p"
                    />
                  </div>
                </div>

                <div className="step-card">
                  <div className="step-card-num">
                    <div className="step-num-badge">03</div>
                  </div>
                  <div className="step-card-body">
                    <h3>{t.ios_pair3_title || 'Generate with iDevicePair / SideServer'}</h3>
                    <FormattedText
                      text={
                        t.ios_pair3_desc ||
                        'Open <strong>iDevicePair</strong> → select your device → Generate (use RPPairing / remote pairing if the option appears — for iOS 17.4+). Tap Trust again on the phone if asked. You get a .mobiledevicepairing file.'
                      }
                      as="p"
                    />
                    <div style={{ marginTop: '0.75rem' }}>
                      <a
                        href="https://github.com/nythepegasus/SideServer-Windows"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cta-button-glass"
                        style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}
                      >
                        <Download size={13} />
                        <span>{t.ios_pair_sideserver_btn || 'Download SideServer / iDevicePair'}</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="step-card">
                  <div className="step-card-num">
                    <div className="step-num-badge">04</div>
                  </div>
                  <div className="step-card-body">
                    <h3>{t.ios_pair4_title || 'Transfer to iPhone + import'}</h3>
                    <FormattedText
                      text={
                        t.ios_pair4_desc ||
                        'Send the file to the phone (AirDrop, email, USB Files). Open SideInstaller → <strong>Import pairing file</strong> → select it.'
                      }
                      as="p"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation Back / Forward Buttons */}
              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="cta-button-primary"
                  onClick={() => setIosTab('nopc')}
                  style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem' }}
                >
                  <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
                  <span>{t.nav_back_to_nopc || '← Back to No-PC Guide (Step 03)'}</span>
                </button>
                <button
                  type="button"
                  className="cta-button-glass"
                  onClick={() => setIosTab('pc')}
                  style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem' }}
                >
                  <span>{t.nav_jump_pc || 'Jump to PC Method (Sideloadly) →'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB CONTENT: Method 2 (PC iloader) */}
          {iosTab === 'pc' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FormattedText
                text={
                  t.ios_pc_intro ||
                  'Works on most iOS versions. You only need the computer for the first install. After that everything is on-device.'
                }
                as="p"
                style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}
              />

              <div className="steps-timeline-stack">
                <div className="step-card">
                  <div className="step-card-num">
                    <div className="step-num-badge">01</div>
                  </div>
                  <div className="step-card-body">
                    <h3>{t.ios_pc1_title || 'Install LocalDevVPN + Sideloadly'}</h3>
                    <FormattedText
                      text={
                        t.ios_pc1_desc ||
                        'On iPhone: install LocalDevVPN from App Store and connect it. On computer: download Sideloadly from official sources.'
                      }
                      as="p"
                    />
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <a
                        href="https://sideloadly.io/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cta-button-primary"
                        style={{ padding: '0.5rem 1.1rem', fontSize: '0.8rem', display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}
                      >
                        <Download size={13} />
                        <span>{t.ios_pc_sideloadly_btn || 'Download Sideloadly'}</span>
                        <ExternalLink size={13} />
                      </a>
                      <a
                        href="https://sidestore.io/#getting-started"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cta-button-glass"
                        style={{ padding: '0.5rem 1.1rem', fontSize: '0.8rem', display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}
                      >
                        <span>{t.ios_sidestore_docs || 'SideStore Documentation'}</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="step-card">
                  <div className="step-card-num">
                    <div className="step-num-badge">02</div>
                  </div>
                  <div className="step-card-body">
                    <h3>{t.ios_pc2_title || 'Connect & install'}</h3>
                    <FormattedText
                      text={
                        t.ios_pc2_desc ||
                        'Connect iPhone via USB → trust the computer. Open Sideloadly → sign in with Apple ID → select your device → choose SideStore IPA. Install.'
                      }
                      as="p"
                    />
                  </div>
                </div>

                <div className="step-card">
                  <div className="step-card-num">
                    <div className="step-num-badge">03</div>
                  </div>
                  <div className="step-card-body">
                    <h3>{t.ios_pc3_title || 'Trust + Developer Mode + Refresh'}</h3>
                    <FormattedText
                      text={
                        t.ios_pc3_desc ||
                        'Same as Method 1: Trust the profile, enable Developer Mode, open SideStore, sign in, do a manual refresh with LocalDevVPN connected.'
                      }
                      as="p"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation Back / Forward Buttons */}
              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="cta-button-glass"
                  onClick={() => setIosTab('nopc')}
                  style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem' }}
                >
                  <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
                  <span>{t.nav_back_to_nopc || '← Back to No-PC Method'}</span>
                </button>
                <button
                  type="button"
                  className="cta-button-primary"
                  onClick={() => setIosTab('game')}
                  style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem' }}
                >
                  <span>{t.ios_game_h || 'Install Game (.ipa)'} →</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB CONTENT: Game IPA */}
          {iosTab === 'game' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FormattedText
                text={
                  t.ios_game_intro ||
                  'After SideStore + LiveContainer are working, install Naruto Blazing Rebirth as an IPA. Prefer installing it <strong>inside LiveContainer</strong> so it does not use one of the 3 free app slots.'
                }
                as="p"
                style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}
              />

              <div className="steps-timeline-stack">
                <div className="step-card">
                  <div className="step-card-num">
                    <div className="step-num-badge">01</div>
                  </div>
                  <div className="step-card-body">
                    <h3>{t.ios_g1_title || 'Get the IPA'}</h3>
                    <FormattedText
                      text={
                        t.ios_g1_desc ||
                        'Download the official <strong>.ipa</strong> from the Discord <strong>#downloads</strong> channel (or the link shared by helpers). Save it to the Files app (On My iPhone / iCloud Drive).'
                      }
                      as="p"
                    />
                  </div>
                </div>

                <div className="step-card">
                  <div className="step-card-num">
                    <div className="step-num-badge">02</div>
                  </div>
                  <div className="step-card-body">
                    <h3>{t.ios_g2_title || 'Install via LiveContainer (recommended)'}</h3>
                    <FormattedText
                      text={
                        t.ios_g2_desc ||
                        'Open <strong>LiveContainer</strong> → tap the <strong>+</strong> button → select the .ipa from Files. Wait for it to import. Then long-press the app card and choose <em>Launch</em>. This way the game runs inside LiveContainer and does not count toward the 3-app limit.'
                      }
                      as="p"
                    />
                  </div>
                </div>

                <div className="step-card">
                  <div className="step-card-num">
                    <div className="step-num-badge">03</div>
                  </div>
                  <div className="step-card-body">
                    <h3>{t.ios_g3_title || 'Alternative: install via SideStore'}</h3>
                    <FormattedText
                      text={
                        t.ios_g3_desc ||
                        'Open SideStore (from LiveContainer or standalone) → My Apps → <strong>+</strong> → choose the .ipa. When asked, select <strong>Keep App Extensions (Use Main Profile)</strong>. Trust the app if prompted.'
                      }
                      as="p"
                    />
                  </div>
                </div>

                <div className="step-card">
                  <div className="step-card-num">
                    <div className="step-num-badge">04</div>
                  </div>
                  <div className="step-card-body">
                    <h3>{t.ios_g4_title || 'Refresh when needed'}</h3>
                    <FormattedText
                      text={
                        t.ios_g4_desc ||
                        'Every ~7 days the signature expires. Connect LocalDevVPN → open SideStore → tap the 7 DAYS timer on LiveContainer (and on the game if it was installed outside). Then relaunch from LiveContainer.'
                      }
                      as="p"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Feature 3-Cards */}
          <div className="feature-cards-grid" style={{ marginTop: '2.5rem' }}>
            <div className="feature-info-card">
              <div className="feature-icon-box">
                <Cpu size={20} />
              </div>
              <h4>{t.ios_card1_title || 'Why LiveContainer?'}</h4>
              <FormattedText
                text={
                  t.ios_card1_desc ||
                  'Free Apple ID allows only 3 sideloaded apps. LiveContainer runs other apps inside itself so they don\'t count toward the limit.'
                }
                as="p"
              />
            </div>

            <div className="feature-info-card">
              <div className="feature-icon-box">
                <RefreshCw size={20} />
              </div>
              <h4>{t.ios_card2_title || '7-day refresh'}</h4>
              <FormattedText
                text={
                  t.ios_card2_desc ||
                  'Apps expire every 7 days on a free Apple ID. Connect LocalDevVPN and refresh inside SideStore.'
                }
                as="p"
              />
            </div>

            <div className="feature-info-card">
              <div className="feature-icon-box">
                <ShieldCheck size={20} />
              </div>
              <h4>{t.ios_card3_title || 'Burner Apple ID'}</h4>
              <FormattedText
                text={
                  t.ios_card3_desc ||
                  'Strongly recommended. If Apple locks the account you don\'t lose your main iCloud.'
                }
                as="p"
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CHAPTER 04: FIXES & TROUBLESHOOTING (Tactical Terminal Crimson Atmosphere)
          ========================================================================= */}
      <section id="fixes" className="story-section section-fixes">
        <div className="section-atmosphere-glow" />
        <div className="story-section-container">
          <div className="section-header-block">
            <div className="chapter-meta-tag">
              <Wrench size={14} />
              <span>CHAPTER 04 // SHINOBI CODEX</span>
            </div>
            <h2 className="section-headline">{t.fix_title || 'Fixes & Troubleshooting'}</h2>
            <FormattedText
              text={
                t.fix_sub ||
                'Most common issues and real solutions from helpers'
              }
              as="p"
              className="section-subhead"
            />
          </div>

          {/* Search Bar Input */}
          <div className="faq-search-wrapper">
            <Search size={18} className="faq-search-icon" />
            <input
              type="text"
              placeholder="Search error code, Play Protect, connection, VPN, certificate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="faq-search-input"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="faq-filter-chips">
            {[
              { id: 'all', label: 'All Issues' },
              { id: 'online', label: 'Online Mode' },
              { id: 'offline', label: 'Offline Mode' },
              { id: 'ios', label: 'iOS Sideload' },
              { id: 'emu', label: 'Emulator / PC' },
            ].map((chip) => (
              <button
                key={chip.id}
                type="button"
                className={`faq-chip ${faqCategory === chip.id ? 'active' : ''}`}
                onClick={() => setFaqCategory(chip.id as any)}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Accordion Drawers */}
          <div className="faq-accordion-list">
            {filteredFaqs.map((faq) => {
              const isOpen = !!openFaqs[faq.id]
              return (
                <div key={faq.id} className={`faq-item-card ${isOpen ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="faq-item-header"
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <div className="faq-header-left">
                      <span className="faq-tag-pill">{faq.tag}</span>
                      <span>{faq.q}</span>
                    </div>
                    <ChevronDown size={18} className="faq-chevron" />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="faq-body-content">
                          <FormattedText text={faq.a} as="p" />
                          {faq.tip && (
                            <div className="faq-tip-box">
                              <strong>Helper Tip:</strong> {faq.tip}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          CHAPTER 05: IMPORTANT NOTES (Stealth Kurogane Archival Atmosphere)
          ========================================================================= */}
      <section id="notes" className="story-section section-notes">
        <div className="section-atmosphere-glow" />
        <div className="story-section-container">
          <div className="section-header-block">
            <div className="chapter-meta-tag">
              <BookOpen size={14} />
              <span>CHAPTER 05 // ARCHIVE SCROLLS</span>
            </div>
            <h2 className="section-headline">{t.notes_title || 'Important notes'}</h2>
            <FormattedText
              text={t.notes_sub || 'Emulator, accounts and common mistakes'}
              as="p"
              className="section-subhead"
            />
          </div>

          <div className="notes-grid">
            <div className="note-archival-card">
              <span className="note-badge-label">{t.note1_label || 'EMULATOR'}</span>
              <h3>{t.note1_title || 'Use Pie64 image'}</h3>
              <FormattedText
                text={
                  t.note1_desc ||
                  'Many users from USA and Asia automatically get the Nougat image. Offline update then crashes. Always choose the Pie64 (Android 9 64-bit) system image when creating the emulator instance.'
                }
                as="p"
              />
            </div>

            <div className="note-archival-card">
              <span className="note-badge-label">{t.note2_label || 'ACCOUNTS'}</span>
              <h3>{t.note2_title || 'Online ≠ Offline'}</h3>
              <FormattedText
                text={
                  t.note2_desc ||
                  'They are completely separate applications with separate accounts. Progress never transfers. Online links via Discord (Others → Account). Offline is local only.'
                }
                as="p"
              />
            </div>

            <div className="note-archival-card">
              <span className="note-badge-label">{t.note3_label || 'ONLINE'}</span>
              <h3>{t.note3_title || 'No Data Transfer'}</h3>
              <FormattedText
                text={
                  t.note3_desc ||
                  'The old Data Transfer code does not work for Online. You must link the account from inside the game: Others → Account → Discord.'
                }
                as="p"
              />
            </div>

            <div className="note-archival-card">
              <span className="note-badge-label">{t.note4_label || 'OFFLINE'}</span>
              <h3>{t.note4_title || 'Local data only'}</h3>
              <FormattedText
                text={
                  t.note4_desc ||
                  'Everything is stored on the phone/emulator. Uninstalling the game or clearing data = permanent loss. There is no cloud backup.'
                }
                as="p"
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CHAPTER 06: OFFICIAL VERIFIED LINKS (Emerald Trust Atmosphere)
          ========================================================================= */}
      <section id="links" className="story-section section-links">
        <div className="section-atmosphere-glow" />
        <div className="story-section-container">
          <div className="section-header-block">
            <div className="chapter-meta-tag">
              <ShieldCheck size={14} />
              <span>CHAPTER 06 // VERIFIED CHANNELS</span>
            </div>
            <h2 className="section-headline">{t.links_title || 'Official links'}</h2>
            <FormattedText
              text={t.links_sub || 'Verified sources only'}
              as="p"
              className="section-subhead"
            />
          </div>

          <div className="verified-links-grid">
            {/* Link 1: Official Site */}
            <div className="link-access-card">
              <div className="link-card-meta">
                <h4>{t.link_site || 'Official site'}</h4>
                <p>blazingonline.wiki</p>
              </div>
              <div className="link-actions-cluster">
                <a
                  href="https://blazingonline.wiki"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="open-link-pill"
                >
                  <span>Visit</span>
                  <ArrowUpRight size={14} />
                </a>
              </div>
            </div>

            {/* Link 2: Download APK */}
            <div className="link-access-card">
              <div className="link-card-meta">
                <h4>{t.link_apk || 'Download APK (Online)'}</h4>
                <p>{t.link_apk_sub || 'Only from Discord #downloads'}</p>
              </div>
              <div className="link-actions-cluster">
                <a
                  href="https://discord.gg/blazingrebirth"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="open-link-pill"
                >
                  <span>Discord</span>
                  <Download size={14} />
                </a>
              </div>
            </div>

            {/* Link 3: Discord Server */}
            <div className="link-access-card">
              <div className="link-card-meta">
                <h4>Discord Server</h4>
                <p>{t.link_discord_sub || '#downloads channel for Offline'}</p>
              </div>
              <div className="link-actions-cluster">
                <a
                  href="https://discord.gg/blazingrebirth"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="open-link-pill"
                >
                  <span>Join</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* Link 4: SideInstaller */}
            <div className="link-access-card">
              <div className="link-card-meta">
                <h4>{t.link_sideinstaller || 'SideInstaller (official)'}</h4>
                <p>frizzlem.github.io/SideInstaller</p>
              </div>
              <div className="link-actions-cluster">
                <a
                  href="https://frizzlem.github.io/SideInstaller/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="open-link-pill"
                >
                  <span>Install</span>
                  <Apple size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CHAPTER 07: HOW TO UPDATE (Emerald Glow Atmosphere)
          ========================================================================= */}
      <section id="updates" className="story-section section-updates">
        <div className="section-atmosphere-glow" />
        <div className="story-section-container">
          <div className="section-header-block">
            <div className="chapter-meta-tag">
              <RefreshCw size={14} />
              <span>CHAPTER 07 // PATCH PROTOCOL</span>
            </div>
            <h2 className="section-headline">{t.upd_title || 'How to Update'}</h2>
            <FormattedText
              text={
                t.upd_sub ||
                'Online and Offline have different update processes · Back up saves before updating Offline'
              }
              as="p"
              className="section-subhead"
            />
          </div>

          {/* Warning Note */}
          <div className="warning-strip-card" style={{ marginBottom: '2.5rem' }}>
            <div className="warning-icon-wrapper" style={{ color: 'var(--accent-amber)' }}>
              <AlertTriangle size={22} />
            </div>
            <FormattedText
              text={t.upd_warning || '<strong>Warning:</strong> Updating Offline can overwrite or lose your save data. Always export your save slot before running an update.'}
              as="p"
            />
          </div>

          {/* Online Update Section */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Wifi size={18} style={{ color: 'var(--accent-blue)' }} />
              {t.upd_online_h || 'Online Mode — How to Update'}
            </h3>
            <div className="steps-timeline-stack">
              <div className="step-card">
                <div className="step-card-num"><div className="step-num-badge">01</div></div>
                <div className="step-card-body">
                  <h3>{t.upd_on_s1_title || 'Download the new APK'}</h3>
                  <FormattedText
                    text={t.upd_on_s1_desc || 'When a new version is released, the announcement will be posted on the official Discord server → #downloads channel. Download the latest APK.'}
                    as="p"
                  />
                  <div style={{ marginTop: '1rem' }}>
                    <a
                      href="https://discord.gg/blazingrebirth"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cta-button-primary"
                      style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem', display: 'inline-flex' }}
                    >
                      <span>Go to Discord #downloads</span>
                      <ArrowUpRight size={14} />
                    </a>
                  </div>
                </div>
              </div>
              <div className="step-card">
                <div className="step-card-num"><div className="step-num-badge">02</div></div>
                <div className="step-card-body">
                  <h3>{t.upd_on_s2_title || 'Install over the existing app'}</h3>
                  <FormattedText
                    text={t.upd_on_s2_desc || 'Install the new APK on top of the existing installation. Do <strong>not</strong> uninstall first — your Discord account link will be preserved.'}
                    as="p"
                  />
                </div>
              </div>
              <div className="step-card">
                <div className="step-card-num"><div className="step-num-badge">03</div></div>
                <div className="step-card-body">
                  <h3>{t.upd_on_s3_title || 'Launch and download patch data'}</h3>
                  <FormattedText
                    text={t.upd_on_s3_desc || 'Open the game. It will automatically download any missing patch data. Keep the screen on and use Wi-Fi.'}
                    as="p"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Android Offline Update Section */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <HardDrive size={18} style={{ color: 'var(--accent-amber)' }} />
              {t.upd_offline_h || 'Android Offline Mode — How to Update (with Save Backup)'}
            </h3>
            <div className="steps-timeline-stack">
              <div className="step-card">
                <div className="step-card-num"><div className="step-num-badge">01</div></div>
                <div className="step-card-body">
                  <h3 style={{ color: 'var(--accent-amber)' }}>{t.upd_off_s1_title || 'STEP 1 (OPTIONAL): Back up your save slot'}</h3>
                  <FormattedText
                    text={t.upd_off_s1_desc || '<strong>Optional — only if you already played and have progress to keep:</strong> In game tap Floating Menu → Saves → active slot (Slot 1) → Rename → Export. Save the file in Files / Google Drive.<br /><em>If this is your first time playing or you want to start fresh, ignore this step and go directly to Step 2!</em>'}
                    as="p"
                  />
                  <div className="step-callout-note danger" style={{ marginTop: '0.75rem' }}>
                    <Save size={14} style={{ display: 'inline', marginRight: '0.4rem' }} />
                    <strong>Save path:</strong> Floating Menu → Saves → Slot 1 → Rename → Export
                  </div>
                </div>
              </div>
              <div className="step-card">
                <div className="step-card-num"><div className="step-num-badge">02</div></div>
                <div className="step-card-body">
                  <h3>{t.upd_off_s2_title || 'Open Launcher → Updates → Beta channel'}</h3>
                  <FormattedText
                    text={t.upd_off_s2_desc || 'Open the Launcher (Sage Mode icon) → left-side menu → Updates. Make sure the channel is set to Beta. Then tap Check for updates.'}
                    as="p"
                  />
                </div>
              </div>
              <div className="step-card">
                <div className="step-card-num"><div className="step-num-badge">03</div></div>
                <div className="step-card-body">
                  <h3>{t.upd_off_s3_title || 'Update and Fix'}</h3>
                  <FormattedText
                    text={t.upd_off_s3_desc || 'Tap Update now and wait. After the launcher reinstalls, reopen it and tap Fix to re-download/verify the game files. Play Protect may appear again — always More info → Install anyway.'}
                    as="p"
                  />
                </div>
              </div>
              <div className="step-card">
                <div className="step-card-num"><div className="step-num-badge">04</div></div>
                <div className="step-card-body">
                  <h3>{t.upd_off_s4_title || 'Restore your save if needed'}</h3>
                  <FormattedText
                    text={t.upd_off_s4_desc || 'If your progress is gone after the update: Floating Menu → Saves → tap Import → select your exported save file. Your progress will be fully restored.'}
                    as="p"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* iOS Offline Update Section */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Apple size={18} style={{ color: 'var(--accent-purple, #a78bfa)' }} />
              {t.upd_ios_h || 'iOS Offline Mode — How to Update (with Save Backup)'}
            </h3>
            <div className="steps-timeline-stack">
              <div className="step-card">
                <div className="step-card-num"><div className="step-num-badge">01</div></div>
                <div className="step-card-body">
                  <h3 style={{ color: 'var(--accent-amber)' }}>{t.upd_ios_s1_title || 'STEP 1 (OPTIONAL): Back up your save slot in Files'}</h3>
                  <FormattedText
                    text={t.upd_ios_s1_desc || '<strong>Optional — only if you already played:</strong> In game tap Floating Menu → Saves → Slot 1 → Rename → Export and save it in the iOS Files app.<br /><em>If installing for the first time, ignore this step and proceed directly to Step 2!</em>'}
                    as="p"
                  />
                  <div className="step-callout-note danger" style={{ marginTop: '0.75rem' }}>
                    <Save size={14} style={{ display: 'inline', marginRight: '0.4rem' }} />
                    <strong>iOS Save Path:</strong> Floating Menu → Saves → Slot 1 → Rename → Export → Files App
                  </div>
                </div>
              </div>
              <div className="step-card">
                <div className="step-card-num"><div className="step-num-badge">02</div></div>
                <div className="step-card-body">
                  <h3>{t.upd_ios_s2_title || 'In-Game Floating Menu → Updates'}</h3>
                  <FormattedText
                    text={t.upd_ios_s2_desc || 'Open the Floating Menu → tap <strong>Updates</strong>. Wait for the newest version (currently v4) to finish downloading at the bottom. You will see the download progress bar.'}
                    as="p"
                  />
                </div>
              </div>
              <div className="step-card">
                <div className="step-card-num"><div className="step-num-badge">03</div></div>
                <div className="step-card-body">
                  <h3>{t.upd_ios_s3_title || 'Share IPA directly to SideStore'}</h3>
                  <FormattedText
                    text={t.upd_ios_s3_desc || 'When download completes, 2 options appear below: <strong>Open in Files</strong> or <strong>Share IPA</strong>. Tap <strong>Share IPA</strong> → select <strong>SideStore</strong> from the share sheet to install directly! (Or choose Open in Files and import it manually into SideStore).'}
                    as="p"
                  />
                </div>
              </div>
              <div className="step-card">
                <div className="step-card-num"><div className="step-num-badge">04</div></div>
                <div className="step-card-body">
                  <h3>{t.upd_ios_s4_title || 'Restore your save if needed'}</h3>
                  <FormattedText
                    text={t.upd_ios_s4_desc || 'Launch the updated game. If progress is reset, tap the <strong>Floating Menu</strong> → <strong>Saves</strong> → <strong>Import from files</strong> → pick your exported save file from the Files app. All your characters, pearls, and progress are restored!'}
                    as="p"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Chapter 07 Navigation Jump Cluster */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
            <button type="button" className="cta-button-glass" onClick={() => scrollTo('#online')} style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem' }}>
              <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
              <span>{t.nav_back_online || '← Back to Online Guide'}</span>
            </button>
            <button type="button" className="cta-button-glass" onClick={() => scrollTo('#offline')} style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem' }}>
              <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
              <span>{t.nav_back_offline || '← Back to Offline Guide'}</span>
            </button>
            <button type="button" className="cta-button-glass" onClick={() => scrollTo('#ios')} style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem' }}>
              <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
              <span>{t.nav_back_ios || '← Back to iOS Guide'}</span>
            </button>
            <button type="button" className="cta-button-glass" onClick={() => scrollTo('#fixes')} style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem' }}>
              <span>{t.nav_continue_fixes || 'Fixes & Troubleshooting →'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-brand-title">NARUTO BLAZING REBIRTH</div>
          <FormattedText
            text={
              t.footer_note ||
              'Unofficial guide made by a community helper.<br />Not affiliated with the official project team.'
            }
            as="p"
            className="footer-disclaimer-text"
          />
          <div className="footer-badges-row">
            <span className="footer-pill-tag">
              {t.footer_update || 'Last update: October 2026'}
            </span>
            <span className="footer-pill-tag">
              {t.footer_free || 'Fan-made project · Free'}
            </span>
          </div>
          <FormattedText
            text={
              t.footer_credit ||
              'Site designed & built by <a href="https://github.com/txrrot" target="_blank" rel="noopener">TXRROT</a>'
            }
            as="div"
            className="footer-credit-line"
          />
        </div>
      </footer>

      {/* FLOATING DM TXRROT WIDGET */}
      <a
        href="https://discord.com/users/888013245313605683"
        target="_blank"
        rel="noopener noreferrer"
        className="dm-txrrot-widget"
        title="DM TXRROT on Discord"
      >
        <div className="dm-avatar-ring">
          <img
            src={txrrotAvatar}
            alt="TXRROT"
            className="dm-avatar-img"
          />
        </div>
        <div className="dm-widget-text">
          <span className="dm-widget-label">Need help?</span>
          <span className="dm-widget-name">DM TXRROT</span>
        </div>
        <div className="dm-widget-arrow">
          <ArrowUpRight size={14} />
        </div>
      </a>

      {/* FLOATING TOAST NOTIFIER */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            className="floating-toast-alert"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
          >
            <CheckCircle2 size={16} color="var(--accent-emerald)" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
