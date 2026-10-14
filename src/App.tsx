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
  Lock,
  Cpu,
} from 'lucide-react'
import { translations, type Lang } from './data/translations'
import heroArt from './assets/blazing_hero_banner.jpg'
import txrrotAvatar from './assets/txrrotdm.webp'

// --- SHA-256 HASH FOR OWNER PIN (1741) ---
const ADMIN_PIN_HASH = '1828526428f17576e6581a0b9c893ecf79c1fdc20f495f0bdc98b559b25b92a6'

async function sha256Hex(str: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export interface DownloadsConfig {
  version: string
  lastUpdated: string
  onlineApkUrl: string
  offlineLauncherArmUrl: string
  offlineLauncherX86Url: string
  iosGameIpaUrl: string
  iosOnlineIpaUrl: string
  iosSideStoreIpaUrl: string
  sideloadlyWinUrl: string
  sideloadlyMacUrl: string
  sideloadlyLinuxUrl: string
  officialSiteUrl: string
  discordServerUrl: string
}

const DEFAULT_DOWNLOADS: DownloadsConfig = {
  version: '1.0.0',
  lastUpdated: '2026-10-14',
  onlineApkUrl: 'https://discord.gg/blazingrebirth',
  offlineLauncherArmUrl: 'https://discord.gg/blazingrebirth',
  offlineLauncherX86Url: 'https://discord.gg/blazingrebirth',
  iosGameIpaUrl: 'https://drive.google.com/file/d/14AbuUR1d8WdwdvJkuLTROsYySsOteYdz/view?usp=sharing',
  iosOnlineIpaUrl: '',
  iosSideStoreIpaUrl: 'https://github.com/SideStore/SideStore/releases/download/nightly/SideStore.ipa',
  sideloadlyWinUrl: 'https://sideloadly.io/#download',
  sideloadlyMacUrl: 'https://sideloadly.io/#download',
  sideloadlyLinuxUrl: 'https://sideloadly.io/#download',
  officialSiteUrl: 'https://blazingonline.wiki',
  discordServerUrl: 'https://discord.gg/blazingrebirth',
}

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
  { id: 'notes', num: '01', label: 'NOTES', icon: BookOpen },
  { id: 'online', num: '02', label: 'ONLINE', icon: Wifi },
  { id: 'offline', num: '03', label: 'OFFLINE', icon: HardDrive },
  { id: 'ios', num: '04', label: 'IOS', icon: Apple },
  { id: 'emulator', num: '05', label: 'EMULATOR', icon: Monitor },
  { id: 'fixes', num: '06', label: 'FIXES', icon: Wrench },
  { id: 'links', num: '07', label: 'LINKS', icon: ExternalLink },
  { id: 'updates', num: '08', label: 'UPDATE', icon: RefreshCw },
]

export default function App() {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('blazing-lang') as Lang) || 'en'
  })
  const [langOpen, setLangOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activePlatform, setActivePlatform] = useState<'all' | 'android' | 'ios' | 'pc'>('all')
  const [iosTab, setIosTab] = useState<'nopc' | 'pair' | 'pc' | 'game'>('nopc')
  const [pcOs, setPcOs] = useState<'windows' | 'mac' | 'linux'>('windows')
  const [faqCategory, setFaqCategory] = useState<'all' | 'online' | 'offline' | 'ios' | 'emu'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [openFaqs, setOpenFaqs] = useState<Record<string, boolean>>({
    on1: true,
    on_stuck: true,
    on_vpn_first_time: true,
    off1: true,
    off_stuck: true,
    off_android12_crash: true,
    ios1: true,
    ios_err80045: true,
  })
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [activeChapter, setActiveChapter] = useState('online')
  const [isScrolled, setIsScrolled] = useState(false)

  // Dynamic Downloads State
  const [downloads, setDownloads] = useState<DownloadsConfig>(DEFAULT_DOWNLOADS)
  const [isAdminOpen, setIsAdminOpen] = useState(false)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => {
    return sessionStorage.getItem('txrrot_auth') === '1'
  })
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const [ghToken, setGhToken] = useState(() => {
    return localStorage.getItem('txrrot_gh_pat') || ''
  })
  const [adminForm, setAdminForm] = useState<DownloadsConfig>(DEFAULT_DOWNLOADS)
  const [adminSaving, setAdminSaving] = useState(false)
  const [adminStatus, setAdminStatus] = useState<{ type: 'success' | 'error' | 'info' | 'loading'; msg: string } | null>(null)

  // Footer tap counter for 10 taps trigger
  const footerTapCountRef = useRef(0)
  const lastFooterTapTimeRef = useRef(0)

  const handleFooterTap = () => {
    const now = Date.now()
    if (now - lastFooterTapTimeRef.current > 3000) {
      footerTapCountRef.current = 1
    } else {
      footerTapCountRef.current += 1
      if (footerTapCountRef.current >= 10) {
        footerTapCountRef.current = 0
        setIsAdminOpen(true)
        if (navigator.vibrate) {
          navigator.vibrate([60, 40, 100])
        }
      }
    }
    lastFooterTapTimeRef.current = now
  }

  // Fetch downloads.json dynamically on load
  useEffect(() => {
    fetch('./downloads.json?t=' + Date.now())
      .then((res) => {
        if (res.ok) return res.json()
        throw new Error('Not found')
      })
      .then((data: Partial<DownloadsConfig>) => {
        if (data && data.onlineApkUrl) {
          setDownloads((prev) => {
            const merged = { ...prev, ...data }
            setAdminForm(merged)
            return merged
          })
        }
      })
      .catch(() => {})
  }, [])

  // Listen for #admin in URL
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin') {
        setIsAdminOpen(true)
      }
    }
    checkHash()
    window.addEventListener('hashchange', checkHash)
    return () => window.removeEventListener('hashchange', checkHash)
  }, [])

  const handlePinSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setPinError('')
    try {
      const hash = await sha256Hex(pinInput.trim())
      if (hash === ADMIN_PIN_HASH) {
        setIsAdminUnlocked(true)
        sessionStorage.setItem('txrrot_auth', '1')
        setPinInput('')
      } else {
        setPinError('PIN incorect!')
      }
    } catch {
      setPinError('Eroare de verificare')
    }
  }

  const handleSaveToGitHub = async () => {
    if (!ghToken.trim()) {
      setAdminStatus({ type: 'error', msg: 'Introdu un GitHub Personal Access Token pentru a salva.' })
      return
    }
    setAdminSaving(true)
    setAdminStatus({ type: 'loading', msg: 'Se publică modificările pe GitHub...' })

    try {
      localStorage.setItem('txrrot_gh_pat', ghToken.trim())
      const repo = 'txrrot/BlazingOnlineRebirth'
      const filePath = 'public/downloads.json'
      const url = `https://api.github.com/repos/${repo}/contents/${filePath}`

      // 1. Get current SHA
      let sha: string | undefined
      const getRes = await fetch(url, {
        headers: {
          Authorization: `Bearer ${ghToken.trim()}`,
          Accept: 'application/vnd.github.v3+json',
        },
      })
      if (getRes.ok) {
        const getData = await getRes.json()
        sha = getData.sha
      }

      // 2. Prepare payload
      const updatedData: DownloadsConfig = {
        ...adminForm,
        lastUpdated: new Date().toISOString().split('T')[0],
      }
      const jsonContent = JSON.stringify(updatedData, null, 2)
      const encoded = btoa(unescape(encodeURIComponent(jsonContent)))

      // 3. Commit PUT
      const putRes = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${ghToken.trim()}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `admin: update download links (${new Date().toLocaleDateString()})`,
          content: encoded,
          ...(sha ? { sha } : {}),
        }),
      })

      if (!putRes.ok) {
        const err = await putRes.json()
        throw new Error(err.message || 'GitHub commit failed')
      }

      setDownloads(updatedData)
      setAdminForm(updatedData)
      setAdminStatus({ type: 'success', msg: '✅ Modificările au fost publicate cu succes pe GitHub!' })
      showToast('Linkurile au fost actualizate!')
    } catch (err: any) {
      setAdminStatus({ type: 'error', msg: `Eroare: ${err.message || 'Nu s-a putut salva'}` })
    } finally {
      setAdminSaving(false)
    }
  }

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
    const runScroll = () => {
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

    const immediateEl = document.querySelector(target)
    if (immediateEl) {
      runScroll()
    } else {
      setTimeout(runScroll, 80)
    }
  }

  // Smooth switch to iOS Game tab and scroll cleanly to Step 1 & download cards
  const goToIosGameInstall = () => {
    setIosTab('game')
    setTimeout(() => {
      scrollTo('#iosgameinstall')
    }, 70)
  }

  // On mount: if URL has a hash, scroll to that section after lenis is ready
  useEffect(() => {
    const hash = window.location.hash
    if (hash === '#iosgameinstall') {
      setIosTab('game')
    }
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
      tip: 'Google Play Protect flags custom fan builds by default. It is 100% safe to proceed.',
    },
    {
      id: 'on_stuck',
      cat: 'online',
      tag: 'Loading / Conn Error',
      q: t.faq_on_stuck_q || 'Stuck on Loading Screen or Connection Error (2 Guaranteed Solutions)',
      a:
        t.faq_on_stuck_a ||
        'If one solution does not work, the other works 100%:<br /><br /><strong>Solution 1 (Change DNS):</strong> Set Primary DNS to <code>8.8.8.8</code> and Secondary DNS to <code>8.8.4.4</code> in your Wi-Fi network settings (Google Public DNS).<br /><br /><strong>Solution 2 (Free VPN — First Time Fix):</strong> Download a free VPN (e.g. ProtonVPN, Windscribe, TunnelBear) and connect to <strong>Netherlands</strong>, <strong>USA</strong>, or <strong>Japan</strong>.<br /><em>Crucial Note:</em> You only need the VPN the <strong>first time</strong> to get past this error! Once you enter the game with the VPN, you should be able to enter without VPN next times.',
      tip:
        t.faq_on_stuck_tip ||
        'If DNS change does not resolve it on your provider, connecting to Netherlands, USA, or Japan VPN bypasses the block 100%. After reaching the game menu, you can play without VPN on future launches.',
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
      a: t.faq_off3_a || 'Delete the APK and redownload using the direct download link. Incomplete downloads are common on mobile browsers.',
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
      id: 'off_stuck',
      cat: 'offline',
      tag: 'Update Stuck / Freeze',
      q: t.faq_off_stuck_q || 'Offline update stuck, fails to download, or freezes in Launcher',
      a:
        t.faq_off_stuck_a ||
        'If the offline update refuses to download or gets stuck:<br />1. Open the <strong>Launcher</strong>.<br />2. Go to the <strong>Diagnostics</strong> menu (or look for the <strong>Stop Game Session</strong> button).<br />3. Tap <strong>Stop Game Session</strong>.<br />4. Completely close / force close the launcher from your recent apps.<br />5. Reopen the launcher and run the update again. It will now download and install smoothly!',
      tip:
        t.faq_off_stuck_tip ||
        'An active background session lock prevents patch files from being written. Stopping the session and restarting the launcher clears the lock immediately.',
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
      a: t.faq_ios4_a || 'Wait 15–30 minutes or use a different, older Apple ID. Very new accounts are often rate limited by Apple servers.',
      tip: 'Creating an Apple ID on the web and waiting 1 hour before first sideload helps.',
    },
    {
      id: 'ios_err80045',
      cat: 'ios',
      tag: 'Apple Error 80045 / 37%',
      q: t.faq_ios_err80045_q || 'Error 80045 on Sign-in or SideInstaller stuck at 37% loading',
      a:
        t.faq_ios_err80045_a ||
        'Apple developer authentication servers frequently experience login outages. SideInstaller hangs at 37% loading or SideStore throws instant Error 80045 when signing in.<br /><br /><strong>Alternative Workaround (Method 2 — PC Sideloadly):</strong> If you have a computer, install SideStore or the game directly from PC with Sideloadly! It bypasses SideInstaller completely and succeeds even when Apple mobile servers fail.<br /><em>Key Difference:</em> PC installs require connecting to the PC to refresh every 6–7 days, whereas on-device SideStore refreshes in 1 second with a single tap.',
      tip: t.faq_ios_err80045_tip || 'If you do not have a PC, try again later when Apple resolves server-side authentication.',
    },
    {
      id: 'ios_pwd_change',
      cat: 'ios',
      tag: 'Wrong Password / Account',
      q: t.faq_ios_pwd_q || "SideInstaller says 'Account is invalid' / Wrong password error",
      a:
        t.faq_ios_pwd_a ||
        'If SideInstaller reports that your account is invalid, your Apple ID password was typed incorrectly or requires refreshing:<br />1. On iPhone: Go to Settings → [Apple ID Name] → Sign-In & Security → Change Password.<br />2. Open SideInstaller → tap the Settings (gear) icon at top-right.<br />3. At the very top, tap Add Apple ID.<br />4. Enter the same account with the new password.<br />5. Return to the main screen and proceed with installation!',
      tip: t.faq_ios_pwd_tip || 'Changing the password directly in iPhone settings refreshes your Apple developer token.',
    },
    {
      id: 'off_android12_crash',
      cat: 'offline',
      tag: 'Android 12+ Crash',
      q: t.faq_off_android12_q || "Offline Launcher crashes at 100% on Beta Update or 'Fix' button (Android 12, 13, 14+)",
      a:
        t.faq_off_android12_a ||
        'On Android 12+ (Android 12, 13, 14, 15), elevated system security blocks the legacy launcher from invoking the native APK package installer, causing an immediate crash after downloading the Beta update or game data.<br /><br /><strong>The 100% Proven Fix: Virtual Master + Shizuku (Android 9 VM)</strong><br />1. Install Shizuku from Google Play Store.<br />2. Follow Shizuku instructions (Wireless Debugging in Developer Options) until it shows \'Shizuku is running\'.<br />3. Install Virtual Master.<br />4. Inside Virtual Master, download the Android 9 environment.<br />5. Boot the Android 9 VM. (After first startup, you can even stop Shizuku!)<br />6. Inside the Android 9 VM, install the Sage Launcher ARM APK.<br />7. Now, when you switch to Beta and tap Check for updates → Update now, the system install dialog appears instantly without crashing! The same applies to tapping Fix to install game data.',
      tip: t.faq_off_android12_tip || 'Virtual Master creates the exact Android 9 (Pie) runtime required by the Sage Launcher.',
    },
    {
      id: 'on_vpn_first_time',
      cat: 'online',
      tag: 'Connection Error (VPN)',
      q: t.faq_on_vpn_first_q || 'Connection Error on Online launch or after game update (Android & iOS)',
      a:
        t.faq_on_vpn_first_a ||
        'After updating the game or on first launch, a Connection Error may pop up due to carrier routing blocks to the private server.<br /><br /><strong>100% Guaranteed Fix with Free VPN (e.g. Proton VPN):</strong><br />1. Download a free VPN such as Proton VPN (Play Store / App Store).<br />2. Connect to servers in this order: Europe / Netherlands (EU) → USA → Japan.<br />3. Launch the game with the VPN on until you reach the main menu.<br />4. Exit the game, disconnect the VPN, and reopen the game. It will now work completely WITHOUT VPN on future sessions! The VPN is only needed for the initial post-update handshake.',
      tip: t.faq_on_vpn_first_tip || 'Only the initial handshake requires the VPN; future launches run on your normal internet.',
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
            <a href="#notes" className="nav-link-item" onClick={() => scrollTo('#notes')}>
              {t.nav_notes || 'Notes'}
            </a>
            <a href="#online" className="nav-link-item" onClick={() => scrollTo('#online')}>
              {t.nav_online || 'Online'}
            </a>
            <a href="#offline" className="nav-link-item" onClick={() => scrollTo('#offline')}>
              {t.nav_offline || 'Offline'}
            </a>
            <a href="#ios" className="nav-link-item" onClick={() => scrollTo('#ios')}>
              {t.nav_ios || 'iOS'}
            </a>
            <a href="#emulator" className="nav-link-item" onClick={() => scrollTo('#emulator')}>
              Emulator
            </a>
            <a href="#fixes" className="nav-link-item" onClick={() => scrollTo('#fixes')}>
              {t.nav_fixes || 'Fixes'}
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
          <a href="#notes" onClick={() => scrollTo('#notes')}>
            01. {t.nav_notes || 'Notes'}
          </a>
          <a href="#online" onClick={() => scrollTo('#online')}>
            02. {t.nav_online || 'Online'}
          </a>
          <a href="#offline" onClick={() => scrollTo('#offline')}>
            03. {t.nav_offline || 'Offline'}
          </a>
          <a href="#ios" onClick={() => scrollTo('#ios')}>
            04. {t.nav_ios || 'iOS'}
          </a>
          <a href="#emulator" onClick={() => scrollTo('#emulator')}>
            05. Emulator
          </a>
          <a href="#fixes" onClick={() => scrollTo('#fixes')}>
            06. {t.nav_fixes || 'Fixes'}
          </a>
          <a href="#links" onClick={() => scrollTo('#links')}>
            07. Links
          </a>
          <a href="#updates" onClick={() => scrollTo('#updates')}>
            08. {t.upd_title || 'Updates'}
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
              <span>{t.hero_badge || 'COMPLETE GUIDE by TXRROT · FAN-MADE REBIRTH 2026'}</span>
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
                scrollTo('#emulator')
              }}
            >
              <Monitor size={14} />
              <span>PC Emulator (BlueStacks)</span>
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
              <span>OFFICIAL 2026 REBIRTH ARCHIVE</span>
            </div>
          </div>

          {/* Story Chapter Navigation Jump Strip */}
          <div className="story-chapter-strip">
            <button type="button" className="chapter-jump-btn" onClick={() => scrollTo('#notes')}>
              <BookOpen size={13} />
              <span>01 Notes</span>
            </button>
            <button type="button" className="chapter-jump-btn" onClick={() => scrollTo('#online')}>
              <Zap size={13} />
              <span>02 Online</span>
            </button>
            <button type="button" className="chapter-jump-btn" onClick={() => scrollTo('#offline')}>
              <Flame size={13} />
              <span>03 Offline</span>
            </button>
            <button type="button" className="chapter-jump-btn" onClick={() => scrollTo('#ios')}>
              <Apple size={13} />
              <span>04 iOS Sideload</span>
            </button>
            <button type="button" className="chapter-jump-btn" onClick={() => scrollTo('#emulator')}>
              <Monitor size={13} />
              <span>05 PC Emulator</span>
            </button>
            <button type="button" className="chapter-jump-btn" onClick={() => scrollTo('#fixes')}>
              <Wrench size={13} />
              <span>06 Fixes &amp; Debug</span>
            </button>
            <button type="button" className="chapter-jump-btn" onClick={() => scrollTo('#links')}>
              <ExternalLink size={13} />
              <span>07 Verified Links</span>
            </button>
            <button type="button" className="chapter-jump-btn" onClick={() => scrollTo('#updates')}>
              <RefreshCw size={13} />
              <span>08 How to Update</span>
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
          CHAPTER 01: IMPORTANT NOTES (Stealth Kurogane Archival Atmosphere)
          ========================================================================= */}
      <section id="notes" className="story-section section-notes">
        <div className="section-atmosphere-glow" />
        <div className="story-section-container">
          <div className="section-header-block">
            <div className="chapter-meta-tag">
              <BookOpen size={14} />
              <span>CHAPTER 01 // ARCHIVE SCROLLS</span>
            </div>
            <h2 className="section-headline">{t.notes_title || 'Important Notes'}</h2>
            <FormattedText
              text={t.notes_sub || 'Read before you start · Emulator tips · Account rules · Common mistakes'}
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
          CHAPTER 02: ONLINE MODE (Neon Chakra Blue Luminescence Atmosphere)
          ========================================================================= */}
      <section id="online" className="story-section section-online">
        <div className="section-atmosphere-glow" />
        <div className="story-section-container">
          <div className="section-header-block">
            <div className="chapter-meta-tag">
              <Zap size={14} />
              <span>CHAPTER 02 // LIVE SERVERS</span>
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
            <div className="platform-compat-badges">
              <span className="compat-badge android"><Smartphone size={12} /> Android</span>
              <span className="compat-badge emulator"><Monitor size={12} /> PC Emulator</span>
              <button
                type="button"
                className="compat-badge ios"
                onClick={() => scrollTo('#ios')}
                style={{
                  cursor: 'pointer',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontFamily: 'inherit',
                }}
              >
                <Apple size={12} />
                <span>{t.on_badge_ios || 'iOS (IPA Sideload Supported) ↓'}</span>
              </button>
            </div>

            {/* iOS User Quick-Jump Banner Up Top */}
            <div style={{
              marginTop: '1.25rem',
              padding: '0.9rem 1.25rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 280px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Apple size={20} style={{ color: '#38bdf8' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#38bdf8' }}>
                    {t.online_ios_banner_title || 'Playing Online on iPhone / iPad (iOS)?'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: 1.4 }}>
                    {t.online_ios_banner_desc || 'The steps below are exclusively for Android (APK). For iOS Online and Offline installation via Sideload, visit our complete iOS Guide in Chapter 04.'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="cta-button-primary"
                onClick={() => scrollTo('#ios')}
                style={{
                  padding: '0.5rem 1.2rem',
                  fontSize: '0.825rem',
                  background: 'linear-gradient(135deg, #0284c7, #6366f1)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  flexShrink: 0,
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
                }}
              >
                <Apple size={14} />
                <span>{t.online_ios_banner_btn || 'Go to iOS Section →'}</span>
              </button>
            </div>
          </div>

          {/* Timeline Steps Stack (Android Only) */}
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
                    'From the direct download button below (Google Drive). If the download does not finish 100%, switch browser (Chrome to Firefox or vice versa) and try again.'
                  }
                  as="p"
                />
                <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <a
                    href={downloads.onlineApkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-button-primary"
                    style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                  >
                    <Download size={14} />
                    <span>Download Online APK (Android)</span>
                    <ArrowUpRight size={14} />
                  </a>
                </div>
                <div className="step-callout-note" style={{ marginTop: '0.85rem' }}>
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
                  <strong>Play Protect Warning:</strong> Unsigned fan builds trigger a red warning: ALWAYS tap <strong>More info</strong> → <strong>Install anyway</strong>.
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
                <div className="step-callout-note" style={{ marginTop: '0.85rem' }}>
                  <Wifi size={14} style={{ display: 'inline', marginRight: '0.4rem', color: 'var(--accent-blue)' }} />
                  <FormattedText
                    text={
                      t.upd_on_stuck_tip ||
                      '<strong>Stuck on loading or Connection Error?</strong> Two 100% fixes: <strong>1)</strong> Set DNS to Primary <code>8.8.8.8</code> and Secondary <code>8.8.4.4</code>. <strong>2)</strong> Or use a free VPN connected to <em>Netherlands, USA, or Japan</em>. Once you enter the game with the VPN the first time, you will be able to launch without VPN in all future sessions!'
                    }
                  />
                </div>
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
              <span>{t.nav_continue_offline || 'Continue to Chapter 03: Offline Mode →'}</span>
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              className="cta-button-glass"
              onClick={() => scrollTo('#updates')}
              style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem' }}
            >
              <span>{t.nav_continue_updates || 'See Chapter 08: How to Update →'}</span>
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
              <span>CHAPTER 03 // SAGE ARCHIVE</span>
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
            <div className="platform-compat-badges">
              <span className="compat-badge android"><Smartphone size={12} /> {t.off_badge_android || 'Android & PC Emulators (APK)'}</span>
              <button
                type="button"
                className="compat-badge ios"
                onClick={() => scrollTo('#ios')}
                style={{
                  cursor: 'pointer',
                  border: '1px solid rgba(168, 85, 247, 0.45)',
                  background: 'rgba(168, 85, 247, 0.15)',
                  color: '#c084fc',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontFamily: 'inherit',
                }}
              >
                <Apple size={12} />
                <span>{t.off_badge_ios_jump || 'iOS (iPhone/iPad)? Offline Guide is in Ch. 04 below ↓'}</span>
              </button>
            </div>
          </div>

          {/* Storage Warning Note */}
          <div className="warning-strip-card" style={{ marginBottom: '1.75rem' }}>
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

          {/* iOS Users Alert / Redirect Banner */}
          <div
            className="warning-strip-card"
            style={{
              marginBottom: '2.5rem',
              borderColor: 'rgba(168, 85, 247, 0.45)',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.14) 0%, rgba(20, 20, 32, 0.9) 100%)',
            }}
          >
            <div className="warning-icon-wrapper" style={{ color: '#c084fc' }}>
              <Apple size={26} />
            </div>
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <h4 style={{ color: '#e9d5ff', fontWeight: 700, fontSize: '0.975rem', margin: 0 }}>
                  {t.off_ios_redirect_title || 'Are you on iPhone / iPad? The iOS Offline Guide is further down!'}
                </h4>
                <span
                  style={{
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#c084fc',
                    background: 'rgba(168, 85, 247, 0.22)',
                    border: '1px solid rgba(168, 85, 247, 0.4)',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '4px',
                    fontWeight: 700,
                  }}
                >
                  iOS = Chapter 04
                </span>
              </div>
              <FormattedText
                text={
                  t.off_ios_redirect_desc ||
                  '<strong>Do NOT download the APK above if you are on iOS.</strong> The steps in Chapter 03 are strictly for Android phones and PC Emulators. For iPhone and iPad, the game uses an <strong>.ipa</strong> package sideloaded via SideStore. Scroll down to <strong>Chapter 04: iOS Sideloading</strong> for the dedicated step-by-step guide.'
                }
                as="p"
                style={{ fontSize: '0.85rem', lineHeight: 1.55, color: 'var(--text-secondary)' }}
              />
              <div style={{ marginTop: '0.85rem' }}>
                <button
                  type="button"
                  className="cta-button-primary"
                  onClick={() => scrollTo('#ios')}
                  style={{
                    padding: '0.55rem 1.25rem',
                    fontSize: '0.825rem',
                    background: 'linear-gradient(135deg, #9333ea, #6366f1)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(147, 51, 234, 0.35)',
                  }}
                >
                  <Apple size={15} />
                  <span>{t.off_ios_redirect_btn || 'Jump to Chapter 04: iOS Offline Guide ↓'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
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
                    'Download using the direct buttons below (Google Drive):<br />• <strong>ARM</strong> → real Android phone<br />• <strong>x86_x64</strong> → emulator'
                  }
                  as="p"
                />
                <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <a
                    href={downloads.offlineLauncherArmUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-button-primary"
                    style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                  >
                    <Smartphone size={14} />
                    <span>Download ARM (Real Phone)</span>
                    <ArrowUpRight size={14} />
                  </a>
                  <a
                    href={downloads.offlineLauncherX86Url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-button-glass"
                    style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                  >
                    <Monitor size={14} />
                    <span>Download x86 (Emulator)</span>
                    <ArrowUpRight size={14} />
                  </a>
                </div>
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

            {/* Android 12+ Crash Alert & Solution Link */}
            <div
              className="warning-strip-card"
              style={{
                marginTop: '1.25rem',
                borderColor: 'rgba(239, 68, 68, 0.45)',
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(20, 20, 30, 0.85) 100%)',
              }}
            >
              <div className="warning-icon-wrapper" style={{ color: '#ef4444' }}>
                <AlertTriangle size={24} />
              </div>
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <h4 style={{ color: '#fca5a5', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>
                    {t.off_android12_warn_title || 'Crash on Update or "Fix" on Android 12, 13, or 14+?'}
                  </h4>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#ef4444',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      fontWeight: 700,
                    }}
                  >
                    Android 12+ Security
                  </span>
                </div>
                <FormattedText
                  text={
                    t.off_android12_warn_desc ||
                    'If the launcher force-closes immediately after downloading the Beta update instead of opening the APK installer, Android 12+ security is blocking it. The 100% working fix is running the launcher inside <strong>Virtual Master + Shizuku (Android 9 VM)</strong>.'
                  }
                  as="p"
                  style={{ fontSize: '0.85rem', lineHeight: 1.55, color: 'var(--text-secondary)' }}
                />
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="action-tag-btn"
                    onClick={() => {
                      setFaqCategory('offline');
                      setOpenFaqs((prev) => ({ ...prev, off_android12_crash: true }));
                      scrollTo('#fixes');
                    }}
                    style={{
                      padding: '0.45rem 1rem',
                      fontSize: '0.8rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      cursor: 'pointer',
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#fca5a5',
                      border: '1px solid rgba(239, 68, 68, 0.45)',
                    }}
                  >
                    <Wrench size={13} />
                    <span>{t.off_android12_warn_btn || 'See Virtual Master + Shizuku Step-by-Step Guide in Ch. 06 →'}</span>
                  </button>
                </div>
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
              <span>{t.nav_continue_ios || 'Continue to Chapter 04: iOS Sideloading →'}</span>
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              className="cta-button-glass"
              onClick={() => scrollTo('#updates')}
              style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem' }}
            >
              <span>{t.nav_continue_updates || 'See Chapter 08: How to Update →'}</span>
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
              <span>CHAPTER 04 // THE IOS GATE</span>
            </div>
            <h2 className="section-headline">{t.ios_title || 'iOS Sideloading'}</h2>
            <FormattedText
              text={
                t.ios_sub ||
                'SideStore · Direct IPA Installation · No PC required on iOS 27'
              }
              as="p"
              className="section-subhead"
            />
            <div className="platform-compat-badges">
              <span className="compat-badge ios"><Apple size={12} /> {t.ios_compat_badge || 'iOS — Offline Game & Online (IPA Sideload)'}</span>
              <button
                type="button"
                className="compat-badge no-android"
                onClick={() => scrollTo('#offline')}
                style={{
                  cursor: 'pointer',
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                  color: '#f87171',
                  background: 'rgba(239, 68, 68, 0.08)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontFamily: 'inherit',
                }}
              >
                <span>✕ Android / PC Emulator: See Chapter 03 above ↑</span>
              </button>
            </div>
          </div>

          {/* Malware Warning Note */}
          <div className="warning-strip-card" style={{ marginBottom: '2.5rem' }}>
            <div className="warning-icon-wrapper" style={{ color: 'var(--accent-violet)' }}>
              <ShieldAlert size={22} />
            </div>
            <div>
              <FormattedText
                text={
                  t.ios_warning ||
                  '<strong>Important:</strong> Use only official sources. The site <em>sideinstaller.com</em> is <strong>fake / malware</strong>. Official sources:'
                }
                as="p"
              />
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <a
                  href="https://sideinstaller.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta-button-glass"
                  style={{ padding: '0.3rem 0.8rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <ExternalLink size={12} />
                  <span>sideinstaller.net</span>
                </a>
                <a
                  href="https://frizzlem.github.io/SideInstaller"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta-button-glass"
                  style={{ padding: '0.3rem 0.8rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <ExternalLink size={12} />
                  <span>frizzlem.github.io/SideInstaller</span>
                </a>
              </div>
            </div>
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

          {/* Sideloading Truth: Myths vs Reality & Apple ID Safety */}
          <div
            className="warning-strip-card"
            style={{
              marginBottom: '2rem',
              borderColor: 'rgba(99, 102, 241, 0.4)',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(20, 20, 30, 0.8) 100%)',
            }}
          >
            <div className="warning-icon-wrapper" style={{ color: 'var(--accent-indigo, #818cf8)' }}>
              <ShieldCheck size={26} />
            </div>
            <div style={{ width: '100%' }}>
              <h4 style={{ color: '#a5b4fc', fontWeight: 700, marginBottom: '0.6rem', fontSize: '1rem' }}>
                {t.ios_myths_title || 'Sideloading Truth: Myths vs Reality & Apple ID Safety'}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    {t.ios_myth1_q || 'Myth 1: "Does Sideloading mean Jailbreak?"'}
                  </div>
                  <FormattedText
                    text={
                      t.ios_myth1_a ||
                      '<strong>FALSE.</strong> Jailbreaking alters the iOS kernel and strips Apple security protections, which voids warranty and disables Apple Pay and banking apps. Sideloading via SideStore uses Apple official Personal Developer Provisioning Profiles. Your iOS system is 100% untouched, secure, and banking apps work without issues.'
                    }
                    as="p"
                    style={{ fontSize: '0.8rem', lineHeight: 1.55, color: 'var(--text-secondary)' }}
                  />
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    {t.ios_myth2_q || 'Myth 2: "Will Apple ban my Apple ID or brick my iPhone?"'}
                  </div>
                  <FormattedText
                    text={
                      t.ios_myth2_a ||
                      '<strong>FALSE.</strong> Apple has never locked or banned user Apple IDs, iCloud accounts, or iPhones for personal sideloading. Sideloading is a built-in feature of the iOS developer ecosystem.'
                    }
                    as="p"
                    style={{ fontSize: '0.8rem', lineHeight: 1.55, color: 'var(--text-secondary)' }}
                  />
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', gridColumn: '1 / -1' }}>
                  <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    {t.ios_myth3_q || 'What are the real Apple ID limits & safety?'}
                  </div>
                  <FormattedText
                    text={
                      t.ios_myth3_a ||
                      'Free Apple IDs have an official quota of up to 3 active sideloaded apps at a time. The only theoretical restriction from Apple is a temporary 7-day cooldown on generating new free certificates if someone abuses automated bulk signing (signing 10–50+ apps per week — chance <0.1%). Even in that extreme case, only SideStore would need reinstalling after the cooldown; your Apple ID, purchases, and iCloud are never touched. For Naruto Blazing Rebirth (just 1 app alongside SideStore), the risk is virtually <strong>zero (<0.01%)</strong>. Using your main Apple ID is totally safe; a secondary account is purely optional if you already have an unused spare.'
                    }
                    as="p"
                    style={{ fontSize: '0.8rem', lineHeight: 1.55, color: 'var(--text-secondary)' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2-Stage Flow Explainer Banner */}
          <div
            className="warning-strip-card"
            style={{
              marginBottom: '2rem',
              borderColor: 'rgba(99, 102, 241, 0.4)',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(20, 20, 35, 0.85) 100%)',
            }}
          >
            <div className="warning-icon-wrapper" style={{ color: '#818cf8' }}>
              <BookOpen size={24} />
            </div>
            <div style={{ width: '100%' }}>
              <h4 style={{ color: '#c7d2fe', fontWeight: 700, marginBottom: '0.4rem', fontSize: '0.975rem' }}>
                {t.ios_flow_guide_title || 'How iOS Offline Installation Works (2 Simple Stages)'}
              </h4>
              <FormattedText
                text={
                  t.ios_flow_guide_desc ||
                  '<strong>Stage 1 (Install Sideload Store):</strong> Install SideStore on your iPhone using <strong>Method 1 (No PC)</strong> or <strong>Method 2 (PC Sideloadly)</strong> below.<br /><strong>Stage 2 (Install the Game):</strong> Switch to the <strong>"Install Game (.ipa)"</strong> tab above or below to download the Naruto Blazing Rebirth IPA and install it inside SideStore.'
                }
                as="p"
                style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}
              />
              <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="cta-button-glass"
                  onClick={() => setIosTab('nopc')}
                  style={{
                    padding: '0.4rem 0.9rem',
                    fontSize: '0.78rem',
                    background: iosTab === 'nopc' ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)',
                    border: iosTab === 'nopc' ? '1px solid rgba(255,255,255,0.3)' : undefined,
                  }}
                >
                  <span>1. Method 1 (No PC)</span>
                </button>
                <button
                  type="button"
                  className="cta-button-glass"
                  onClick={() => setIosTab('pair')}
                  style={{
                    padding: '0.4rem 0.9rem',
                    fontSize: '0.78rem',
                    background: iosTab === 'pair' ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)',
                    border: iosTab === 'pair' ? '1px solid rgba(255,255,255,0.3)' : undefined,
                  }}
                >
                  <span>2. Method 2 (PC)</span>
                </button>
                <button
                  type="button"
                  className="cta-button-primary"
                  onClick={() => goToIosGameInstall()}
                  style={{ padding: '0.4rem 0.9rem', fontSize: '0.78rem', background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
                >
                  <Download size={13} />
                  <span>3. Install Game (.ipa) Tab</span>
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
              onClick={() => goToIosGameInstall()}
            >
              <Download size={15} />
              <span>{t.ios_game_h || 'Install Game (.ipa) — Online & Offline'}</span>
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
                style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}
              />

              {/* Apple Server 80045 & 37% Stuck Outage Warning Banner */}
              <div
                className="warning-strip-card"
                style={{
                  marginBottom: '2rem',
                  borderColor: 'rgba(239, 68, 68, 0.45)',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(20, 20, 30, 0.85) 100%)',
                }}
              >
                <div className="warning-icon-wrapper" style={{ color: '#ef4444' }}>
                  <AlertTriangle size={24} />
                </div>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <h4 style={{ color: '#fca5a5', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>
                      {t.ios_server_err_banner_title || 'ALERT: Temporary Apple Server Outage (Error 80045 / Stuck at 37%)'}
                    </h4>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#ef4444',
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        fontWeight: 700,
                      }}
                    >
                      Apple Servers
                    </span>
                  </div>
                  <FormattedText
                    text={
                      t.ios_server_err_banner_desc ||
                      'Apple developer authentication servers are experiencing intermittent outages. If SideInstaller hangs at 37% or SideStore throws instant <strong>Error 80045</strong>, use <strong>Method 2 (PC with Sideloadly)</strong>. On PC it installs 100% reliably; the only difference is requiring a manual PC refresh every 6–7 days (compared to 1 second on phone).'
                    }
                    as="p"
                    style={{ fontSize: '0.85rem', lineHeight: 1.55, color: 'var(--text-secondary)' }}
                  />
                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="cta-button-glass"
                      onClick={() => setIosTab('pc')}
                      style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
                    >
                      <Monitor size={14} />
                      <span>Switch to Method 2 (PC Sideloadly) →</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="steps-timeline-stack">
                {/* Step 01 */}
                <div className="step-card">
                  <div className="step-card-num">
                    <div className="step-num-badge">01</div>
                  </div>
                  <div className="step-card-body">
                    <h3>{t.ios_s1_title || 'Install & Connect LocalDevVPN'}</h3>
                    <FormattedText
                      text={
                        t.ios_s1_desc ||
                        'Open App Store → search LocalDevVPN → install. Open the app and tap Connect. Keep the VPN on during the entire installation and weekly refreshes.'
                      }
                      as="p"
                    />
                  </div>
                </div>

                {/* Step 02 */}
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

                {/* Step 03 - Trust Certificate in Settings (Must be done before opening SideInstaller) */}
                <div className="step-card">
                  <div className="step-card-num">
                    <div className="step-num-badge">03</div>
                  </div>
                  <div className="step-card-body">
                    <h3>{t.ios_s3_title || 'Trust Enterprise Certificate in Settings'}</h3>
                    <FormattedText
                      text={
                        t.ios_s3_desc ||
                        'Before opening SideInstaller, iOS requires authorization:<br />1. Open <strong>Settings → General → VPN & Device Management</strong>.<br />2. Under <em>Enterprise App</em>, tap the company name from the working certificate you installed.<br />3. Tap <strong>Trust</strong>, then tap <strong>Allow & Restart</strong> (or Trust again).<br />Now SideInstaller is authorized and can be opened from your Home Screen!'
                      }
                      as="p"
                    />
                  </div>
                </div>

                {/* Step 04 - Developer Mode & 100% SUCCESS DEBUGGING */}
                <div className="step-card">
                  <div className="step-card-num">
                    <div className="step-num-badge">04</div>
                  </div>
                  <div className="step-card-body">
                    <h3>{t.ios_s4_title || 'Developer Mode & Missing Fix'}</h3>
                    <FormattedText
                      text={
                        t.ios_s4_desc ||
                        'To run sideloaded developer apps on iOS 16+, Apple requires Developer Mode.<br />1. Open <strong>Settings → Privacy & Security</strong>.<br />2. Scroll to the bottom and tap <strong>Developer Mode</strong> → toggle <strong>ON</strong>.<br />3. Restart your iPhone when prompted, then confirm with your passcode.'
                      }
                      as="p"
                    />

                    {/* Developer Mode Timing Clarification */}
                    <div className="step-callout-note" style={{ marginTop: '0.75rem', borderColor: 'rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.08)' }}>
                      <AlertTriangle size={14} style={{ display: 'inline', marginRight: '0.4rem', color: '#fbbf24' }} />
                      <FormattedText
                        text={
                          t.ios_devmode_timing_note ||
                          '<strong>IMPORTANT:</strong> <em>Developer Mode</em> will NOT appear in iPhone Settings until you install and try to open SideInstaller for the first time! First install and trust the certificate, tap SideInstaller to open it (iOS will show Developer Mode required), and only then will the option show in <em>Settings → Privacy & Security</em>.'
                        }
                      />
                    </div>

                    <div className="step-callout-note" style={{ marginTop: '0.75rem', borderColor: 'rgba(59, 130, 246, 0.4)' }}>
                      <FormattedText
                        text={
                          t.ios_s4_reassurance ||
                          '<strong>Security Dialog Note:</strong> Apple displays scary red warning buttons and "Untrusted Developer" alerts by default for all sideloaded apps. This is standard iOS security behavior and 100% safe for SideStore.'
                        }
                        as="div"
                      />
                    </div>

                    {/* PROMINENT 100% SUCCESS DEBUGGING BOX FOR MISSING DEVELOPER MODE */}
                    <div
                      className="debugging-callout-card"
                      style={{
                        marginTop: '1.25rem',
                        padding: '1.25rem 1.4rem',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(16, 185, 129, 0.05) 100%)',
                        border: '1px solid rgba(245, 158, 11, 0.4)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            background: 'rgba(245, 158, 11, 0.2)',
                            color: '#fbbf24',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <Check size={12} />
                          <span>100% SUCCESS SOLUTION</span>
                        </span>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#fbbf24', fontWeight: 700 }}>
                          {t.ios_s4_debug_title || 'CRITICAL FIX: "Install stopped — Pair this iPhone" & Developer Mode Missing'}
                        </h4>
                      </div>
                      <FormattedText
                        text={
                          t.ios_s4_debug_desc ||
                          '<strong>Most common error:</strong> You open SideInstaller, tap Install, and a pop-up appears: <em>"Install stopped: Pair this iPhone in Settings"</em> telling you to go to Settings → Privacy & Security → Developer Mode, but Developer Mode <strong>is completely missing from Settings</strong> (even on iOS 16/17/18/27)!<br /><br /><strong>The 100% Proven Solution: Reinstall with another certificate!</strong><br />1. <strong>Delete SideInstaller</strong> from your iPhone Home Screen.<br />2. Open Safari on <code>sideinstaller.net</code> and install a <strong>different available certificate</strong> from the list.<br />3. Go to <em>Settings → General → VPN & Device Management</em> and tap <strong>Trust</strong> on the new certificate.<br />4. Now check <em>Settings → Privacy & Security</em>: <strong>Developer Mode has appeared!</strong><br />5. Toggle Developer Mode ON, restart your iPhone, confirm with passcode, and proceed with installation!'
                        }
                        as="div"
                        style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Step 05 - Download & Import SideStore.ipa (404 Error Fix) */}
                <div className="step-card" id="ios-s5">
                  <div className="step-card-num">
                    <div className="step-num-badge">05</div>
                  </div>
                  <div className="step-card-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <h3 style={{ margin: 0 }}>{t.ios_s5_title || 'Download & Import SideStore.ipa'}</h3>
                      <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', borderRadius: '4px', fontWeight: 600 }}>
                        {t.ios_s3_404_badge || '404 Error Fix'}
                      </span>
                    </div>

                    <div className="step-callout-note danger" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                      <FormattedText
                        text={
                          t.ios_s5_404_note ||
                          '<strong>Why 404 occurs:</strong> The automated download in SideInstaller fails because the built-in repository is offline. Downloading standalone SideStore.ipa manually completely bypasses the 404 error!'
                        }
                        as="div"
                      />
                    </div>

                    <FormattedText
                      text={
                        t.ios_s5_desc ||
                        '1. Tap either download link below in Safari and save <strong>SideStore.ipa</strong> to the <strong>Files</strong> app.<br />2. Open <strong>SideInstaller</strong> (ensure <strong>Tunnel connected</strong> is green).<br />3. Sign in with your Apple ID (using your main account is completely safe; or a spare secondary account if you have one).<br />4. Tap <strong>Import IPA</strong> (or "Install from file") and select the SideStore.ipa you downloaded.<br />5. <em>iOS 27:</em> leave pairing file empty → tap Install.<br />• <em>iOS 18–26:</em> tap Import Pairing File first → select your pairing file → tap Install.<br />6. Wait until SideStore finishes installing onto your Home Screen.'
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

                    {/* Wrong Password / Invalid Account Tip */}
                    <div className="step-callout-note warning" style={{ marginTop: '1rem', borderColor: 'rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.08)' }}>
                      <Key size={14} style={{ display: 'inline', marginRight: '0.4rem', color: 'var(--accent-amber)' }} />
                      <FormattedText
                        text={
                          t.ios_pwd_reset_tip ||
                          '<strong>"Invalid Account" or wrong password?</strong> Change password in <em>Settings → Apple ID → Sign-In & Security → Change Password</em>, then in SideInstaller tap the gear icon (top-right) → <em>Add Apple ID</em> and enter your account with the new password.'
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Step 06 - Trust Personal Profile & Clean Up */}
                <div className="step-card">
                  <div className="step-card-num">
                    <div className="step-num-badge">06</div>
                  </div>
                  <div className="step-card-body">
                    <h3>{t.ios_s6_title || 'Trust Personal Profile & Clean Up'}</h3>
                    <FormattedText
                      text={
                        t.ios_s6_desc ||
                        '1. Open <strong>Settings → General → VPN & Device Management</strong> → tap your personal Apple ID developer profile → tap <strong>Trust</strong>.<br />2. Remove the temporary SideInstaller DNS profile.<br />3. Keep LocalDevVPN installed — you need it connected when refreshing SideStore weekly.'
                      }
                      as="p"
                    />
                    <div style={{ marginTop: '1rem' }}>
                      <button
                        type="button"
                        className="cta-button-primary"
                        onClick={() => goToIosGameInstall()}
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
                  <span>{t.nav_back_to_nopc || '← Back to No-PC Guide (Step 05)'}</span>
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
              {/* Intro */}
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Works on <strong>any iOS version</strong>. Perfect when Apple servers are down (Error 80045) — Sideloadly bypasses SideInstaller completely. PC needed only for first install and every 6–7 day refresh.
              </p>

              {/* SideStore Reminder Banner */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.08) 100%)',
                border: '1px solid rgba(99,102,241,0.35)',
                borderRadius: '10px',
                padding: '0.9rem 1.1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
              }}>
                <Smartphone size={18} style={{ color: '#818cf8', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ fontWeight: 700, color: '#818cf8', marginBottom: '0.25rem', fontSize: '0.88rem' }}>
                    💡 Reminder: Install SideStore when servers recover
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    Once Apple servers are back up, install <strong>SideStore</strong> on your iPhone using <strong>Method 1 (No-PC)</strong> or re-sideload it via Sideloadly. With SideStore you can refresh the 7-day certificate with <strong>1 tap in 1 second</strong> — no PC needed every week!
                    <br /><em>⚠️ Offline users: If you reinstall the game through SideStore, you may lose your save data. <strong>Export your save slot first!</strong></em>
                  </p>
                </div>
              </div>

              {/* OS Selector */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                      {(['windows', 'mac', 'linux'] as const).map((os) => (
                        <button
                          key={os}
                          type="button"
                          onClick={() => setPcOs(os)}
                          style={{
                            padding: '0.4rem 1rem',
                            fontSize: '0.8rem',
                            borderRadius: '8px',
                            border: pcOs === os ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.12)',
                            background: pcOs === os ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
                            color: pcOs === os ? '#a5b4fc' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontWeight: pcOs === os ? 700 : 400,
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                          }}
                        >
                          {os === 'windows' && <Monitor size={13} />}
                          {os === 'mac' && <Apple size={13} />}
                          {os === 'linux' && <Cpu size={13} />}
                          {os.charAt(0).toUpperCase() + os.slice(1)}
                        </button>
                      ))}
                    </div>

                    {/* Download Sideloadly */}
                    <div className="steps-timeline-stack">
                      <div className="step-card">
                        <div className="step-card-num"><div className="step-num-badge">01</div></div>
                        <div className="step-card-body">
                          <h3>Download &amp; Install Sideloadly</h3>
                          {pcOs === 'windows' && (
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                              Download <strong>Sideloadly for Windows</strong> (.exe installer). Requires <strong>iTunes</strong> from Apple (not the Microsoft Store version) + <strong>iCloud for Windows</strong>. Install all three, then launch Sideloadly.
                            </p>
                          )}
                          {pcOs === 'mac' && (
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                              Download <strong>Sideloadly for macOS</strong> (.dmg). Drag to Applications. macOS already has the required Apple frameworks built in — no extras needed.
                            </p>
                          )}
                          {pcOs === 'linux' && (
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                              Download <strong>Sideloadly for Linux</strong> (.deb / AppImage). Requires <strong>usbmuxd</strong> and <strong>libimobiledevice</strong>. Install them via: <code style={{ background: 'rgba(255,255,255,0.08)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.8rem' }}>sudo apt install usbmuxd libimobiledevice-utils</code>
                            </p>
                          )}
                          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                            <a
                              href={pcOs === 'windows' ? (downloads.sideloadlyWinUrl || 'https://sideloadly.io/#download') : pcOs === 'mac' ? (downloads.sideloadlyMacUrl || 'https://sideloadly.io/#download') : (downloads.sideloadlyLinuxUrl || 'https://sideloadly.io/#download')}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="cta-button-primary"
                              style={{ padding: '0.5rem 1.1rem', fontSize: '0.8rem', display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}
                            >
                              <Download size={13} />
                              <span>Download Sideloadly ({pcOs.charAt(0).toUpperCase() + pcOs.slice(1)})</span>
                              <ExternalLink size={13} />
                            </a>
                            {pcOs === 'windows' && (
                              <a href="https://www.apple.com/itunes/download/win64" target="_blank" rel="noopener noreferrer" className="cta-button-glass" style={{ padding: '0.5rem 1rem', fontSize: '0.78rem', display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                                <Download size={12} /><span>iTunes (Apple, not MS Store)</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="step-card">
                        <div className="step-card-num"><div className="step-num-badge">02</div></div>
                        <div className="step-card-body">
                          <h3>Download the IPA file(s)</h3>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                            Download the IPA(s) you want to install on your PC. You can install <strong>SideStore</strong> (for future on-device management), the <strong>Game IPA</strong> (Online or Offline), or both.
                          </p>
                          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                            <a href={downloads.iosSideStoreIpaUrl} target="_blank" rel="noopener noreferrer" className="cta-button-glass" style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                              <Download size={12} /><span>SideStore .ipa</span>
                            </a>
                            {downloads.iosOnlineIpaUrl ? (
                              <a href={downloads.iosOnlineIpaUrl} target="_blank" rel="noopener noreferrer" className="cta-button-glass" style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', display: 'inline-flex', gap: '0.4rem', alignItems: 'center', borderColor: 'rgba(56,189,248,0.4)', color: '#38bdf8' }}>
                                <Wifi size={12} /><span>Online Game .ipa</span>
                              </a>
                            ) : (
                              <a href={downloads.discordServerUrl} target="_blank" rel="noopener noreferrer" className="cta-button-glass" style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                                <Wifi size={12} /><span>Online IPA → Discord</span>
                              </a>
                            )}
                            <a href={downloads.iosGameIpaUrl} target="_blank" rel="noopener noreferrer" className="cta-button-glass" style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', display: 'inline-flex', gap: '0.4rem', alignItems: 'center', borderColor: 'rgba(168,85,247,0.4)', color: '#c084fc' }}>
                              <HardDrive size={12} /><span>Offline Game .ipa</span>
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="step-card">
                        <div className="step-card-num"><div className="step-num-badge">03</div></div>
                        <div className="step-card-body">
                          <h3>Connect iPhone via USB</h3>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                            {pcOs === 'windows' && <>Plug iPhone into PC with USB cable. <strong>Unlock your iPhone</strong> and tap <strong>"Trust This Computer"</strong> if prompted. Open iTunes once to confirm it detects your device.</>}
                            {pcOs === 'mac' && <>Plug iPhone into Mac with USB cable. <strong>Unlock your iPhone</strong> and tap <strong>"Trust This Computer"</strong> if prompted. Open Finder → your iPhone should appear in the sidebar.</>}
                            {pcOs === 'linux' && <>Plug iPhone into PC with USB. Run <code style={{ background: 'rgba(255,255,255,0.08)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>ideviceinfo</code> to confirm detection. Trust the computer on iPhone when prompted.</>}
                          </p>
                        </div>
                      </div>

                      <div className="step-card">
                        <div className="step-card-num"><div className="step-num-badge">04</div></div>
                        <div className="step-card-body">
                          <h3>Sideload with Sideloadly</h3>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                            1. Open <strong>Sideloadly</strong>.<br />
                            2. Your iPhone should appear automatically in the device list at the top.<br />
                            3. <strong>Sign in with your Apple ID</strong> (bottom-left field). Use a free Apple ID — no developer account needed.<br />
                            4. Drag and drop the <strong>.ipa file</strong> into the IPA field (or click the IPA icon to browse).<br />
                            5. Click <strong>Start</strong>. Sideloadly will sign and install the app on your iPhone.<br />
                            6. If prompted for a <strong>2FA code</strong>, enter it (check your iPhone for the notification).
                          </p>
                          {pcOs === 'windows' && (
                            <div className="step-callout-note" style={{ marginTop: '0.75rem' }}>
                              <AlertTriangle size={13} style={{ display: 'inline', marginRight: '0.35rem', color: '#fbbf24' }} />
                              <strong>Windows note:</strong> If Sideloadly cannot detect your iPhone, make sure iTunes is the Apple version (not from Microsoft Store) and restart both Sideloadly and iTunes.
                            </div>
                          )}
                          {pcOs === 'linux' && (
                            <div className="step-callout-note" style={{ marginTop: '0.75rem' }}>
                              <AlertTriangle size={13} style={{ display: 'inline', marginRight: '0.35rem', color: '#fbbf24' }} />
                              <strong>Linux note:</strong> Run Sideloadly as root or add your user to the <code>plugdev</code> group. Ensure <code>usbmuxd</code> is running: <code>sudo systemctl start usbmuxd</code>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="step-card">
                        <div className="step-card-num"><div className="step-num-badge">05</div></div>
                        <div className="step-card-body">
                          <h3>Trust the Profile on iPhone</h3>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                            After installation, go to <strong>Settings → General → VPN &amp; Device Management</strong> → tap your Apple ID email under "Developer App" → tap <strong>Trust</strong> → confirm. Now open the app from your Home Screen!
                          </p>
                        </div>
                      </div>

                      <div className="step-card">
                        <div className="step-card-num"><div className="step-num-badge">06</div></div>
                        <div className="step-card-body">
                          <h3>7-Day Refresh (PC Required)</h3>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                            Free Apple developer certificates last <strong>7 days</strong>. To refresh: reconnect iPhone to PC → open Sideloadly → sign in → drag the same .ipa → click Start again (it reinstalls over itself, no data loss for Online). 
                          </p>
                          <div className="step-callout-note warning" style={{ marginTop: '0.75rem', borderColor: 'rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.08)' }}>
                            <AlertTriangle size={13} style={{ display: 'inline', marginRight: '0.35rem', color: '#f87171' }} />
                            <strong>Offline players:</strong> Re-sideloading may overwrite or reset your Offline game save data. <strong>Export your save slot before refreshing!</strong> Open the Offline launcher → find the save export option before reconnecting to PC.
                          </div>
                          <div style={{ marginTop: '0.75rem', padding: '0.7rem 1rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            <Smartphone size={13} style={{ display: 'inline', marginRight: '0.4rem', color: '#818cf8' }} />
                            <strong style={{ color: '#a5b4fc' }}>Tip:</strong> Install <strong>SideStore</strong> on your iPhone when Apple servers recover — then you can refresh with 1 tap in 1 second, no PC needed weekly!
                          </div>
                        </div>
                      </div>
                    </div>

              {/* Navigation Buttons */}
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
                  onClick={() => goToIosGameInstall()}
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
              id="iosgameinstall"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{ scrollMarginTop: '80px' }}
            >
              {/* Online vs Offline selector cards */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
                {/* Online card */}
                <div style={{
                  flex: '1 1 220px',
                  background: 'linear-gradient(135deg, rgba(56,189,248,0.12) 0%, rgba(99,102,241,0.08) 100%)',
                  border: '1px solid rgba(56,189,248,0.35)',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Wifi size={16} style={{ color: '#38bdf8' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#38bdf8' }}>
                      {t.on_badge_ios ? t.on_badge_ios.replace(' ↓','') : 'Online Mode'}
                    </span>
                    <span style={{ fontSize: '0.65rem', background: 'rgba(56,189,248,0.2)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.4)', borderRadius: '4px', padding: '0.1rem 0.4rem', fontWeight: 700, letterSpacing: '0.04em' }}>
                      {t.badge_recommended || 'RECOMMENDED'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    {t.ios_card_online_desc || 'Live multiplayer · Discord account · Active servers. Download the Online IPA below.'}
                  </p>
                  <div style={{ marginTop: '0.75rem' }}>
                    {downloads.iosOnlineIpaUrl ? (
                      <a
                        href={downloads.iosOnlineIpaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cta-button-glass"
                        style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderColor: 'rgba(56,189,248,0.4)', color: '#38bdf8' }}
                      >
                        <Wifi size={13} />
                        <span>Download Online .ipa</span>
                        <ArrowUpRight size={13} />
                      </a>
                    ) : (
                      <a
                        href={downloads.discordServerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cta-button-glass"
                        style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <Wifi size={13} />
                        <span>Online IPA → Discord</span>
                        <ArrowUpRight size={13} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Offline card */}
                <div style={{
                  flex: '1 1 220px',
                  background: 'linear-gradient(135deg, rgba(168,85,247,0.10) 0%, rgba(236,72,153,0.06) 100%)',
                  border: '1px solid rgba(168,85,247,0.30)',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <HardDrive size={16} style={{ color: '#c084fc' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#c084fc' }}>
                      Offline Mode
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    {t.ios_card_offline_desc || 'Full single-player game with no internet required. Separate game installer (launcher → update).'}
                  </p>
                  <div style={{ marginTop: '0.75rem' }}>
                    <a
                      href={downloads.iosGameIpaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cta-button-glass"
                      style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderColor: 'rgba(168,85,247,0.4)', color: '#c084fc' }}
                    >
                      <HardDrive size={13} />
                      <span>Download Offline .ipa</span>
                      <ArrowUpRight size={13} />
                    </a>
                  </div>
                </div>
              </div>

              <FormattedText
                text={
                  t.ios_game_intro ||
                  'After SideStore is installed on your phone, install Naruto Blazing Rebirth directly as an IPA package via SideStore. The steps below apply to both Online and Offline — just choose the right .ipa above.'
                }
                as="p"
                style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}
              />

              <div className="steps-timeline-stack">
                <div className="step-card">
                  <div className="step-card-num">
                    <div className="step-num-badge">01</div>
                  </div>
                  <div className="step-card-body">
                    <h3>{t.ios_g1_title || 'Download the IPA (Online or Offline)'}</h3>
                    <FormattedText
                      text={
                        t.ios_g1_desc ||
                        'Choose your mode above and download the corresponding <strong>.ipa</strong> file. Save it to the <strong>Files app</strong> (On My iPhone / iCloud Drive). Both files install the same way via SideStore.'
                      }
                      as="p"
                    />
                    <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {downloads.iosOnlineIpaUrl ? (
                        <a
                          href={downloads.iosOnlineIpaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cta-button-glass"
                          style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem', borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}
                        >
                          <Wifi size={14} />
                          <span>Download Online .ipa</span>
                          <ArrowUpRight size={14} />
                        </a>
                      ) : (
                        <a
                          href={downloads.discordServerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cta-button-glass"
                          style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                        >
                          <Wifi size={14} />
                          <span>Online IPA → Discord</span>
                          <ArrowUpRight size={14} />
                        </a>
                      )}
                      <a
                        href={downloads.iosGameIpaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cta-button-glass"
                        style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem', borderColor: 'rgba(168,85,247,0.4)', color: '#c084fc' }}
                      >
                        <HardDrive size={14} />
                        <span>Download Offline .ipa</span>
                        <ArrowUpRight size={14} />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="step-card">
                  <div className="step-card-num">
                    <div className="step-num-badge">02</div>
                  </div>
                  <div className="step-card-body">
                    <h3>{t.ios_g2_title || 'Import & Install in SideStore'}</h3>
                    <FormattedText
                      text={
                        t.ios_g2_desc ||
                        '1. Ensure <strong>LocalDevVPN</strong> is connected.<br />2. Open <strong>SideStore</strong> → go to the <strong>My Apps</strong> tab.<br />3. Tap the <strong>+</strong> (plus) button at top left.<br />4. Select <code>Naruto Blazing Rebirth.ipa</code> from the Files app.<br />5. When prompted, tap <strong>Keep App Extensions (Use Main Profile)</strong>.<br />6. Wait for the signing and installation to complete.'
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
                    <h3>{t.ios_g3_title || 'Launch & Play'}</h3>
                    <FormattedText
                      text={
                        t.ios_g3_desc ||
                        'The Naruto Blazing Rebirth icon will appear on your Home Screen! Tap it to play. (If an Untrusted Developer prompt appears, confirm it in Settings → General → VPN & Device Management).'
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
                    <h3>{t.ios_g4_title || 'Weekly 7-Day Refresh'}</h3>
                    <FormattedText
                      text={
                        t.ios_g4_desc ||
                        'Free Apple developer certificates last 7 days. Whenever the countdown is low: connect LocalDevVPN → open SideStore → tap the <strong>7 DAYS</strong> timer next to Naruto Blazing Rebirth to reset the countdown. SideStore also refreshes automatically in the background when connected to Wi-Fi with LocalDevVPN.'
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
                <ShieldCheck size={20} />
              </div>
              <h4>{t.ios_card1_title || '100% Safe (Not Jailbreak)'}</h4>
              <FormattedText
                text={
                  t.ios_card1_desc ||
                  'Sideloading uses Apple native Developer Provisioning. No jailbreak, no system modification, no warranty loss. Apple Pay & banking apps work 100% normally.'
                }
                as="p"
              />
            </div>

            <div className="feature-info-card">
              <div className="feature-icon-box">
                <RefreshCw size={20} />
              </div>
              <h4>{t.ios_card2_title || '7-Day Refresh'}</h4>
              <FormattedText
                text={
                  t.ios_card2_desc ||
                  'Apps expire every 7 days on a free Apple ID. Connect LocalDevVPN and refresh inside SideStore.'
                }
                as="p"
              />
            </div>

          </div>

          {/* Chapter 04 Navigation Jump Cluster */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="cta-button-primary"
              onClick={() => scrollTo('#emulator')}
              style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem' }}
            >
              <span>{t.nav_continue_emu || 'Continue to Chapter 05: PC Emulator Guide →'}</span>
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              className="cta-button-glass"
              onClick={() => scrollTo('#updates')}
              style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem' }}
            >
              <span>{t.nav_continue_updates || 'See Chapter 08: How to Update →'}</span>
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CHAPTER 05: PC EMULATOR GUIDE — BlueStacks / LDPlayer / MuMu
          ========================================================================= */}
      <section id="emulator" className="story-section section-emulator">
        <div className="section-atmosphere-glow" />
        <div className="story-section-container">
          <div className="section-header-block">
            <div className="chapter-meta-tag">
              <Monitor size={14} />
              <span>CHAPTER 05 // DIGITAL ARENA</span>
            </div>
            <h2 className="section-headline">PC Emulator Guide</h2>
            <FormattedText
              text="Play Blazing Rebirth on PC using Android emulators · BlueStacks recommended · Pie64 (Android 9) required"
              as="p"
              className="section-subhead"
            />
            <div className="platform-compat-badges">
              <span className="compat-badge emulator"><Monitor size={12} /> Online (x86)</span>
              <span className="compat-badge android"><HardDrive size={12} /> Offline (x86)</span>
              <span className="compat-badge no-ios">✕ iOS Not Applicable</span>
            </div>
          </div>

          {/* Critical Pie64 Warning */}
          <div className="warning-strip-card" style={{ marginBottom: '2.5rem', borderColor: 'rgba(251,191,36,0.4)', background: 'linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(20,20,25,0.8) 100%)' }}>
            <div className="warning-icon-wrapper" style={{ color: 'var(--accent-amber)' }}>
              <AlertTriangle size={22} />
            </div>
            <FormattedText
              text="<strong>Mandatory:</strong> You MUST create a <strong>Pie64 (Android 9, 64-bit)</strong> instance. Nougat (Android 7) 32-bit instances will crash during the offline update. USA &amp; Asia regions default to Nougat — always manually select Pie64."
              as="p"
            />
          </div>

          {/* Emulator Step Cards */}
          <div className="steps-timeline-stack">
            {/* Step 01 */}
            <div className="step-card">
              <div className="step-card-num">
                <div className="step-num-badge">01</div>
              </div>
              <div className="step-card-body">
                <h3>Download BlueStacks 5</h3>
                <FormattedText
                  text="Download the installer from the official BlueStacks website. BlueStacks 5 is the recommended version — it supports Pie64 (Android 9) instances which are required for the game."
                  as="p"
                />
                <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <a
                    href="https://www.bluestacks.com/download.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-button-primary"
                    style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem' }}
                  >
                    <Download size={14} />
                    <span>Download BlueStacks 5</span>
                    <ArrowUpRight size={14} />
                  </a>
                </div>
                <div className="step-callout-note" style={{ marginTop: '0.85rem' }}>
                  <strong>Alternatives:</strong> LDPlayer 9 and MuMu Player 12 also work — just ensure you select the Android 9 (Pie64) image when creating your instance.
                </div>
              </div>
            </div>

            {/* Step 02 */}
            <div className="step-card">
              <div className="step-card-num">
                <div className="step-num-badge">02</div>
              </div>
              <div className="step-card-body">
                <h3>Create a Pie64 Instance</h3>
                <FormattedText
                  text="Open BlueStacks → click the <strong>Multi-Instance Manager</strong> (top toolbar or tray icon) → click <strong>New Instance</strong> → select <strong>Pie64 (Android 9, 64-bit)</strong>. Do NOT use the default Nougat 32-bit instance."
                  as="p"
                />
                <div className="step-callout-note danger" style={{ marginTop: '0.85rem' }}>
                  <strong>Critical:</strong> If you skip this step and use the default instance, the Offline game will crash immediately after the update download. There is no workaround — you must use Pie64.
                </div>
              </div>
            </div>

            {/* Step 03 */}
            <div className="step-card">
              <div className="step-card-num">
                <div className="step-num-badge">03</div>
              </div>
              <div className="step-card-body">
                <h3>Download the APK to your PC</h3>
                <FormattedText
                  text="Download the <strong>x86_x64</strong> APK (for emulators) using the button below. The ARM APK is for real Android phones — it will NOT work on emulators."
                  as="p"
                />
                <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <a
                    href={downloads.onlineApkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-button-primary"
                    style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem' }}
                  >
                    <Download size={14} />
                    <span>Online APK (x86 · Emulator)</span>
                    <ArrowUpRight size={14} />
                  </a>
                  <a
                    href={downloads.offlineLauncherX86Url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-button-glass"
                    style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem' }}
                  >
                    <Download size={14} />
                    <span>Offline Launcher x86 (Emulator)</span>
                    <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>
            </div>

            {/* Step 04 */}
            <div className="step-card">
              <div className="step-card-num">
                <div className="step-num-badge">04</div>
              </div>
              <div className="step-card-body">
                <h3>Install the APK via Drag &amp; Drop</h3>
                <FormattedText
                  text="Open your Pie64 BlueStacks instance. Drag the downloaded <strong>.apk</strong> file directly onto the BlueStacks window. The installer will launch automatically. Tap <strong>Install</strong> when prompted."
                  as="p"
                />
                <div className="step-callout-note" style={{ marginTop: '0.85rem' }}>
                  <strong>Alternative method:</strong> You can also go to <em>My Games → Install APK</em> in the BlueStacks sidebar and browse to the APK file.
                </div>
              </div>
            </div>

            {/* Step 05 */}
            <div className="step-card">
              <div className="step-card-num">
                <div className="step-num-badge">05</div>
              </div>
              <div className="step-card-body">
                <h3>Launch &amp; Play</h3>
                <FormattedText
                  text="Open the game from BlueStacks. For <strong>Online</strong>: sign in with Discord and let the ~220 MB game data download on Wi-Fi. For <strong>Offline</strong>: follow Chapter 03 steps — download launcher + game data through the in-app updater."
                  as="p"
                />
                <div className="step-callout-note" style={{ marginTop: '0.85rem' }}>
                  <strong>Performance tip:</strong> In BlueStacks Settings → Performance, set CPU to 4 cores and RAM to at least 3 GB for the best experience.
                </div>
              </div>
            </div>
          </div>

          {/* Emulator Feature Cards */}
          <div className="feature-cards-grid" style={{ marginTop: '2.5rem' }}>
            <div className="feature-info-card">
              <div className="feature-icon-box">
                <Monitor size={20} />
              </div>
              <h4>BlueStacks Recommended</h4>
              <FormattedText
                text="BlueStacks 5 is the most tested emulator for this game. Free, no registration required, and supports keyboard/mouse mapping."
                as="p"
              />
            </div>
            <div className="feature-info-card">
              <div className="feature-icon-box">
                <Cpu size={20} />
              </div>
              <h4>Pie64 is Mandatory</h4>
              <FormattedText
                text="Android 9 (Pie), 64-bit. The offline game crashes on Nougat 32-bit. Always create a new Pie64 instance — don't use the default."
                as="p"
              />
            </div>
            <div className="feature-info-card">
              <div className="feature-icon-box">
                <HardDrive size={20} />
              </div>
              <h4>x86 APK for Emulators</h4>
              <FormattedText
                text="Always download the x86_x64 build. ARM APKs are for real phones. Installing the wrong architecture will cause the game to immediately crash on launch."
                as="p"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="cta-button-primary"
              onClick={() => scrollTo('#fixes')}
              style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem' }}
            >
              <span>Continue to Chapter 06: Fixes &amp; Debug →</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CHAPTER 06: FIXES & TROUBLESHOOTING (Tactical Terminal Crimson Atmosphere)
          ========================================================================= */}
      <section id="fixes" className="story-section section-fixes">
        <div className="section-atmosphere-glow" />
        <div className="story-section-container">
          <div className="section-header-block">
            <div className="chapter-meta-tag">
              <Wrench size={14} />
              <span>CHAPTER 06 // SHINOBI CODEX</span>
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
          CHAPTER 07: OFFICIAL VERIFIED LINKS (Emerald Trust Atmosphere)
          ========================================================================= */}
      <section id="links" className="story-section section-links">
        <div className="section-atmosphere-glow" />
        <div className="story-section-container">
          <div className="section-header-block">
            <div className="chapter-meta-tag">
              <ShieldCheck size={14} />
              <span>CHAPTER 07 // VERIFIED CHANNELS</span>
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
                  href={downloads.officialSiteUrl}
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
                <p>{t.link_apk_sub || 'Latest Game APK'}</p>
              </div>
              <div className="link-actions-cluster">
                <a
                  href={downloads.onlineApkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="open-link-pill"
                >
                  <span>Download</span>
                  <Download size={14} />
                </a>
              </div>
            </div>

            {/* Link 3: Discord Server */}
            <div className="link-access-card">
              <div className="link-card-meta">
                <h4>Discord Server</h4>
                <p>{t.link_discord_sub || 'Official server for co-op & announcements'}</p>
              </div>
              <div className="link-actions-cluster">
                <a
                  href={downloads.discordServerUrl}
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
              <span>CHAPTER 08 // PATCH PROTOCOL</span>
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
            <div className="platform-compat-badges">
              <span className="compat-badge android"><Smartphone size={12} /> Online: Android &amp; iOS</span>
              <span className="compat-badge android"><HardDrive size={12} /> Offline: Android First</span>
              <span className="compat-badge ios"><Apple size={12} /> Offline: iOS</span>
            </div>
          </div>

          {/* Warning Note */}
          <div className="warning-strip-card" style={{ marginBottom: '2rem' }}>
            <div className="warning-icon-wrapper" style={{ color: 'var(--accent-amber)' }}>
              <AlertTriangle size={22} />
            </div>
            <FormattedText
              text={t.upd_warning || '<strong>Warning:</strong> Updating Offline can overwrite or lose your save data. Always export your save slot before running an update.'}
              as="p"
            />
          </div>

          {/* Quick Jump Bar */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="cta-button-glass"
              onClick={() => scrollTo('#upd-online')}
              style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Wifi size={13} style={{ color: 'var(--accent-blue)' }} />
              <span>Online (Android &amp; iOS)</span>
            </button>
            <button
              type="button"
              className="cta-button-glass"
              onClick={() => scrollTo('#upd-offline-android')}
              style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <HardDrive size={13} style={{ color: 'var(--accent-amber)' }} />
              <span>Offline (Android First)</span>
            </button>
            <button
              type="button"
              className="cta-button-glass"
              onClick={() => scrollTo('#upd-offline-ios')}
              style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Apple size={13} style={{ color: 'var(--accent-purple, #a78bfa)' }} />
              <span>Offline (iOS)</span>
            </button>
          </div>

          {/* Online Update Section (Android & iOS) */}
          <div id="upd-online" style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Wifi size={18} style={{ color: 'var(--accent-blue)' }} />
                {t.upd_online_h || 'Online Mode (Android & iOS) — How to Update'}
              </h3>
              <div className="platform-compat-badges" style={{ margin: 0 }}>
                <span className="compat-badge android"><Smartphone size={12} /> Android</span>
                <span className="compat-badge ios"><Apple size={12} /> iOS (Sideload)</span>
                <span className="compat-badge emulator"><Monitor size={12} /> PC Emulators</span>
              </div>
            </div>

            {/* Online In-App Auto-Patch Notice */}
            <div style={{
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
            }}>
              <Sparkles size={20} style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                  {t.upd_on_intro_title || 'Routine Updates Happen Automatically In-App (Android & iOS)'}
                </p>
                <FormattedText
                  text={
                    t.upd_on_intro_tip ||
                    '<strong>Good to know:</strong> You do <strong>not</strong> need to download a new APK or IPA for every update! Regular patches, new banners, and assets download <strong>automatically inside the game</strong> when launched. You only need to reinstall a new APK/IPA when the developers announce a <strong>major new client build</strong> on Discord.'
                  }
                  as="p"
                  style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}
                />
              </div>
            </div>

            <div className="steps-timeline-stack">
              <div className="step-card">
                <div className="step-card-num"><div className="step-num-badge">01</div></div>
                <div className="step-card-body">
                  <h3>{t.upd_on_s1_title || 'Routine In-App Updates vs. Major Client Builds'}</h3>
                  <FormattedText
                    text={
                      t.upd_on_s1_desc ||
                      '<strong>Normal updates:</strong> Just open the game on Wi-Fi — it patches automatically in seconds!<br /><strong>Major updates:</strong> When a new app version is posted on Discord, download the latest <strong>APK (Android)</strong> or <strong>IPA (iOS)</strong> using the buttons below.'
                    }
                    as="p"
                  />
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <a
                      href={downloads.onlineApkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cta-button-primary"
                      style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                    >
                      <Download size={14} />
                      <span>{t.dl_online_apk || 'Download Online APK (Android)'}</span>
                      <ArrowUpRight size={14} />
                    </a>
                    {downloads.iosOnlineIpaUrl && (
                      <a
                        href={downloads.iosOnlineIpaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cta-button-glass"
                        style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem', borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}
                      >
                        <Apple size={14} />
                        <span>Download Online IPA (iOS)</span>
                        <ArrowUpRight size={14} />
                      </a>
                    )}
                    <a
                      href={downloads.discordServerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cta-button-glass"
                      style={{ padding: '0.55rem 1.25rem', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                    >
                      <span>Discord Server</span>
                      <ArrowUpRight size={14} />
                    </a>
                  </div>
                </div>
              </div>
              <div className="step-card">
                <div className="step-card-num"><div className="step-num-badge">02</div></div>
                <div className="step-card-body">
                  <h3>{t.upd_on_s2_title || 'Install over the existing app (Android & iOS)'}</h3>
                  <FormattedText
                    text={
                      t.upd_on_s2_desc ||
                      'Install the new build directly on top of the existing app. <strong>Do NOT uninstall first!</strong><br />• <strong>Android:</strong> Open the new APK → Install anyway.<br />• <strong>iOS:</strong> Sideload the new Online IPA via SideStore or Sideloadly.<br />Your progress is linked to your Discord account on the live server and remains 100% safe.'
                    }
                    as="p"
                  />
                </div>
              </div>
              <div className="step-card">
                <div className="step-card-num"><div className="step-num-badge">03</div></div>
                <div className="step-card-body">
                  <h3>{t.upd_on_s3_title || 'Launch and download patch data'}</h3>
                  <FormattedText
                    text={
                      t.upd_on_s3_desc ||
                      'Open the game on Wi-Fi. It will connect to the server and finalize any missing assets. If a Connection Error occurs on first launch, use a free VPN (Netherlands/USA) for the initial handshake.'
                    }
                    as="p"
                  />
                  <div className="step-callout-note" style={{ marginTop: '0.75rem' }}>
                    <Wifi size={14} style={{ display: 'inline', marginRight: '0.4rem', color: 'var(--accent-blue)' }} />
                    <FormattedText
                      text={
                        t.upd_on_stuck_tip ||
                        '<strong>Stuck on loading or Connection Error?</strong> Two 100% fixes: <strong>1)</strong> Set DNS to Primary <code>8.8.8.8</code> and Secondary <code>8.8.4.4</code>. <strong>2)</strong> Or use a free VPN connected to <em>Netherlands, USA, or Japan</em> (only needed the first time to enter).'
                      }
                    />
                  </div>
                  <div style={{ marginTop: '0.75rem', padding: '0.7rem 1rem', background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.25)', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <Apple size={13} style={{ display: 'inline', marginRight: '0.4rem', color: '#38bdf8' }} />
                    <strong style={{ color: '#38bdf8' }}>iOS Reminder:</strong> Remember to connect <strong>LocalDevVPN</strong> and tap the countdown in SideStore once a week to keep the certificate fresh!
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Android Offline Update Section */}
          <div id="upd-offline-android" style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <HardDrive size={18} style={{ color: 'var(--accent-amber)' }} />
                {t.upd_offline_h || 'Offline Mode (Android) — How to Update (with Save Backup)'}
              </h3>
              <div className="platform-compat-badges" style={{ margin: 0 }}>
                <span className="compat-badge android"><Smartphone size={12} /> Android</span>
                <span className="compat-badge emulator"><Monitor size={12} /> PC Emulators</span>
              </div>
            </div>
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
                  <div className="step-callout-note warning" style={{ marginTop: '0.75rem' }}>
                    <AlertTriangle size={14} style={{ display: 'inline', marginRight: '0.4rem', color: 'var(--accent-amber)' }} />
                    <FormattedText
                      text={
                        t.upd_off_stuck_tip ||
                        '<strong>Update stuck or failing?</strong> Open Launcher → Diagnostics menu (or look for <em>Stop Game Session</em>) → tap <strong>Stop Game Session</strong> → completely close the launcher → reopen and run the update again!'
                      }
                    />
                  </div>
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
          <div id="upd-offline-ios" style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Apple size={18} style={{ color: 'var(--accent-purple, #a78bfa)' }} />
                {t.upd_ios_h || 'iOS Offline Mode — How to Update (with Save Backup)'}
              </h3>
              <div className="platform-compat-badges" style={{ margin: 0 }}>
                <span className="compat-badge ios"><Apple size={12} /> iOS</span>
              </div>
            </div>
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
          <div
            onClick={handleFooterTap}
            className="footer-credit-tap-area"
            title="TXRROT"
          >
            <FormattedText
              text={
                t.footer_credit ||
                'Site designed & built by <a href="https://github.com/txrrot" target="_blank" rel="noopener">TXRROT</a>'
              }
              as="div"
              className="footer-credit-line"
            />
          </div>
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

      {/* ADMIN TERMINAL MODAL */}
      <AnimatePresence>
        {isAdminOpen && (
          <motion.div
            className="admin-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAdminOpen(false)}
          >
            <motion.div
              className="admin-modal-card"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-header">
                <div>
                  <div className="admin-badge">
                    <Lock size={12} />
                    <span>OWNER TERMINAL</span>
                  </div>
                  <h3 className="admin-title">Manage Live Links</h3>
                  <p className="admin-sub">Actualizează linkurile de descărcare direct de pe telefon</p>
                </div>
                <button
                  type="button"
                  className="admin-close-btn"
                  onClick={() => setIsAdminOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              {!isAdminUnlocked ? (
                <form onSubmit={handlePinSubmit} className="admin-pin-box">
                  <Key size={32} color="var(--accent-amber)" />
                  <div>
                    <h4 style={{ margin: '0 0 0.3rem', color: '#fff' }}>Introdu PIN-ul Owner</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Doar TXRROT poate modifica linkurile din ghid
                    </p>
                  </div>
                  <input
                    type="password"
                    maxLength={8}
                    autoFocus
                    placeholder="••••"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="admin-pin-input"
                  />
                  {pinError && (
                    <span style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>
                      {pinError}
                    </span>
                  )}
                  <button type="submit" className="admin-submit-btn" style={{ marginTop: '0.5rem' }}>
                    Deblochează Panou
                  </button>
                </form>
              ) : (
                <div>
                  {/* GitHub Token Config Box */}
                  <div className="admin-token-box">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#60a5fa', marginBottom: '0.35rem' }}>
                      <Key size={14} />
                      <span>GitHub Token (Salvat doar pe acest telefon)</span>
                    </div>
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem' }}>
                      Pentru a publica automat pe GitHub Pages de pe telefon, lipește un Personal Access Token (Fine-grained cu <strong>Contents: Read and write</strong>).
                    </p>
                    <input
                      type="password"
                      placeholder="github_pat_..."
                      value={ghToken}
                      onChange={(e) => {
                        setGhToken(e.target.value)
                        localStorage.setItem('txrrot_gh_pat', e.target.value)
                      }}
                      className="admin-field-input"
                      style={{ fontSize: '0.78rem', padding: '0.45rem 0.65rem' }}
                    />
                  </div>

                  {/* Form fields */}
                  <div className="admin-field-group">
                    <label className="admin-field-label">
                      <Smartphone size={14} color="#3b82f6" />
                      <span>Online APK URL (Android)</span>
                    </label>
                    <input
                      type="text"
                      value={adminForm.onlineApkUrl}
                      onChange={(e) => setAdminForm({ ...adminForm, onlineApkUrl: e.target.value })}
                      placeholder="https://drive.google.com/..."
                      className="admin-field-input"
                    />
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-field-label">
                      <Smartphone size={14} color="#f59e0b" />
                      <span>Offline Launcher ARM (Telefon)</span>
                    </label>
                    <input
                      type="text"
                      value={adminForm.offlineLauncherArmUrl}
                      onChange={(e) => setAdminForm({ ...adminForm, offlineLauncherArmUrl: e.target.value })}
                      placeholder="https://drive.google.com/..."
                      className="admin-field-input"
                    />
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-field-label">
                      <Monitor size={14} color="#a855f7" />
                      <span>Offline Launcher x86 (Emulator)</span>
                    </label>
                    <input
                      type="text"
                      value={adminForm.offlineLauncherX86Url}
                      onChange={(e) => setAdminForm({ ...adminForm, offlineLauncherX86Url: e.target.value })}
                      placeholder="https://drive.google.com/..."
                      className="admin-field-input"
                    />
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-field-label">
                      <Apple size={14} color="#10b981" />
                      <span>iOS Game .ipa URL</span>
                    </label>
                    <input
                      type="text"
                      value={adminForm.iosGameIpaUrl}
                      onChange={(e) => setAdminForm({ ...adminForm, iosGameIpaUrl: e.target.value })}
                      placeholder="https://drive.google.com/..."
                      className="admin-field-input"
                    />
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-field-label">
                      <Apple size={14} color="#38bdf8" />
                      <span>iOS Online .ipa URL (Nou!)</span>
                    </label>
                    <input
                      type="text"
                      value={adminForm.iosOnlineIpaUrl || ''}
                      onChange={(e) => setAdminForm({ ...adminForm, iosOnlineIpaUrl: e.target.value })}
                      placeholder="https://drive.google.com/... (lasă gol până îl urci)"
                      className="admin-field-input"
                    />
                  </div>

                   <div className="admin-field-group">
                    <label className="admin-field-label">
                      <Apple size={14} color="#38bdf8" />
                      <span>SideStore .ipa URL</span>
                    </label>
                    <input
                      type="text"
                      value={adminForm.iosSideStoreIpaUrl}
                      onChange={(e) => setAdminForm({ ...adminForm, iosSideStoreIpaUrl: e.target.value })}
                      placeholder="https://github.com/SideStore/..."
                      className="admin-field-input"
                    />
                  </div>

                  {/* Sideloadly Downloads */}
                  <div style={{ padding: '0.6rem 0.75rem', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '8px', marginBottom: '0.25rem' }}>
                    <p style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Monitor size={12} /> Sideloadly Download URLs (per OS)
                    </p>

                    <div className="admin-field-group" style={{ marginBottom: '0.5rem' }}>
                      <label className="admin-field-label">
                        <Monitor size={13} color="#818cf8" />
                        <span>Sideloadly — Windows URL</span>
                      </label>
                      <input
                        type="text"
                        value={adminForm.sideloadlyWinUrl || ''}
                        onChange={(e) => setAdminForm({ ...adminForm, sideloadlyWinUrl: e.target.value })}
                        placeholder="https://sideloadly.io/SideloadlySetup.exe"
                        className="admin-field-input"
                      />
                    </div>

                    <div className="admin-field-group" style={{ marginBottom: '0.5rem' }}>
                      <label className="admin-field-label">
                        <Apple size={13} color="#818cf8" />
                        <span>Sideloadly — macOS URL</span>
                      </label>
                      <input
                        type="text"
                        value={adminForm.sideloadlyMacUrl || ''}
                        onChange={(e) => setAdminForm({ ...adminForm, sideloadlyMacUrl: e.target.value })}
                        placeholder="https://sideloadly.io/Sideloadly.dmg"
                        className="admin-field-input"
                      />
                    </div>

                    <div className="admin-field-group">
                      <label className="admin-field-label">
                        <Cpu size={13} color="#818cf8" />
                        <span>Sideloadly — Linux URL</span>
                      </label>
                      <input
                        type="text"
                        value={adminForm.sideloadlyLinuxUrl || ''}
                        onChange={(e) => setAdminForm({ ...adminForm, sideloadlyLinuxUrl: e.target.value })}
                        placeholder="https://sideloadly.io/Sideloadly.deb"
                        className="admin-field-input"
                      />
                    </div>
                  </div>


                  <div className="admin-field-group">
                    <label className="admin-field-label">
                      <Globe size={14} color="#6366f1" />
                      <span>Site Oficial URL</span>
                    </label>
                    <input
                      type="text"
                      value={adminForm.officialSiteUrl}
                      onChange={(e) => setAdminForm({ ...adminForm, officialSiteUrl: e.target.value })}
                      placeholder="https://blazingonline.wiki"
                      className="admin-field-input"
                    />
                  </div>

                  {adminStatus && (
                    <div className={`admin-status-bar ${adminStatus.type}`}>
                      {adminStatus.type === 'loading' && <RefreshCw size={14} className="spin" />}
                      {adminStatus.type === 'success' && <CheckCircle2 size={14} />}
                      {adminStatus.type === 'error' && <AlertTriangle size={14} />}
                      <span>{adminStatus.msg}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={adminSaving}
                    onClick={handleSaveToGitHub}
                    className="admin-submit-btn"
                  >
                    <Save size={16} />
                    <span>{adminSaving ? 'Se publică pe GitHub...' : '🚀 Salvează & Publică pe GitHub'}</span>
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
