import { useEffect, useState, useRef, useMemo } from 'react'
import Lenis from 'lenis'
import { translations, type Lang } from './data/translations'
import heroArt from './assets/blazing_hero_banner.jpg'

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
    'on1': true,
    'off1': true,
    'ios1': true,
  })
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const lenisRef = useRef<Lenis | null>(null)

  // Translations helper
  const t = useMemo(() => {
    return translations[lang] || translations.en
  }, [lang])

  const changeLang = (newLang: Lang) => {
    setLang(newLang)
    localStorage.setItem('blazing-lang', newLang)
    document.documentElement.lang = newLang
    setLangOpen(false)
  }

  // Toast feedback
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev))
    }, 2500)
  }

  // Copy helper
  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`Copied ${label} to clipboard!`)
    })
  }

  // Toggle FAQ item
  const toggleFaq = (id: string) => {
    setOpenFaqs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Smooth scroll using Lenis
  const scrollTo = (target: string) => {
    setMobileMenuOpen(false)
    if (lenisRef.current) {
      const el = document.querySelector(target)
      if (el) {
        lenisRef.current.scrollTo(el as HTMLElement, { offset: -70, duration: 1.2 })
      }
    } else {
      const el = document.querySelector(target)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.8,
    })
    lenisRef.current = lenis

    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      const current = window.scrollY
      setScrollProgress(total > 0 ? (current / total) * 100 : 0)
      setIsScrolled(current > 50)
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
    const handleClick = () => {
      setLangOpen(false)
    }
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  // All Comprehensive FAQ Items
  const allFaqs = [
    {
      id: 'on1',
      cat: 'online',
      tag: 'Play Protect',
      badgeClass: 'badge-hot',
      q: t.faq_on1_q || '1. Play Protect blocked the install',
      a: t.faq_on1_a || 'During installation you must press More info / Show more → Install anyway. If you skipped this, uninstall and reinstall correctly.',
      tip: 'Google Play Protect flags custom unsigned APKs by default. It is 100% safe to proceed.',
    },
    {
      id: 'on2',
      cat: 'online',
      tag: 'Network',
      badgeClass: 'badge-hot',
      q: t.faq_on2_q || '2. Antivirus / Firewall / Private DNS',
      a: t.faq_on2_a || 'Turn off antivirus, firewall and Private DNS temporarily. These often block the connection to the private server.',
      tip: 'Go to Android Settings → Network & Internet → Private DNS → Set to "Off".',
    },
    {
      id: 'on3',
      cat: 'online',
      tag: 'VPN EU',
      badgeClass: 'badge-hot',
      q: t.faq_on3_q || '3. VPN needed (Europe recommended)',
      a: t.faq_on3_a || 'Some regions need a VPN. European servers are recommended. Connect to an EU location (Germany, France, UK) and try again.',
      tip: 'TunnelBear, ProtonVPN Free, or Windscribe work well.',
    },
    {
      id: 'on4',
      cat: 'online',
      tag: 'Auth Error',
      badgeClass: 'badge-danger',
      q: '4. Discord Login blank page or redirect failure',
      a: 'If tapping "Sign in with Discord" opens a blank browser page or doesn\'t redirect back to the game, ensure Google Chrome is set as your default browser in phone settings. Some internal browsers (Xiaomi, Samsung Internet) block custom URI schemes.',
      tip: 'Settings → Apps → Default Apps → Browser App → select Chrome.',
    },
    {
      id: 'off1',
      cat: 'offline',
      tag: 'Launcher',
      badgeClass: 'badge-danger',
      q: t.faq_off1_q || '1. Outdated Launcher (Connection Error)',
      a: t.faq_off1_a || 'You must switch to Beta channel and update to the latest version (v0.28+). The old stable launcher gives connection errors.',
      tip: 'Launcher menu (top left) → Updates → Channel: Beta → Check for updates → Update now.',
    },
    {
      id: 'off2',
      cat: 'offline',
      tag: 'Play Protect',
      badgeClass: 'badge-hot',
      q: t.faq_off2_q || '2. Play Protect blocked during install',
      a: t.faq_off2_a || 'Same as Online: More info → Install anyway. If you continued without this, reinstall both launcher and game properly.',
      tip: 'It may prompt twice: once for the launcher, once for the game APK.',
    },
    {
      id: 'off3',
      cat: 'offline',
      tag: 'Corrupted File',
      badgeClass: 'badge-hot',
      q: t.faq_off3_q || '3. Corrupted APK download',
      a: t.faq_off3_a || 'Delete the APK and redownload from #downloads. Incomplete downloads are common on mobile browsers.',
      tip: 'Use Firefox or Opera Mobile if Chrome pauses the download at 99%.',
    },
    {
      id: 'off4',
      cat: 'offline',
      tag: 'Restart',
      badgeClass: 'badge-hot',
      q: t.faq_off4_q || '4. Black screen on launch / Game freeze',
      a: t.faq_off4_a || 'Force close the game completely and reopen, or restart your device. In the launcher, tap "Fix" again to re-verify assets.',
      tip: 'Make sure your phone has at least 4 GB free storage space.',
    },
    {
      id: 'off5',
      cat: 'offline',
      tag: 'Save Data',
      badgeClass: 'badge-danger',
      q: '5. Does Offline mode save my account in the cloud?',
      a: 'No! Offline mode saves your character, pearls, and progress locally on your device. If you uninstall the app or clear its data, your progress is permanently lost. There is no cloud restoration.',
      tip: 'Take backups of app data using tools like Swift Backup if your device is rooted.',
    },
    {
      id: 'ios1',
      cat: 'ios',
      tag: 'Certificate',
      badgeClass: 'badge-danger',
      q: t.faq_ios1_q || '1. SideInstaller won\'t open / Certificate revoked',
      a: t.faq_ios1_a || 'Go back to the official install page (frizzlem.github.io/SideInstaller) and pick another available certificate. Certificates get revoked frequently by Apple.',
      tip: 'Current known working cert: China-Telecom-Corporation-Limited-XC-com-ctq-qmc-yiban-p (valid until 2029).',
    },
    {
      id: 'ios2',
      cat: 'ios',
      tag: 'Trust Profile',
      badgeClass: 'badge-hot',
      q: t.faq_ios2_q || '2. "Unable to verify app" error on iOS',
      a: t.faq_ios2_a || 'Settings → General → VPN & Device Management → tap the developer profile under Enterprise App → Trust.',
      tip: 'Also enable Developer Mode in Settings → Privacy & Security → Developer Mode.',
    },
    {
      id: 'ios3',
      cat: 'ios',
      tag: '7-Day Timer',
      badgeClass: 'badge-hot',
      q: t.faq_ios3_q || '3. Apps expire / Refresh fails in SideStore',
      a: t.faq_ios3_a || 'Make sure LocalDevVPN is connected. Open SideStore → My Apps → tap the 7 DAYS timer to force a refresh before expiration.',
      tip: 'If Wi-Fi sync is enabled on PC, it can refresh automatically in background.',
    },
    {
      id: 'ios4',
      cat: 'ios',
      tag: 'Apple ID',
      badgeClass: 'badge-hot',
      q: t.faq_ios4_q || '4. Apple ID too new / rate limited',
      a: t.faq_ios4_a || 'Wait 15–30 minutes or use a different (older) Apple ID. Very new accounts are often restricted by Apple\'s Anisette verification.',
      tip: 'Always use a burner secondary Apple ID for sideloading safety.',
    },
    {
      id: 'emu1',
      cat: 'emu',
      tag: 'Emulator Bug',
      badgeClass: 'badge-danger',
      q: '1. Emulator crash on launch: Nougat vs Pie64 Bug',
      a: 'If running an emulator (LDPlayer 9, BlueStacks 5, MuMu Player 12), you MUST choose the "Android 9 (Pie 64-bit)" instance. Nougat (Android 7 32/64-bit) crashes immediately during the offline update and asset download.',
      tip: 'Open Multi-Instance Manager → New Instance → select Android 9 64-bit (Pie64).',
    },
    {
      id: 'emu2',
      cat: 'emu',
      tag: 'Performance',
      badgeClass: 'badge-hot',
      q: '2. Recommended Emulator settings for 60 FPS',
      a: 'Assign 4 CPU Cores and 4096 MB RAM to the instance. In settings, set Graphics Renderer to DirectX or Vulkan depending on your GPU. Ensure Virtualization (VT-x / AMD-V) is enabled in your PC BIOS.',
      tip: 'Disable Root permission in emulator settings to prevent anti-cheat false triggers.',
    },
  ]

  // Filtered FAQs
  const filteredFaqs = allFaqs.filter((faq) => {
    const matchesCat = faqCategory === 'all' || faq.cat === faqCategory
    const qLower = searchQuery.toLowerCase()
    const matchesSearch =
      !searchQuery ||
      faq.q.toLowerCase().includes(qLower) ||
      faq.a.toLowerCase().includes(qLower) ||
      faq.tag.toLowerCase().includes(qLower)
    return matchesCat && matchesSearch
  })

  return (
    <>
      {/* Noise background */}
      <div className="noise" />

      {/* Scroll Progress Bar */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      {/* Floating Toast Notification */}
      {toastMessage && <div className="toast-msg">{toastMessage}</div>}

      {/* TOP NAVIGATION */}
      <header className={`nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner">
          <a
            href="#hero"
            className="logo"
            onClick={(e) => {
              e.preventDefault()
              scrollTo('#hero')
            }}
          >
            BLAZING<em>REBIRTH</em>
          </a>

          <nav className="nav-links">
            <a
              href="#online"
              onClick={(e) => {
                e.preventDefault()
                scrollTo('#online')
              }}
            >
              {t.nav_online || 'Online'}
            </a>
            <a
              href="#offline"
              onClick={(e) => {
                e.preventDefault()
                scrollTo('#offline')
              }}
            >
              {t.nav_offline || 'Offline'}
            </a>
            <a
              href="#ios"
              onClick={(e) => {
                e.preventDefault()
                scrollTo('#ios')
              }}
            >
              {t.nav_ios || 'iOS'}
            </a>
            <a
              href="#fixes"
              onClick={(e) => {
                e.preventDefault()
                scrollTo('#fixes')
              }}
            >
              {t.nav_fixes || 'Fixes'}
            </a>
            <a
              href="#notes"
              onClick={(e) => {
                e.preventDefault()
                scrollTo('#notes')
              }}
            >
              {t.nav_notes || 'Notes'}
            </a>
            <a
              href="#links"
              onClick={(e) => {
                e.preventDefault()
                scrollTo('#links')
              }}
            >
              Links
            </a>
          </nav>

          <div className="nav-right">
            {/* Language Switcher */}
            <div
              className="lang-switcher"
              style={{ position: 'relative' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className={`lang-btn ${langOpen ? 'open' : ''}`}
                onClick={() => setLangOpen(!langOpen)}
                aria-label="Switch language"
              >
                <span>{lang.toUpperCase()}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {langOpen && (
                <div className="lang-dropdown">
                  <button className={lang === 'en' ? 'active' : ''} onClick={() => changeLang('en')}>
                    🇬🇧 English (EN)
                  </button>
                  <button className={lang === 'ro' ? 'active' : ''} onClick={() => changeLang('ro')}>
                    🇷🇴 Română (RO)
                  </button>
                  <button className={lang === 'fr' ? 'active' : ''} onClick={() => changeLang('fr')}>
                    🇫🇷 Français (FR)
                  </button>
                  <button className={lang === 'es' ? 'active' : ''} onClick={() => changeLang('es')}>
                    🇪🇸 Español (ES)
                  </button>
                  <button className={lang === 'ko' ? 'active' : ''} onClick={() => changeLang('ko')}>
                    🇰🇷 한국어 (KO)
                  </button>
                </div>
              )}
            </div>

            {/* Official Discord button */}
            <a
              href="https://discord.gg/blazingrebirth"
              target="_blank"
              rel="noopener noreferrer"
              className="discord-btn"
            >
              <span>Discord Server</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
              </svg>
            </a>

            {/* Hamburger button */}
            <button
              type="button"
              className="hamburger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
        <button
          type="button"
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#fff', fontSize: '2rem' }}
          onClick={() => setMobileMenuOpen(false)}
        >
          ✕
        </button>
        <a href="#online" onClick={() => scrollTo('#online')}>
          {t.nav_online || 'Online'}
        </a>
        <a href="#offline" onClick={() => scrollTo('#offline')}>
          {t.nav_offline || 'Offline'}
        </a>
        <a href="#ios" onClick={() => scrollTo('#ios')}>
          {t.nav_ios || 'iOS'}
        </a>
        <a href="#fixes" onClick={() => scrollTo('#fixes')}>
          {t.nav_fixes || 'Fixes'}
        </a>
        <a href="#notes" onClick={() => scrollTo('#notes')}>
          {t.nav_notes || 'Notes'}
        </a>
        <a href="#links" onClick={() => scrollTo('#links')}>
          Links
        </a>
        <div style={{ marginTop: '2rem', display: 'flex', gap: '0.8rem' }}>
          {(['en', 'ro', 'fr', 'es', 'ko'] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => changeLang(l)}
              style={{
                background: lang === l ? 'var(--orange)' : 'var(--surface-2)',
                color: lang === l ? '#000' : 'var(--text-2)',
                border: '1px solid var(--border)',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                fontWeight: 700,
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* HERO SECTION */}
      <section id="hero" className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
          <div className="hero-grid" />
        </div>

        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot" />
            <span>{t.hero_badge || 'FAN-MADE REVIVAL · 2026'}</span>
          </div>

          <h1 className="hero-title">
            <span className="hero-title-line">
              <span>NARUTO BLAZING</span>
            </span>
            <span className="hero-title-line">
              <span className="orange">REBIRTH</span>
            </span>
          </h1>

          <p
            className="hero-sub"
            dangerouslySetInnerHTML={{
              __html: t.hero_sub || 'Complete installation, troubleshooting and tips guide for the community server. No bloat. Just what you need.',
            }}
          />

          {/* Quick jump CTA buttons */}
          <div className="hero-ctas">
            <button
              type="button"
              className="btn-primary"
              onClick={() => scrollTo('#online')}
            >
              <span>{t.hero_cta_online || 'Online Guide'}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            <button
              type="button"
              className="btn-ghost"
              onClick={() => scrollTo('#offline')}
            >
              <span>{t.hero_cta_offline || 'Offline Guide'}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <button
              type="button"
              className="btn-ghost"
              onClick={() => scrollTo('#ios')}
            >
              <span>{t.hero_cta_ios || 'iOS Sideload'}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
            </button>
          </div>

          {/* Platform Filter Selector */}
          <div className="platform-chips">
            <button
              type="button"
              className={`chip ${activePlatform === 'all' ? 'active' : ''}`}
              onClick={() => setActivePlatform('all')}
            >
              🌟 All Guides
            </button>
            <button
              type="button"
              className={`chip ${activePlatform === 'android' ? 'active' : ''}`}
              onClick={() => {
                setActivePlatform('android')
                scrollTo('#online')
              }}
            >
              🤖 Android Mobile
            </button>
            <button
              type="button"
              className={`chip ${activePlatform === 'ios' ? 'active' : ''}`}
              onClick={() => {
                setActivePlatform('ios')
                scrollTo('#ios')
              }}
            >
              🍎 iOS Sideload (No PC)
            </button>
            <button
              type="button"
              className={`chip ${activePlatform === 'pc' ? 'active' : ''}`}
              onClick={() => {
                setActivePlatform('pc')
                scrollTo('#notes')
              }}
            >
              💻 PC Emulator (Pie64)
            </button>
          </div>

          {/* Key Visual Hero Artwork */}
          <div className="hero-art-wrapper">
            <img
              src={heroArt}
              alt="Naruto Blazing Rebirth Key Visual Artwork"
              className="hero-art-img"
              loading="eager"
            />
            <div className="hero-art-badge">
              <span>🔥</span>
              <span>OFFICIAL 2026 REVIVAL ARCHIVE</span>
            </div>
          </div>

          {/* Story Fast-Jump Bar */}
          <div className="story-jump-bar">
            <button type="button" className="jump-pill" onClick={() => scrollTo('#online')}>
              ⚡ 01 Online Mode
            </button>
            <button type="button" className="jump-pill" onClick={() => scrollTo('#offline')}>
              🎮 02 Offline Mode
            </button>
            <button type="button" className="jump-pill" onClick={() => scrollTo('#ios')}>
              📲 03 iOS Sideload
            </button>
            <button type="button" className="jump-pill" onClick={() => scrollTo('#fixes')}>
              🛠️ 04 Fixes & Debug
            </button>
            <button type="button" className="jump-pill" onClick={() => scrollTo('#notes')}>
              📖 05 Important Notes
            </button>
            <button type="button" className="jump-pill" onClick={() => scrollTo('#links')}>
              🔗 06 Verified Links
            </button>
          </div>

          {/* Stats Bar */}
          <div className="stats-strip">
            <div className="stat-item">
              <div className="stat-num">
                100<span className="stat-suffix">%</span>
              </div>
              <div className="stat-label">Free · No Paywalls</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">2</div>
              <div className="stat-label">Modes: Online & Offline</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">
                1000<span className="stat-suffix">+</span>
              </div>
              <div className="stat-label">Pearls on Offline Start</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">
                iOS<span className="stat-suffix">27</span>
              </div>
              <div className="stat-label">No-PC Sideload Support</div>
            </div>
          </div>
        </div>

        <div className="scroll-indicator">
          <div className="scroll-mouse">
            <div className="scroll-wheel" />
          </div>
          <span>SCROLL TO EXPLORE</span>
        </div>
      </section>

      {/* WARNING STRIP */}
      <div className="warning">
        <p
          dangerouslySetInnerHTML={{
            __html:
              t.warning ||
              '<strong>Warning:</strong> Fan-made, unofficial project. Not affiliated with Bandai Namco / GREE. Everything is free. Download the APK <em>only</em> from the official Discord / site.',
          }}
        />
      </div>

      {/* SECTION 01: ONLINE MODE */}
      <section id="online" className="section">
        <div className="container">
          <div className="section-header-row">
            <div>
              <div className="section-tag">01 — ONLINE MODE</div>
              <h2 className="section-h2">{t.online_title || 'Online Mode'}</h2>
            </div>
            <p className="section-desc">
              {t.online_sub || 'Live servers · Discord-linked account · Banners progress chronologically'}
            </p>
          </div>

          {/* Interactive Steps Timeline */}
          <div className="steps">
            {/* Step 1 */}
            <div className="step">
              <div className="step-num-wrap">
                <div className="step-num">01</div>
              </div>
              <div className="step-body">
                <h3>{t.on_s1_title || 'Join the Discord'}</h3>
                <p>
                  {t.on_s1_desc ||
                    'Your game account is linked to Discord. Join the official server and complete verification in the #rules channel.'}
                </p>
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                  <a
                    href="https://discord.gg/blazingrebirth"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-arr"
                  >
                    Open Discord Invite
                  </a>
                  <button
                    type="button"
                    className="copy-btn"
                    onClick={() => copyText('https://discord.gg/blazingrebirth', 'Discord Link')}
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="step">
              <div className="step-num-wrap">
                <div className="step-num">02</div>
              </div>
              <div className="step-body">
                <h3>{t.on_s2_title || 'Download the APK'}</h3>
                <p>
                  {t.on_s2_desc ||
                    'From the official site or #downloads channel. If the download does not finish 100%, switch browser (Chrome to Firefox or vice versa) and try again.'}
                </p>
                <div className="step-note">
                  <strong>Browser Pro Tip:</strong> If Google Chrome stops at 99% or says "Download paused", use Firefox Mobile or download directly via Discord app.
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="step">
              <div className="step-num-wrap">
                <div className="step-num">03</div>
              </div>
              <div className="step-body">
                <h3>{t.on_s3_title || 'Install'}</h3>
                <p
                  dangerouslySetInnerHTML={{
                    __html:
                      t.on_s3_desc ||
                      'Open the APK. <strong>Play Protect will appear</strong> → tap <em>More info</em> / <em>Show more</em> → then <em>Install anyway</em>. Do not skip this step.',
                  }}
                />
                <div className="step-note danger">
                  <strong>Play Protect Warning:</strong> Custom fan revivals lack Google Play Store enterprise signatures. Play Protect triggers a red warning: ALWAYS tap <strong>More info</strong> → <strong>Install anyway</strong>.
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="step">
              <div className="step-num-wrap">
                <div className="step-num">04</div>
              </div>
              <div className="step-body">
                <h3>{t.on_s4_title || 'Sign in with Discord'}</h3>
                <p>
                  {t.on_s4_desc ||
                    'Open the game → Sign in with Discord. Account is created automatically. Let it download the ~220 MB game data (Wi-Fi, keep screen on).'}
                </p>
                <div className="checklist">
                  <div className="check-item">
                    <span className="check-icon check-icon-ok">✓</span>
                    <span>Make sure Chrome is set as default browser for the Discord OAuth prompt.</span>
                  </div>
                  <div className="check-item">
                    <span className="check-icon check-icon-warn">⚠️</span>
                    <span>Do NOT close the game while the 220 MB download is in progress.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cards for Online Mode */}
          <div className="cards">
            <div className="card">
              <div className="card-icon">🔗</div>
              <h4>{t.on_card1_title || 'Link Discord later'}</h4>
              <p>
                {t.on_card1_desc ||
                  'Others → Account. DATA TRANSFER code is NOT valid for Online — you must link from inside the game menu.'}
              </p>
            </div>
            <div className="card">
              <div className="card-icon">📜</div>
              <h4>{t.on_card2_title || 'Banners'}</h4>
              <p>
                {t.on_card2_desc ||
                  'Starts with the 2016 One Tail Naruto banner. Banners change chronologically as the server progresses.'}
              </p>
            </div>
            <div className="card">
              <div className="card-icon">⚡</div>
              <h4>{t.on_card3_title || 'Separate accounts'}</h4>
              <p>
                {t.on_card3_desc ||
                  'Online and Offline are completely separate apps with separate accounts. Progress does not transfer between them.'}
              </p>
            </div>
          </div>

          {/* Section Navigation */}
          <div className="section-nav">
            <button
              type="button"
              className="snav-btn"
              onClick={() => scrollTo('#fixes')}
            >
              <span className="snav-btn-icon">🛠️</span>
              <span>Need help? Jump to Fixes</span>
            </button>
            <button
              type="button"
              className="snav-btn next"
              onClick={() => scrollTo('#offline')}
            >
              <span>Next: Offline Guide</span>
              <span className="snav-btn-icon">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 02: OFFLINE MODE */}
      <section id="offline" className="section section-alt">
        <div className="container">
          <div className="section-header-row">
            <div>
              <div className="section-tag">02 — OFFLINE MODE</div>
              <h2 className="section-h2">{t.offline_title || 'Offline Mode'}</h2>
            </div>
            <p className="section-desc">
              {t.offline_sub || 'Launcher + game · Local save only · All banners available from the start'}
            </p>
          </div>

          {/* Offline Warning Card */}
          <div className="note-box danger">
            <p
              dangerouslySetInnerHTML={{
                __html:
                  t.offline_warning ||
                  '<strong>Important:</strong> Offline data is saved only on your device. Deleting the game = permanent loss of progress. There are 2 separate offline modes with separate local accounts.',
              }}
            />
          </div>

          {/* Interactive Steps */}
          <div className="steps">
            {/* Step 1 */}
            <div className="step">
              <div className="step-num-wrap">
                <div className="step-num">01</div>
              </div>
              <div className="step-body">
                <h3>{t.off_s1_title || 'Download the correct APK'}</h3>
                <p
                  dangerouslySetInnerHTML={{
                    __html:
                      t.off_s1_desc ||
                      'From the <strong>#downloads</strong> channel on Discord:<br />• <strong>ARM</strong> → real Android phone<br />• <strong>x86_x64</strong> → PC emulator',
                  }}
                />
                <div style={{ marginTop: '0.8rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <span className="tag tag-orange">ARM = Real Phones</span>
                  <span className="tag tag-green">x86_64 = PC Emulators</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="step">
              <div className="step-num-wrap">
                <div className="step-num">02</div>
              </div>
              <div className="step-body">
                <h3>{t.off_s2_title || 'Install the Launcher'}</h3>
                <p
                  dangerouslySetInnerHTML={{
                    __html:
                      t.off_s2_desc ||
                      '<strong>Play Protect will appear</strong> → <em>More info</em> → <em>Install anyway</em>. Open the app (Naruto Sage Mode icon).',
                  }}
                />
              </div>
            </div>

            {/* Step 3 */}
            <div className="step">
              <div className="step-num-wrap">
                <div className="step-num">03</div>
              </div>
              <div className="step-body">
                <h3>{t.off_s3_title || 'Update pop-up → Tap "Later"'}</h3>
                <p
                  dangerouslySetInnerHTML={{
                    __html:
                      t.off_s3_desc ||
                      'An update pop-up appears immediately. Tap <strong>Later</strong> (it points to an older release).',
                  }}
                />
              </div>
            </div>

            {/* Step 4 */}
            <div className="step">
              <div className="step-num-wrap">
                <div className="step-num">04</div>
              </div>
              <div className="step-body">
                <h3>{t.off_s4_title || 'Switch to Beta channel'}</h3>
                <p
                  dangerouslySetInnerHTML={{
                    __html:
                      t.off_s4_desc ||
                      'Open the left-side hamburger menu → <strong>Updates</strong>. Change the first setting from <em>Stable</em> to <em>Beta</em>. Then press <strong>Check for updates</strong>.',
                  }}
                />
              </div>
            </div>

            {/* Step 5 */}
            <div className="step">
              <div className="step-num-wrap">
                <div className="step-num">05</div>
              </div>
              <div className="step-body">
                <h3>{t.off_s5_title || 'Update to latest (v0.28+)'}</h3>
                <p
                  dangerouslySetInnerHTML={{
                    __html:
                      t.off_s5_desc ||
                      'Press <strong>Update now</strong>. Wait until it reinstalls the app (white UI like first install) → press Install when prompted.',
                  }}
                />
              </div>
            </div>

            {/* Step 6 */}
            <div className="step">
              <div className="step-num-wrap">
                <div className="step-num">06</div>
              </div>
              <div className="step-body">
                <h3>{t.off_s6_title || 'Fix + download game data'}</h3>
                <p
                  dangerouslySetInnerHTML={{
                    __html:
                      t.off_s6_desc ||
                      'Reopen the launcher → press <strong>Fix</strong>. The game (original icon) will download. <strong>Play Protect may appear again</strong> → always <em>More info</em> → <em>Install anyway</em> until the <strong>Play</strong> button appears.',
                  }}
                />
                <div className="step-note">
                  <strong>Did the Play button not appear?</strong> Tap <strong>Fix</strong> one more time. The installer needs to complete the second pass.
                </div>
              </div>
            </div>

            {/* Step 7 */}
            <div className="step">
              <div className="step-num-wrap">
                <div className="step-num">07</div>
              </div>
              <div className="step-body">
                <h3>{t.off_s7_title || 'Play!'}</h3>
                <p>{t.off_s7_desc || 'When the Play button is visible, tap it to launch the game.'}</p>
              </div>
            </div>
          </div>

          {/* Cards for Offline Mode */}
          <div className="cards">
            <div className="card">
              <div className="card-icon">💎</div>
              <h4>{t.off_card1_title || 'Vanilla mode'}</h4>
              <p>
                {t.off_card1_desc ||
                  'Starts at level 1 with 1000 pearls. All banners available from the start (unlike Online which starts in 2016).'}
              </p>
            </div>
            <div className="card">
              <div className="card-icon">⚙️</div>
              <h4>{t.off_card2_title || 'Rewards / Gameplay'}</h4>
              <p>
                {t.off_card2_desc ||
                  'You can customize rewards and gameplay parameters directly inside Launcher → GAMEPLAY.'}
              </p>
            </div>
            <div className="card">
              <div className="card-icon">💾</div>
              <h4>{t.off_card3_title || 'Local save only'}</h4>
              <p>
                {t.off_card3_desc ||
                  'Progress is stored on the device. Uninstalling the game deletes everything. No cloud backup.'}
              </p>
            </div>
          </div>

          {/* Section Navigation */}
          <div className="section-nav">
            <button
              type="button"
              className="snav-btn back"
              onClick={() => scrollTo('#online')}
            >
              <span className="snav-btn-icon">←</span>
              <span>Back to Online Guide</span>
            </button>
            <button
              type="button"
              className="snav-btn next"
              onClick={() => scrollTo('#ios')}
            >
              <span>Next: iOS Sideloading</span>
              <span className="snav-btn-icon">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 03: IOS SIDELOADING */}
      <section id="ios" className="section">
        <div className="container">
          <div className="section-header-row">
            <div>
              <div className="section-tag">03 — IOS SIDELOADING</div>
              <h2 className="section-h2">{t.ios_title || 'iOS Sideloading'}</h2>
            </div>
            <p className="section-desc">
              {t.ios_sub || 'SideStore + LiveContainer · Unlimited apps · No PC required on iOS 27'}
            </p>
          </div>

          {/* Warning regarding fake site */}
          <div className="note-box danger">
            <p
              dangerouslySetInnerHTML={{
                __html:
                  t.ios_warning ||
                  '<strong>Important:</strong> Use only official sources. The site <em>sideinstaller.com</em> is <strong>fake / malware</strong>. Official: sideinstaller.net and frizzlem.github.io/SideInstaller',
              }}
            />
          </div>

          {/* iOS Tab Selector */}
          <div className="tab-nav">
            <button
              type="button"
              className={`tab-nav-btn ${iosTab === 'nopc' ? 'active' : ''}`}
              onClick={() => setIosTab('nopc')}
            >
              📱 Method 1 — No PC (iOS 27)
            </button>
            <button
              type="button"
              className={`tab-nav-btn ${iosTab === 'pair' ? 'active' : ''}`}
              onClick={() => setIosTab('pair')}
            >
              🔑 Pairing File (iOS 18–26)
            </button>
            <button
              type="button"
              className={`tab-nav-btn ${iosTab === 'pc' ? 'active' : ''}`}
              onClick={() => setIosTab('pc')}
            >
              💻 Method 2 — With PC (iloader)
            </button>
            <button
              type="button"
              className={`tab-nav-btn ${iosTab === 'game' ? 'active' : ''}`}
              onClick={() => setIosTab('game')}
            >
              🎮 Install Game (.IPA)
            </button>
          </div>

          {/* TAB 1: Method 1 — No PC */}
          {iosTab === 'nopc' && (
            <div>
              <div className="sub-h">
                <span>{t.ios_nopc_h || 'Method 1 — No PC (iOS 27)'}</span>
                <span className="tag tag-green">Recommended</span>
              </div>
              <p style={{ color: 'var(--text-2)', marginBottom: '2rem', lineHeight: '1.7' }}>
                {t.ios_nopc_intro ||
                  'Uses SideInstaller. Fully on-device on iOS 27. On iOS 18–26 you still need a pairing file generated once on a PC. Keep LocalDevVPN connected for the entire process.'}
              </p>

              {/* Certificate Widget */}
              <div className="note-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <strong>Active Certificate (Oct 2026):</strong>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--orange)', marginTop: '0.3rem' }}>
                    China-Telecom-Corporation-Limited-XC-com-ctq-qmc-yiban-p
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Expires ~2029 · High stability</span>
                </div>
                <button
                  type="button"
                  className="copy-btn"
                  onClick={() => copyText('China-Telecom-Corporation-Limited-XC-com-ctq-qmc-yiban-p', 'Certificate Name')}
                >
                  Copy Cert Name
                </button>
              </div>

              <div className="steps">
                {/* Step 1 */}
                <div className="step">
                  <div className="step-num-wrap">
                    <div className="step-num">01</div>
                  </div>
                  <div className="step-body">
                    <h3>{t.ios_s1_title || 'Install LocalDevVPN'}</h3>
                    <p>
                      {t.ios_s1_desc ||
                        'Open App Store → search LocalDevVPN → install. Open the app and tap Connect. Keep the VPN on during the entire installation.'}
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="step">
                  <div className="step-num-wrap">
                    <div className="step-num">02</div>
                  </div>
                  <div className="step-body">
                    <h3>{t.ios_s2_title || 'Install SideInstaller (official only)'}</h3>
                    <p
                      dangerouslySetInnerHTML={{
                        __html:
                          t.ios_s2_desc ||
                          'Open <strong>Safari</strong> → go to frizzlem.github.io/SideInstaller. Install the DNS profile first, then pick a certificate and tap <strong>Install</strong>. Certificates get revoked often — try another if one fails.',
                      }}
                    />
                    <a
                      href="https://frizzlem.github.io/SideInstaller/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-arr"
                    >
                      frizzlem.github.io/SideInstaller
                    </a>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="step">
                  <div className="step-num-wrap">
                    <div className="step-num">03</div>
                  </div>
                  <div className="step-body">
                    <h3>{t.ios_s3_title || 'Install SideStore + LiveContainer'}</h3>
                    <p>
                      {t.ios_s3_desc ||
                        'Open SideInstaller → verify Tunnel connected (green) → sign in with Apple ID (burner recommended) → select LiveContainer + SideStore → choose Nightly → tap Install SS + LiveContainer.'}
                    </p>
                    <div className="step-note">
                      <strong>Pairing file on iOS 27:</strong> Leave "Import pairing file" empty and install directly.
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="step">
                  <div className="step-num-wrap">
                    <div className="step-num">04</div>
                  </div>
                  <div className="step-body">
                    <h3>{t.ios_s4_title || 'Trust Profiles & Enable Developer Mode'}</h3>
                    <div className="checklist">
                      <div className="check-item">
                        <span className="check-icon check-icon-ok">1</span>
                        <span>Settings → General → VPN & Device Management → find Enterprise Profile → Trust.</span>
                      </div>
                      <div className="check-item">
                        <span className="check-icon check-icon-ok">2</span>
                        <span>Settings → Privacy & Security → Developer Mode → On (phone restarts).</span>
                      </div>
                      <div className="check-item">
                        <span className="check-icon check-icon-ok">3</span>
                        <span>Open SideStore → Connect LocalDevVPN → Tap the 7 DAYS timer to perform manual refresh.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Pairing File Generator */}
          {iosTab === 'pair' && (
            <div>
              <div className="sub-h">
                <span>{t.ios_pair_h || 'Generate pairing file (iOS 18–26 · once on PC)'}</span>
                <span className="tag tag-orange">One-Time Setup</span>
              </div>
              <p style={{ color: 'var(--text-2)', marginBottom: '2rem', lineHeight: '1.7' }}>
                {t.ios_pair_intro ||
                  'Required only on iOS 18–26 if you use SideInstaller without a full PC install. On iOS 27 skip this. You only need a computer once; after that everything is on-device with LocalDevVPN.'}
              </p>

              <div className="steps">
                <div className="step">
                  <div className="step-num-wrap">
                    <div className="step-num">01</div>
                  </div>
                  <div className="step-body">
                    <h3>{t.ios_pair1_title || 'Windows only — Install iTunes'}</h3>
                    <p>
                      {t.ios_pair1_desc ||
                        'Install iTunes 64-bit from Apple (needed for USB drivers). Mac and Linux users do not need this.'}
                    </p>
                    <a
                      href="https://www.apple.com/itunes/download/win64"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-arr"
                    >
                      Download iTunes 64-bit
                    </a>
                  </div>
                </div>

                <div className="step">
                  <div className="step-num-wrap">
                    <div className="step-num">02</div>
                  </div>
                  <div className="step-body">
                    <h3>{t.ios_pair2_title || 'Connect iPhone + Trust'}</h3>
                    <p>
                      {t.ios_pair2_desc ||
                        'Unlock iPhone → connect via USB → tap Trust on the phone and enter passcode. Keep phone unlocked on the Home Screen.'}
                    </p>
                  </div>
                </div>

                <div className="step">
                  <div className="step-num-wrap">
                    <div className="step-num">03</div>
                  </div>
                  <div className="step-body">
                    <h3>{t.ios_pair3_title || 'Generate with iDevicePair'}</h3>
                    <p>
                      {t.ios_pair3_desc ||
                        'Open iDevicePair → select device → Generate. You will receive a .mobiledevicepairing file.'}
                    </p>
                    <a
                      href="https://docs.sidestore.io/docs/advanced/pairing-file"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-arr"
                    >
                      iDevicePair Official Docs
                    </a>
                  </div>
                </div>

                <div className="step">
                  <div className="step-num-wrap">
                    <div className="step-num">04</div>
                  </div>
                  <div className="step-body">
                    <h3>{t.ios_pair4_title || 'Transfer to iPhone + Import'}</h3>
                    <p>
                      {t.ios_pair4_desc ||
                        'Send file to iPhone via AirDrop/email. In SideInstaller, tap Import pairing file → select it, then continue.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Method 2 — With PC */}
          {iosTab === 'pc' && (
            <div>
              <div className="sub-h">
                <span>{t.ios_pc_h || 'Method 2 — With PC (iloader)'}</span>
                <span className="tag tag-orange">Computer Method</span>
              </div>
              <p style={{ color: 'var(--text-2)', marginBottom: '2rem', lineHeight: '1.7' }}>
                {t.ios_pc_intro ||
                  'Works on most iOS versions. You only need the computer for the first install. After that everything is on-device.'}
              </p>

              <div className="steps">
                <div className="step">
                  <div className="step-num-wrap">
                    <div className="step-num">01</div>
                  </div>
                  <div className="step-body">
                    <h3>{t.ios_pc1_title || 'Install LocalDevVPN + iloader'}</h3>
                    <p>
                      {t.ios_pc1_desc ||
                        'On iPhone: install LocalDevVPN from App Store and connect it. On computer: download iloader from official SideStore docs.'}
                    </p>
                  </div>
                </div>

                <div className="step">
                  <div className="step-num-wrap">
                    <div className="step-num">02</div>
                  </div>
                  <div className="step-body">
                    <h3>{t.ios_pc2_title || 'Connect & Install'}</h3>
                    <p>
                      {t.ios_pc2_desc ||
                        'Connect iPhone via USB → trust computer. Open iloader → sign in with Apple ID → select device → install LiveContainer + SideStore.'}
                    </p>
                  </div>
                </div>

                <div className="step">
                  <div className="step-num-wrap">
                    <div className="step-num">03</div>
                  </div>
                  <div className="step-body">
                    <h3>{t.ios_pc3_title || 'Trust + Developer Mode + Refresh'}</h3>
                    <p>
                      {t.ios_pc3_desc ||
                        'Trust enterprise profile in Settings → General → VPN & Device Management, enable Developer Mode, and perform manual refresh inside SideStore.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Install Game IPA */}
          {iosTab === 'game' && (
            <div>
              <div className="sub-h">
                <span>{t.ios_game_h || 'Install the game (.ipa)'}</span>
                <span className="tag tag-green">Bypass 3-App Limit</span>
              </div>
              <p style={{ color: 'var(--text-2)', marginBottom: '2rem', lineHeight: '1.7' }}>
                {t.ios_game_intro ||
                  'After SideStore + LiveContainer are working, install Naruto Blazing Rebirth as an IPA inside LiveContainer so it does NOT consume one of the 3 free app slots.'}
              </p>

              <div className="steps">
                <div className="step">
                  <div className="step-num-wrap">
                    <div className="step-num">01</div>
                  </div>
                  <div className="step-body">
                    <h3>{t.ios_g1_title || 'Get the IPA'}</h3>
                    <p>
                      {t.ios_g1_desc ||
                        'Download the official .ipa from Discord #downloads channel. Save to the Files app (On My iPhone).'}
                    </p>
                  </div>
                </div>

                <div className="step">
                  <div className="step-num-wrap">
                    <div className="step-num">02</div>
                  </div>
                  <div className="step-body">
                    <h3>{t.ios_g2_title || 'Install via LiveContainer (Recommended)'}</h3>
                    <p
                      dangerouslySetInnerHTML={{
                        __html:
                          t.ios_g2_desc ||
                          'Open <strong>LiveContainer</strong> → tap <strong>+</strong> → select .ipa from Files. Long press the app card → select Launch. It runs inside LiveContainer with unlimited slots.',
                      }}
                    />
                  </div>
                </div>

                <div className="step">
                  <div className="step-num-wrap">
                    <div className="step-num">03</div>
                  </div>
                  <div className="step-body">
                    <h3>{t.ios_g4_title || 'Weekly 7-Day Refresh'}</h3>
                    <p>
                      {t.ios_g4_desc ||
                        'Every 7 days the free Apple ID signature expires. Connect LocalDevVPN → open SideStore → tap 7 DAYS timer to refresh.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sideload knowledge cards */}
          <div className="cards">
            <div className="card">
              <div className="card-icon">📦</div>
              <h4>{t.ios_card1_title || 'Why LiveContainer?'}</h4>
              <p>
                {t.ios_card1_desc ||
                  'Free Apple ID allows only 3 sideloaded apps. LiveContainer runs apps internally so they do not count toward the limit.'}
              </p>
            </div>
            <div className="card">
              <div className="card-icon">⏱️</div>
              <h4>{t.ios_card2_title || '7-Day Refresh'}</h4>
              <p>
                {t.ios_card2_desc ||
                  'Apps expire every 7 days on free Apple IDs. Connect LocalDevVPN and tap the refresh button in SideStore.'}
              </p>
            </div>
            <div className="card">
              <div className="card-icon">🛡️</div>
              <h4>{t.ios_card3_title || 'Burner Apple ID'}</h4>
              <p>
                {t.ios_card3_desc ||
                  'Strongly recommended. If Apple locks the account during automated sideloading signing, your personal iCloud remains safe.'}
              </p>
            </div>
          </div>

          {/* Section Navigation */}
          <div className="section-nav">
            <button
              type="button"
              className="snav-btn back"
              onClick={() => scrollTo('#offline')}
            >
              <span className="snav-btn-icon">←</span>
              <span>Back to Offline Guide</span>
            </button>
            <button
              type="button"
              className="snav-btn next"
              onClick={() => scrollTo('#fixes')}
            >
              <span>Next: Troubleshooting Hub</span>
              <span className="snav-btn-icon">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 04: MEGA TROUBLESHOOTING & DEBUG HUB */}
      <section id="fixes" className="section section-alt">
        <div className="container">
          <div className="section-header-row">
            <div>
              <div className="section-tag">04 — DEBUG & FIXES</div>
              <h2 className="section-h2">{t.fix_title || 'Fixes & Troubleshooting'}</h2>
            </div>
            <p className="section-desc">
              {t.fix_sub || 'Most common issues, error codes, and verified solutions from community helpers'}
            </p>
          </div>

          {/* Real-Time Diagnostic Search & Filter */}
          <div className="troubleshoot-search-box">
            <div className="search-input-wrap">
              <span className="search-input-icon">🔍</span>
              <input
                type="text"
                placeholder="Search error, e.g. 'Play Protect', 'Private DNS', 'Pie64', 'Certificate', '201'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-tabs">
              <button
                type="button"
                className={`filter-tab ${faqCategory === 'all' ? 'active' : ''}`}
                onClick={() => setFaqCategory('all')}
              >
                All Issues ({allFaqs.length})
              </button>
              <button
                type="button"
                className={`filter-tab ${faqCategory === 'online' ? 'active' : ''}`}
                onClick={() => setFaqCategory('online')}
              >
                Online Errors
              </button>
              <button
                type="button"
                className={`filter-tab ${faqCategory === 'offline' ? 'active' : ''}`}
                onClick={() => setFaqCategory('offline')}
              >
                Offline Errors
              </button>
              <button
                type="button"
                className={`filter-tab ${faqCategory === 'ios' ? 'active' : ''}`}
                onClick={() => setFaqCategory('ios')}
              >
                iOS Sideloading
              </button>
              <button
                type="button"
                className={`filter-tab ${faqCategory === 'emu' ? 'active' : ''}`}
                onClick={() => setFaqCategory('emu')}
              >
                Emulator Bugs
              </button>
            </div>
          </div>

          {/* FAQ Accordion List */}
          <div className="faq">
            {filteredFaqs.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-2)' }}>
                No specific issue found for "{searchQuery}". Try joining Discord #help channel.
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isOpen = openFaqs[faq.id] || false
                return (
                  <div key={faq.id} className={`faq-item ${isOpen ? 'open' : ''}`}>
                    <button
                      type="button"
                      className="faq-q"
                      onClick={() => toggleFaq(faq.id)}
                      aria-expanded={isOpen}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span className={`interactive-badge ${faq.badgeClass}`} style={{ marginBottom: 0 }}>
                          {faq.tag}
                        </span>
                        <span>{faq.q}</span>
                      </div>
                      <svg
                        className="faq-q-icon"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                    <div className="faq-a">
                      <div className="faq-a-inner">
                        <p>{faq.a}</p>
                        {faq.tip && (
                          <div className="step-note" style={{ marginTop: '0.75rem' }}>
                            <strong>💡 Pro Tip:</strong> {faq.tip}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Section Navigation */}
          <div className="section-nav">
            <button
              type="button"
              className="snav-btn back"
              onClick={() => scrollTo('#ios')}
            >
              <span className="snav-btn-icon">←</span>
              <span>Back to iOS Guide</span>
            </button>
            <button
              type="button"
              className="snav-btn next"
              onClick={() => scrollTo('#notes')}
            >
              <span>Next: Important Notes</span>
              <span className="snav-btn-icon">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 05: IMPORTANT NOTES & ARCHITECTURE */}
      <section id="notes" className="section">
        <div className="container">
          <div className="section-header-row">
            <div>
              <div className="section-tag">05 — ESSENTIAL KNOWLEDGE</div>
              <h2 className="section-h2">{t.notes_title || 'Important notes'}</h2>
            </div>
            <p className="section-desc">
              {t.notes_sub || 'Emulator requirements, account persistence, and common mistakes to avoid'}
            </p>
          </div>

          <div className="cards cards-2">
            <div className="card">
              <span className="tag tag-red" style={{ marginBottom: '1rem', display: 'inline-block' }}>
                {t.note1_label || 'EMULATOR'}
              </span>
              <h4>{t.note1_title || 'Use Pie64 image'}</h4>
              <p>
                {t.note1_desc ||
                  'Many users from USA and Asia automatically get the Nougat image. Offline update then crashes. Always choose the Pie64 (Android 9 64-bit) system image when creating the emulator instance.'}
              </p>
            </div>

            <div className="card">
              <span className="tag tag-orange" style={{ marginBottom: '1rem', display: 'inline-block' }}>
                {t.note2_label || 'ACCOUNTS'}
              </span>
              <h4>{t.note2_title || 'Online ≠ Offline'}</h4>
              <p>
                {t.note2_desc ||
                  'They are completely separate applications with separate accounts. Progress never transfers. Online links via Discord (Others → Account). Offline is local only.'}
              </p>
            </div>

            <div className="card">
              <span className="tag tag-orange" style={{ marginBottom: '1rem', display: 'inline-block' }}>
                {t.note3_label || 'ONLINE'}
              </span>
              <h4>{t.note3_title || 'No Data Transfer'}</h4>
              <p>
                {t.note3_desc ||
                  'The old Data Transfer code does not work for Online. You must link the account from inside the game: Others → Account → Discord.'}
              </p>
            </div>

            <div className="card">
              <span className="tag tag-red" style={{ marginBottom: '1rem', display: 'inline-block' }}>
                {t.note4_label || 'OFFLINE'}
              </span>
              <h4>{t.note4_title || 'Local data only'}</h4>
              <p>
                {t.note4_desc ||
                  'Everything is stored on the phone/emulator. Uninstalling the game or clearing data = permanent loss. There is no cloud backup.'}
              </p>
            </div>
          </div>

          {/* Online vs Offline Comparison Matrix */}
          <div className="matrix-table-wrap">
            <table className="matrix-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Online Mode</th>
                  <th>Offline Mode</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Account Storage</strong></td>
                  <td><span className="matrix-tag matrix-tag-green">Cloud · Discord OAuth</span></td>
                  <td><span className="matrix-tag matrix-tag-orange">Device Local Storage Only</span></td>
                </tr>
                <tr>
                  <td><strong>Banner Progression</strong></td>
                  <td>Chronological (starts 2016 One Tail)</td>
                  <td>All Banners Unlocked Instantly</td>
                </tr>
                <tr>
                  <td><strong>Starting Pearls</strong></td>
                  <td>Standard fresh account</td>
                  <td>1,000 Free Ninja Pearls</td>
                </tr>
                <tr>
                  <td><strong>Internet Connection</strong></td>
                  <td>Required (Live Server)</td>
                  <td>Required only for setup & updates</td>
                </tr>
                <tr>
                  <td><strong>Multiplayer / Co-op</strong></td>
                  <td><span className="matrix-tag matrix-tag-green">Available</span></td>
                  <td>Solo play</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section Navigation */}
          <div className="section-nav">
            <button
              type="button"
              className="snav-btn back"
              onClick={() => scrollTo('#fixes')}
            >
              <span className="snav-btn-icon">←</span>
              <span>Back to Fixes</span>
            </button>
            <button
              type="button"
              className="snav-btn next"
              onClick={() => scrollTo('#links')}
            >
              <span>Next: Official Links</span>
              <span className="snav-btn-icon">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 06: OFFICIAL LINKS */}
      <section id="links" className="section section-alt">
        <div className="container">
          <div className="section-header-row">
            <div>
              <div className="section-tag">06 — OFFICIAL CHANNELS</div>
              <h2 className="section-h2">{t.links_title || 'Official links'}</h2>
            </div>
            <p className="section-desc">
              {t.links_sub || 'Verified community sources and safe download repositories only'}
            </p>
          </div>

          <div className="links-grid">
            <a
              href="https://www.blazingonline.wiki/"
              target="_blank"
              rel="noopener noreferrer"
              className="link-card"
            >
              <div className="link-card-ico">🌐</div>
              <div className="link-card-info">
                <h3>{t.link_site || 'Official Site'}</h3>
                <p>blazingonline.wiki — News, updates & character database</p>
              </div>
              <span className="link-card-arr">→</span>
            </a>

            <a
              href="https://www.blazingonline.wiki/download"
              target="_blank"
              rel="noopener noreferrer"
              className="link-card"
            >
              <div className="link-card-ico">⬇️</div>
              <div className="link-card-info">
                <h3>{t.link_apk || 'Download APK (Online)'}</h3>
                <p>{t.link_apk_sub || 'Only from here'} — Safe & verified checksums</p>
              </div>
              <span className="link-card-arr">→</span>
            </a>

            <a
              href="https://discord.gg/blazingrebirth"
              target="_blank"
              rel="noopener noreferrer"
              className="link-card"
            >
              <div className="link-card-ico">💬</div>
              <div className="link-card-info">
                <h3>Discord Community Server</h3>
                <p>{t.link_discord_sub || '#downloads channel for Offline and IPA files'}</p>
              </div>
              <span className="link-card-arr">→</span>
            </a>

            <a
              href="https://sideinstaller.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="link-card"
            >
              <div className="link-card-ico">📱</div>
              <div className="link-card-info">
                <h3>{t.link_sideinstaller || 'SideInstaller (Official)'}</h3>
                <p>sideinstaller.net — iOS Sideloading (No PC on iOS 27)</p>
              </div>
              <span className="link-card-arr">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <a
              href="#hero"
              className="logo"
              onClick={(e) => {
                e.preventDefault()
                scrollTo('#hero')
              }}
            >
              BLAZING<em>REBIRTH</em>
            </a>
            <p
              className="footer-note"
              dangerouslySetInnerHTML={{
                __html:
                  t.footer_note ||
                  'Unofficial guide made by a community helper.<br />Not affiliated with the official project team or Bandai Namco.',
              }}
            />
            <p
              className="footer-credit"
              dangerouslySetInnerHTML={{
                __html:
                  t.footer_credit ||
                  'Site designed & built by <a href="https://github.com/txrrot" target="_blank" rel="noopener noreferrer">TXRROT</a>',
              }}
            />
          </div>

          <div className="footer-meta">
            <p>{t.footer_update || 'Last update: October 2026'}</p>
            <p>{t.footer_free || 'Fan-made project · Free'}</p>
            <p style={{ color: 'var(--orange)', fontWeight: 600 }}>Revival Community 2026</p>
          </div>
        </div>
      </footer>

      {/* FLOATING ACTION DOCK */}
      <div className="floating-dock">
        <button
          type="button"
          className="dock-btn"
          title="Back to Top"
          onClick={() => scrollTo('#hero')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
      </div>

      {/* FLOATING QUICK DOCK BAR */}
      <div className={`floating-bar ${isScrolled ? 'visible' : ''}`}>
        <a href="#online" onClick={(e) => { e.preventDefault(); scrollTo('#online') }}>Online</a>
        <a href="#offline" onClick={(e) => { e.preventDefault(); scrollTo('#offline') }}>Offline</a>
        <a href="#ios" onClick={(e) => { e.preventDefault(); scrollTo('#ios') }}>iOS</a>
        <a href="#fixes" onClick={(e) => { e.preventDefault(); scrollTo('#fixes') }}>Fixes</a>
        <a href="#notes" onClick={(e) => { e.preventDefault(); scrollTo('#notes') }}>Notes</a>
        <a href="#links" onClick={(e) => { e.preventDefault(); scrollTo('#links') }}>Links</a>
      </div>
    </>
  )
}
